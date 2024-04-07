import { connect } from '@hyperledger/fabric-gateway';

import { User } from 'fabric-common';
import { promises as fs } from 'fs';
import * as _ from "lodash";
import type { AddressInfo } from "net";
import { Logger } from "tslog";
import * as yaml from "yaml";
import { checkConfig, config } from './config';
import { newConnectOptions, newGrpcConnection } from './utils';
import FabricCAServices = require("fabric-ca-client")
import express = require("express")

const log = new Logger({ name: "assets-api" })
const cors = require('cors');


async function main() {
    checkConfig()
    const networkConfig = yaml.parse(await fs.readFile(config.networkConfigPath, 'utf8'));
    const orgPeerNames = _.get(networkConfig, `organizations.${config.mspID}.peers`)
    if (!orgPeerNames) {
        throw new Error(`Organization ${config.mspID} doesn't have any peers`);
    }
    let peerUrl: string = "";
    let peerCACert: string = "";
    let idx = 0
    for (const peerName of orgPeerNames) {
        const peer = networkConfig.peers[peerName]
        const peerUrlKey = `url`
        const peerCACertKey = `tlsCACerts.pem`
        peerUrl = _.get(peer, peerUrlKey).replace("grpcs://", "")
        peerCACert = _.get(peer, peerCACertKey)
        idx++;
        if (idx >= 1) {
            break;
        }
    }
    if (!peerUrl || !peerCACert) {
        throw new Error(`Organization ${config.mspID} doesn't have any peers`);
    }
    const ca = networkConfig.certificateAuthorities[config.caName]
    if (!ca) {
        throw new Error(`Certificate authority ${config.caName} not found in network configuration`);
    }
    const caURL = ca.url;
    if (!caURL) {
        throw new Error(`Certificate authority ${config.caName} does not have a URL`);
    }

    const fabricCAServices = new FabricCAServices(caURL, {
        trustedRoots: [ca.tlsCACerts.pem[0]],
        verify: true,
    }, ca.caName)

    const identityService = fabricCAServices.newIdentityService()
    const registrarUserResponse = await fabricCAServices.enroll({
        enrollmentID: ca.registrar.enrollId,
        enrollmentSecret: ca.registrar.enrollSecret
    });

    const registrar = User.createUser(
        ca.registrar.enrollId,
        ca.registrar.enrollSecret,
        config.mspID,
        registrarUserResponse.certificate,
        registrarUserResponse.key.toBytes()
    );


    const adminUser = _.get(networkConfig, `organizations.${config.mspID}.users.${config.hlfUser}`)
    const userCertificate = _.get(adminUser, "cert.pem")
    const userKey = _.get(adminUser, "key.pem")
    if (!userCertificate || !userKey) {
        throw new Error(`User ${config.hlfUser} not found in network configuration`);
    }
    const grpcConn = await newGrpcConnection(peerUrl, Buffer.from(peerCACert))
    const connectOptions = await newConnectOptions(
        grpcConn,
        config.mspID,
        Buffer.from(userCertificate),
        userKey
    )
    const gateway = connect(connectOptions);
    const network = gateway.getNetwork(config.channelName);
    const contract = network.getContract(config.chaincodeName);
    const app = express();
    // Enable CORS and allow the custom "x-user" header
    app.use(cors({
        origin: '*', // You might want to specify the exact origin for security
        methods: ['GET', 'POST', 'OPTIONS'], // Add any other methods needed
        allowedHeaders: ['Content-Type', 'x-user'],
    }));
    app.use(express.json());
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    const users = {}
    app.post("/signup", async (req, res) => {
        const { username, password, role } = req.body; // Include role in the destructured body
    
        // Validate the provided role
        if (!['researcher', 'hospital'].includes(role)) {
            return res.status(400).send("Invalid role specified. Must be 'researcher' or 'hospital'.");
        }
    
        let identityFound = null;
        try {
            identityFound = await identityService.getOne(username, registrar);
        } catch (e) {
            log.info("Identity not found, registering", e);
        }
        if (identityFound) {
            res.status(400).send("Username already taken");
            return;
        }
    
        await fabricCAServices.register({
            enrollmentID: username,
            enrollmentSecret: password,
            affiliation: "", // Specify affiliation if applicable
            role: "client", // This is usually the role within the CA and not your application role
            attrs: [
                {
                    name: 'role', // Use the attribute name that your chaincode will check
                    value: role,
                    ecert: true, // Include this attribute in the enrollment certificate
                },
            ],
            maxEnrollments: -1,
        }, registrar);
    
        res.send("OK");
    });
    app.post("/login", async (req, res) => {
        const { username, password } = req.body;
    
        // Try to find the identity in the CA
        let identityFound = null;
        try {
            identityFound = await identityService.getOne(username, registrar);
        } catch (e) {
            log.info("Identity not found", e);
            return res.status(400).send("Username not found");
        }
    
        // Proceed with enrollment if the identity is found
        try {
            const enrollmentResponse = await fabricCAServices.enroll({
                enrollmentID: username,
                enrollmentSecret: password,
            });
    
            // Enrollment was successful
            console.log("Login response:");
            console.log(enrollmentResponse);
    
            // Store user information (consider security implications of what is stored)
            users[username] = enrollmentResponse;
    
            res.send("OK");
        } catch (e) {
            // Enrollment failed - likely due to incorrect credentials
            log.error("Failed to enroll user", e);
            res.status(401).send("Login failed: Incorrect username or password");
        }
    });
    app.use(async (req, res, next) => {
        (req as any).contract = contract
        console.log(contract)
        try {
            log.info(Object.keys(users))
            const user = req.headers["x-user"] as string
            console.log(user)
            console.log(users)
            if (user && users[user]) {
                console.log("a")
                log.info(`utilizando usuario ${user}`)
                const connectOptions = await newConnectOptions(
                    grpcConn,
                    config.mspID,
                    Buffer.from(users[user].certificate),
                    users[user].key.toBytes()
                )
                const gateway = connect(connectOptions);
                const network = gateway.getNetwork(config.channelName);
                const contract = network.getContract(config.chaincodeName);
                (req as any).contract = contract
            }
            next()
        } catch (e) {
            log.error(e)
            next(e)
        }
    })
    app.get("/ping", async (req, res) => {
        try {
            const responseBuffer = await (req as any).contract.evaluateTransaction("Ping");
            const responseString = Buffer.from(responseBuffer).toString();
            res.send(responseString);
        } catch (e) {
            res.status(400)
            res.send(e.details && e.details.length ? e.details : e.message);
        }
    })

    app.post("/evaluate", async (req, res) => {
        try {
            const fcn = req.body.fcn
            const responseBuffer = await (req as any).contract.evaluateTransaction(fcn, ...(req.body.args || []));
            const responseString = Buffer.from(responseBuffer).toString();
            res.send(responseString);
        } catch (e) {
            res.status(400)
            res.send(e.details && e.details.length ? e.details : e.message);
        }
    })

    app.post("/submit", async (req, res) => {
        try {
            const fcn = req.body.fcn
            const responseBuffer = await (req as any).contract.submitTransaction(fcn, ...(req.body.args || []));
            const responseString = Buffer.from(responseBuffer).toString();
            res.send(responseString);
        } catch (e) {
            res.status(400)
            res.send(e.details && e.details.length ? e.details : e.message);
        }
    })

    const server = app.listen(
        {
            port: process.env.PORT || 3003,
            host: process.env.HOST || "0.0.0.0",
        },
        () => {
            const addressInfo: AddressInfo = server.address() as AddressInfo;
            console.log(`
        Server is running!
        Listening on ${addressInfo.address}:${addressInfo.port}
      `);
        }
    );

}


main()
