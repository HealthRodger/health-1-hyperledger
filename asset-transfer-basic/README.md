# Asset transfer basic
This directory stores all the artifacts for the chaincode. The chaincode is written in Typescript and uses the Fabric Contract API.

## Prerequisites
- [Node.js](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Usage
To run the chaincode, you need to package the chaincode and install it on the peer. This is specific to the framework you are using. To see our chaincode deployment instructions, refer to ``../deployCC.sh``.

## Development
The ``/src`` directory contains the chaincode logic. 
For more information on chaincode development, refer to the [Fabric Contract API documentation](https://hyperledger-fabric.readthedocs.io/en/release-2.5/deploy_chaincode.html).