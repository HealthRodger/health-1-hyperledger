# API

This API exposes via HTTP the operations that can be performed on the chaincode assets.

## Install libraries

```bash
npm install
```

## Launch the server for an Organisation

Launch the server for the Org1

```bash
npm run server:org1:dev
```

## Operations

The API:

Org1: http://localhost:3003


### Get all assets Org1

```bash
http POST "http://localhost:3003/evaluate" fcn=GetAllAssets 
```


### Create asset Org1

This is a generic example of asset creation, it does not create a device asset that corresponds with our chaincode

```bash
http POST "http://localhost:3003/submit" fcn=CreateAsset "args[]=AssetKey11" "args[]=Blue" "args[]=10" "args[]=4"

http POST "http://localhost:3003/evaluate" fcn=ReadAsset "args[]=AssetKey11"
```

## Revoked Users

To keep track of revoked users, their usernames are stored in the file revokedUsers.json

These are used when getting all the users, to avoid having to check whether each individual user is still valid

## Server.ts

The src/server.ts file contains the code for the server. Endpoints are included for the following:

- /signup to sign up a new user
- /users to get a list of all users
- /revoke to remove a user
- /role_check to get the role, hospital or researcher, of a user
- /login to log a user into the frontend
- /ping to ping the blockchain
- /evaluate to evaluate a transaction, for example query for a device
- /submit to submit a transaction, for example upload a device
- /create-organization to create an organization
- /disable-organization to disable and organization
- /list-organizations to list all organizations
- /disable-organization to disable a specific organization
- /create-peer to create a peer