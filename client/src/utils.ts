import { ConnectOptions, Identity, Signer, signers } from '@hyperledger/fabric-gateway';

import * as grpc from '@grpc/grpc-js';
import * as crypto from 'crypto';

// Create new gRPC connection with provided tls credentials
export async function newGrpcConnection(peerEndpoint: string, tlsRootCert: Buffer): Promise<grpc.Client> {
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {});
}

// Set options for the connection
export async function newConnectOptions(
    client: grpc.Client,
    mspId: string,
    credentials: Uint8Array,
    privateKeyPem: string
): Promise<ConnectOptions> {
    return {
        client,
        identity: await newIdentity(mspId, credentials),
        signer: await newSigner(privateKeyPem),
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    };
}

// Create new identity for the msp
export async function newIdentity(mspId: string, credentials: Uint8Array): Promise<Identity> {

    return { mspId, credentials };
}

// Create new private key signer
export async function newSigner(privateKeyPem: string): Promise<Signer> {
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}
