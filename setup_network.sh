#!/bin/bash


set -eo pipefail

# Function to wait for full depoyment of CA
wait_for_fabricca_ready() {
  local ca_name=$1
  local timeout=$2
  local start_time=$(date +%s)

  echo "Waiting for FabricCA '${ca_name}' to be ready..."
  while true; do
    # Check the 'status' field for the value 'RUNNING'
    if kubectl get fabriccas.hlf.kungfusoftware.es $ca_name -o jsonpath='{.status.status}' 2>/dev/null | grep -qw "RUNNING"; then
      echo "FabricCA '${ca_name}' is ready."
      break
    fi

    # Check for timeout
    local current_time=$(date +%s)
    if [ $((current_time - start_time)) -ge $timeout ]; then
      echo "Timeout while waiting for FabricCA '${ca_name}' to become ready."
      exit 1
    fi

    # Wait before checking again
    sleep 5
  done
}

# Configure Internal DNS
echo "Configuring Internal DNS..."
CLUSTER_IP=$(kubectl -n istio-system get svc istio-ingressgateway -o jsonpath='{.spec.clusterIP}')
kubectl apply -f - <<EOF
kind: ConfigMap
apiVersion: v1
metadata:
  name: coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        errors
        health {
           lameduck 5s
        }
        rewrite name regex (.*)\.localho\.st host.ingress.internal
        hosts {
          ${CLUSTER_IP} host.ingress.internal
          fallthrough
        }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
           pods insecure
           fallthrough in-addr.arpa ip6.arpa
           ttl 30
        }
        prometheus :9153
        forward . /etc/resolv.conf {
           max_concurrent 1000
        }
        cache 30
        loop
        reload
        loadbalance
    }
EOF

# Deploy a CA for Org1MSP
echo "Deploying CA for Org1MSP..."
kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=standard --capacity=1Gi --name=org1-ca \
    --enroll-id=enroll --enroll-pw=enrollpw --hosts=org1-ca.localho.st --istio-port=443

# Wait for CA for Org1MSP to be running
wait_for_fabricca_ready "org1-ca" 300

# register user in CA for peers
echo "Registering user in CA"
kubectl hlf ca register --name=org1-ca --user=peer --secret=peerpw --type=peer \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org1MSP

# Deploy peer for Org1MSP
echo "Deploying one peer for Org1MSP..."
kubectl hlf peer create --statedb=couchdb --image=$PEER_IMAGE --version=$PEER_VERSION --storage-class=standard --enroll-id=peer --mspid=Org1MSP \
        --enroll-pw=peerpw --capacity=5Gi --name=org1-peer0 --ca-name=org1-ca.default \
        --hosts=peer0-org1.localho.st --istio-port=443


# Org 2 stuff
echo "Deploying CA for Org2MSP..."
kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=standard --capacity=1Gi --name=org2-ca \
    --enroll-id=enroll --enroll-pw=enrollpw --hosts=org2-ca.localho.st --istio-port=443

wait_for_fabricca_ready "org2-ca" 300

kubectl hlf ca register --name=org2-ca --user=peer --secret=peerpw --type=peer \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org2MSP

echo "Deploying one peer for Org2MSP..."
kubectl hlf peer create --statedb=couchdb --image=$PEER_IMAGE --version=$PEER_VERSION --storage-class=standard --enroll-id=peer --mspid=Org2MSP \
        --enroll-pw=peerpw --capacity=5Gi --name=org2-peer0 --ca-name=org2-ca.default \
        --hosts=peer0-org2.localho.st --istio-port=443

# Orderer stuff
kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=standard --capacity=1Gi --name=ord-ca \
    --enroll-id=enroll --enroll-pw=enrollpw --hosts=ord-ca.localho.st --istio-port=443

wait_for_fabricca_ready "ord-ca" 300

kubectl hlf ca register --name=ord-ca --user=orderer --secret=ordererpw \
    --type=orderer --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP --ca-url="https://ord-ca.localho.st:443"

kubectl hlf ordnode create --image=$ORDERER_IMAGE --version=$ORDERER_VERSION \
    --storage-class=standard --enroll-id=orderer --mspid=OrdererMSP \
    --enroll-pw=ordererpw --capacity=2Gi --name=ord-node0 --ca-name=ord-ca.default \
    --hosts=orderer0-ord.localho.st --istio-port=443

