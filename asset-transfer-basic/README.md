# Asset transfer basic
This directory stores all the artifacts for the chaincode. The chaincode is written in Typescript and uses the Fabric Contract API.

## Prerequisites
- [Node.js](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Usage
To run the chaincode, you need to package the chaincode and install it on the peer. This is specific to the framework you are using. To see our chaincode deployment instructions, refer to ``../tutorial.md``.

## Development
The ``/src`` directory contains the chaincode logic. 
For more information on chaincode development, refer to the [Fabric Contract API documentation](https://hyperledger-fabric.readthedocs.io/en/release-2.5/deploy_chaincode.html).

## Interface
The chaincode exposes the following functions:

```typescript
// CreateAsset issues a new asset to the world state with given details.
public async CreateAsset(
    id: string,
    name: string,
    type: string,
    ipAddress: string,
    available: boolean,
    lastUpdate: number,
    isWearable: boolean,
    gpsLocation: string,
    hospital: string,
    department: string,
    contactPerson: string
): Promise<void> {};

// UpdateAsset updates an existing asset in the world state with provided parameters.
public async UpdateAsset(
    id: string,
    name: string,
    type: string,
    ipAddress: string,
    available: boolean,
    lastUpdate: number,
    isWearable: boolean,
    gpsLocation: string,
    hospital: string,
    department: string,
    contactPerson: string
): Promise<void> {};

// DeleteAsset deletes an given asset from the world state.
public async DeleteAsset(ctx: Context, id: string): Promise<void> {};

// TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
public async TransferAsset(
    ctx: Context,
    id: string,
    newOwner: string
): Promise<string> {};

// ReadAsset returns the asset stored in the world state with given id.
public async ReadAsset(ctx: Context, id: string): Promise<string> {};

// GetAllAssets returns all assets found in the world state.
public async GetAllAssets(ctx: Context): Promise<string> {};

public async QueryAssets(ctx: Context, queryString: string): Promise<string> {};

```