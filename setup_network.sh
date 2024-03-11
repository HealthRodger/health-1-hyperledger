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

# Environment variables
export PEER_IMAGE=hyperledger/fabric-peer
export PEER_VERSION=2.4.6
export ORDERER_IMAGE=hyperledger/fabric-orderer
export ORDERER_VERSION=2.4.6
export CA_IMAGE=hyperledger/fabric-ca
export CA_VERSION=1.5.6-beta2

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

# Channel creation
echo "Creating main channel ..."
# register orderer identity
echo "Enrolling orderer org"
kubectl hlf ca register --name=ord-ca --user=admin --secret=adminpw \
    --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP

# enroll orderer identity
kubectl hlf ca enroll --name=ord-ca --namespace=default \
    --user=admin --secret=adminpw --mspid OrdererMSP \
    --ca-name tlsca  --output resources/orderermsp.yaml

# register org1 identity
echo "Enrolling org1"
kubectl hlf ca register --name=org1-ca --namespace=default --user=admin --secret=adminpw \
    --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=Org1MSP

# enroll org1 identity
kubectl hlf ca enroll --name=org1-ca --namespace=default \
    --user=admin --secret=adminpw --mspid Org1MSP \
    --ca-name ca  --output resources/org1msp.yaml

# register org2 identity
echo "Enrolling org2"
kubectl hlf ca register --name=org2-ca --namespace=default --user=admin --secret=adminpw \
    --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=Org2MSP

# enroll org2 identity
kubectl hlf ca enroll --name=org2-ca --namespace=default \
    --user=admin --secret=adminpw --mspid Org2MSP \
    --ca-name ca  --output resources/org2msp.yaml

# Create secret
echo "Creating secret ..."
kubectl create secret generic wallet --namespace=default \
        --from-file=org1msp.yaml=$PWD/resources/org1msp.yaml \
        --from-file=org2msp.yaml=$PWD/resources/org2msp.yaml \
        --from-file=orderermsp.yaml=$PWD/resources/orderermsp.yaml

# Create channel
echo "Applying channel config"
export PEER_ORG_SIGN_CERT=$(kubectl get fabriccas org1-ca -o=jsonpath='{.status.ca_cert}')
export PEER_ORG_TLS_CERT=$(kubectl get fabriccas org1-ca -o=jsonpath='{.status.tlsca_cert}')
export IDENT_8=$(printf "%8s" "")
export ORDERER_TLS_CERT=$(kubectl get fabriccas ord-ca -o=jsonpath='{.status.tlsca_cert}' | sed -e "s/^/${IDENT_8}/" )
export ORDERER0_TLS_CERT=$(kubectl get fabricorderernodes ord-node0 -o=jsonpath='{.status.tlsCert}' | sed -e "s/^/${IDENT_8}/" )

kubectl apply -f - <<EOF
apiVersion: hlf.kungfusoftware.es/v1alpha1
kind: FabricMainChannel
metadata:
  name: demo
spec:
  name: demo
  adminOrdererOrganizations:
    - mspID: OrdererMSP
  adminPeerOrganizations:
    - mspID: Org1MSP
  channelConfig:
    application:
      acls: null
      capabilities:
        - V2_0
      policies: null
    capabilities:
      - V2_0
    orderer:
      batchSize:
        absoluteMaxBytes: 1048576
        maxMessageCount: 120
        preferredMaxBytes: 524288
      batchTimeout: 2s
      capabilities:
        - V2_0
      etcdRaft:
        options:
          electionTick: 10
          heartbeatTick: 1
          maxInflightBlocks: 5
          snapshotIntervalSize: 16777216
          tickInterval: 500ms
      ordererType: etcdraft
      policies: null
      state: STATE_NORMAL
    policies: null
  externalOrdererOrganizations: []
  peerOrganizations:
    - mspID: Org1MSP
      caName: "org1-ca"
      caNamespace: "default"
    - mspID: Org2MSP
      caName: "org2-ca"
      caNamespace: "default"
  identities:
    OrdererMSP:
      secretKey: orderermsp.yaml
      secretName: wallet
      secretNamespace: default
    Org1MSP:
      secretKey: org1msp.yaml
      secretName: wallet
      secretNamespace: default
  externalPeerOrganizations: []
  ordererOrganizations:
    - caName: "ord-ca"
      caNamespace: "default"
      externalOrderersToJoin:
        - host: ord-node0
          port: 7053
      mspID: OrdererMSP
      ordererEndpoints:
        - orderer0-ord.localho.st:443
      orderersToJoin: []
  orderers:
    - host: orderer0-ord.localho.st
      port: 443
      tlsCert: |-
${ORDERER0_TLS_CERT}
EOF

# Org1 peer join
echo "org1 peer joining channel ..."
export IDENT_8=$(printf "%8s" "")
export ORDERER0_TLS_CERT=$(kubectl get fabricorderernodes ord-node0 -o=jsonpath='{.status.tlsCert}' | sed -e "s/^/${IDENT_8}/" )

kubectl apply -f - <<EOF
apiVersion: hlf.kungfusoftware.es/v1alpha1
kind: FabricFollowerChannel
metadata:
  name: demo-org1msp
spec:
  anchorPeers:
    - host: peer0-org1.localho.st
      port: 443
  hlfIdentity:
    secretKey: org1msp.yaml
    secretName: wallet
    secretNamespace: default
  mspId: Org1MSP
  name: demo
  externalPeersToJoin: []
  orderers:
    - certificate: |
${ORDERER0_TLS_CERT}
      url: grpcs://orderer0-ord.localho.st:443
  peersToJoin:
    - name: org1-peer0
      namespace: default
EOF

# Org2 peer join
echo "org2 peer joining channel ..."
export IDENT_8=$(printf "%8s" "")
export ORDERER0_TLS_CERT=$(kubectl get fabricorderernodes ord-node0 -o=jsonpath='{.status.tlsCert}' | sed -e "s/^/${IDENT_8}/" )

kubectl apply -f - <<EOF
apiVersion: hlf.kungfusoftware.es/v1alpha1
kind: FabricFollowerChannel
metadata:
  name: demo-org2msp
spec:
  anchorPeers:
    - host: peer0-org2.localho.st
      port: 7051
  hlfIdentity:
    secretKey: org2msp.yaml
    secretName: wallet
    secretNamespace: default
  mspId: Org2MSP
  name: demo
  externalPeersToJoin: []
  orderers:
    - certificate: |
${ORDERER0_TLS_CERT}
      url: grpcs://orderer0-ord.localho.st:443
  peersToJoin:
    - name: org2-peer0
      namespace: default
EOF