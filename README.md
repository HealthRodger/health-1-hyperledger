# Setup

## Dependencies
Before running the scripts, ensure you have the following dependencies installed:
- Docker: https://docs.docker.com/engine/install/
- Kubernetes: https://kubernetes.io/releases/download/
- kind: https://kind.sigs.k8s.io/
- helm: https://helm.sh/docs/intro/install/
- Krew: https://krew.sigs.k8s.io/docs/user-guide/setup/install/

## Running the network

Follow the instructions in the [Tutorial](tutorial.md) to set up the network.

This script will set up a HyperLedger Fabric network with:
- Two peer organizations with a CA each
  - One peer per organization
- One orderer organization with a CA
  - One orderer in the orderer organization
- A main channel

Org1 will be considered the Network Admin Organization and is specifically there to manage the network. 
Org2 is an example of a peer organization that can interact with the network.

Finally, you can check if the pods are running with:
```
kubectl get pods
```

## Development

Back-end for the GUI is written in Node.js and Express.js, and can be found in ``/client``. 
The front-end is written in React.js using Material UI and can be found in ``/health-rodger-frontend``.
Chaincode is written in Typescript and can be found in ``/asset-transfer-basic``.