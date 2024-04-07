# Setup

## Dependencies
Before running the scripts, ensure you have the following dependencies installed:
- Docker: https://docs.docker.com/engine/install/
- Kubernetes: https://kubernetes.io/releases/download/
- kind: https://kind.sigs.k8s.io/
- helm: https://helm.sh/docs/intro/install/
- Krew: https://krew.sigs.k8s.io/docs/user-guide/setup/install/

## Running the network

Follow the instructions in the [Tutorial](tutorial-ledger-queries.md) to set up the network.

This script will set up a HyperLedger Fabric network with:
- Two peer organizations with a CA each
  - One peer per organization
- One orderer organization with a CA
  - One orderer in the orderer organization
- A main channel

Finally, you can check if the pods are running with:
```
kubectl get pods
```

## Development

Back-end for the GUI is written in Node.js and Express.js, and can be found in ``/client``. 
The front-end is written in React.js using Material UI and can be found in ``/health-rodger-frontend``.
Chaincode is written in Typescript and can be found in ``/asset-transfer-basic``.

Using the default network configuration, the following scripts are available as QoL tools:

- `./deployCC.sh`: Deploys the current chaincode to the network
- `./test-network.sh`: Runs shallow network tests to ensure the network is running and chaincode is performing as expected
- `./sample-commands.sh`: Contains sample commands to interact with the network
