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
const revokedUsersFile = 'revokedUsers.json';

async function main() {

    // Check the configuration using config.ts
    checkConfig()

    // Get details of the network
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

    // Create CA services
    const fabricCAServices = new FabricCAServices(caURL, {
        trustedRoots: [ca.tlsCACerts.pem[0]],
        verify: true,
    }, ca.caName)

    // Create identity service
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
    console.log(adminUser)
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

    // Endpoint to sign up a new user
    app.post("/signup", async (req, res) => {
        const { username, password, role } = req.body; // Include role in the destructured body

        const xUserHeader = req.get('x-user'); // or use req.headers['x-user']
        console.log(xUserHeader); // Do something with the header value

        // Check that user attempting to sign someone up is an admin
        let roleCheck = (await identityService.getOne(xUserHeader, registrar)).result.type;
        if (roleCheck == 'admin') {
            // Validate the provided role, only allow role of researcher or hospital
            if (!['researcher', 'hospital'].includes(role)) {
                return res.status(400).send("Invalid role specified. Must be 'researcher' or 'hospital'.");
            }
        
            // Ensure username not taken
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
        
            // Register the new user
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
        }
        else {
            log.error("Failed to retrieve users");
            res.status(500).send("Failed to retrieve users");
        }
    });

    // Get list of all users
    app.get("/users", async (req, res) => {
        try {
            const xUserHeader = req.get('x-user'); // or use req.headers['x-user']
            console.log(xUserHeader); // Do something with the header value

            // Check that an admin is performing the operation
            let roleCheck = (await identityService.getOne(xUserHeader, registrar)).result.type;
            if (roleCheck == 'admin') {
                const identities = await identityService.getAll(registrar); // Fetch all registered identities
                const revokedUsers = JSON.parse(await fs.readFile(revokedUsersFile, 'utf8') || '{}');
                const userList = identities.result.identities.map(identity => ({
                    id: identity.id,
                    affiliation: identity.affiliation,
                    attributes: identity.attrs,
                    type: identity.type,
                    maxEnrollments: identity.maxEnrollments,
                    revoked: !!revokedUsers[identity.id]
                }));
                res.json(userList);
            }
            else {
                log.error("Failed to retrieve users");
                res.status(500).send("Failed to retrieve users");
            }
        } catch (error) {
            log.error("Failed to retrieve users:", error);
            res.status(500).send("Failed to retrieve users");
        }
    });

    // "Remove" a user by revoking their certificate
    app.post("/revoke", async (req, res) => {
        const { username } = req.body;
        try {
            const xUserHeader = req.get('x-user'); // or use req.headers['x-user']
            console.log(xUserHeader); // Do something with the header value
            let roleCheck = (await identityService.getOne(xUserHeader, registrar)).result.type;
            if (roleCheck == 'admin') {
                // Revoking the user's certificate
                const revokeResponse = await fabricCAServices.revoke({
                    enrollmentID: username,
                    // You can specify the reason as per RFC 5280
                    reason: 'cessationOfOperation',
                }, registrar);

                // Save revoked users to a file for easier checking
                const revokedUsers = JSON.parse(await fs.readFile(revokedUsersFile, 'utf8') || '{}');
                revokedUsers[username] = true;
                await fs.writeFile(revokedUsersFile, JSON.stringify(revokedUsers, null, 2));

                res.json({ message: "User revoked successfully", details: revokeResponse });
                
            }
            else {
                log.error("Failed to revoke user");
                res.status(500).send("Failed to revoke user");
            }
        } catch (error) {
            log.error("Failed to revoke user:", error);
            res.status(500).send(`Failed to revoke user: ${error.message}`);
        }
    });

    // Check the role of a user
    app.post("/role_check", async (req, res) => {
        const { username } = req.body;
    
        // Try to find the identity in the CA
        let identityFound = null;
        try {
            identityFound = await identityService.getOne(username, registrar);
        } catch (e) {
            log.info("Identity not found", e);
            return res.status(400).send("Username not found");
        }
    
        // Proceed with role check if identity is found
        let roleCheck = null;
        try {
            roleCheck = await identityService.getOne(username, registrar);
            
            let role = null;
            if (roleCheck.result.type == 'admin') {
                role = 'admin'
            }
            else {
                for(const attr_list of roleCheck.result.attrs ) {
                    if( attr_list.name == "role" ) {
                        role = attr_list.value;
                        console.log(role)
                    }
                }
            }
            res.send(role);
        } catch (e) {
            // Role check failed
            log.error("Role check failed", e);
            res.status(401).send("Role check failed");
        }
    });

    // Login a user in the frontend
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

    // Set contracts for users
    app.use(async (req, res, next) => {
        (req as any).contract = contract
        console.log(contract)
        try {
            log.info(Object.keys(users))
            const user = req.headers["x-user"] as string
            console.log(user)
            console.log(users)
            if (user && users[user]) {
                log.info(`Using user: ${user}`)
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

    // "Ping" the blockchain
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

    // Evaluate a transaction
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

    // Submit a transaction
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

    // Set up the server to be running on the provided port and address
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
