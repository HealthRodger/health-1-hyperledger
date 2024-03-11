# Setup

## Dependencies
Before running the scripts, ensure you have the following dependencies installed:
- Docker: https://docs.docker.com/engine/install/
- Kubernetes: https://kubernetes.io/releases/download/
- kind: https://kind.sigs.k8s.io/
- helm: https://helm.sh/docs/intro/install/
- Krew: https://krew.sigs.k8s.io/docs/user-guide/setup/install/

## Running the network

Start by setting up the environment (Kubernetes and Istio) by running the following command:

```
./setup_environment.sh
```

Before proceeding with the network setup, check if the environment is up and running:

```
kubectl wait --for=condition=available --timeout=600s deployment --all -n istio-system
```

Next, run the network setup script:

```
./setup_network.sh
```
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
