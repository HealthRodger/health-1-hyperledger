# Setup

Start by setting up the environment (Kubernetes and Istio) by running the following command:

```
./setup_environment.sh
```

Before proceeding with the network setup, check if the envrionment is up and running:

```
kubectl wait --for=condition=available --timeout=600s deployment --all -n istio-system
```

Next, run the network setup script:

```
./setup_network.sh
```

Finally, you can check if the pods are running with:
```
kubectl get pods
```