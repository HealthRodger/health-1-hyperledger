#!/bin/bash

# Colorize the output
echo_cyan() {
    msg="# $1 #"
    echo -e "\e[36m$msg\e[0m"
}

# Get parameters for: version and sequence
while getopts "v:s:" opt; do
    case ${opt} in
        v )
            VERSION=$OPTARG
            ;;
        s )
            SEQUENCE=$OPTARG
            ;;
        \? )
            echo "Usage: deployCC.sh -v <version> -s <sequence>"
            exit 1
            ;;
    esac
done

echo_cyan "Warning: This script assumes the following conditions:
- The network is up and running
- The network has a channel named 'demo'
- The network has two organizations: Org1 and Org2, each with two peers (default channel config)"
echo

echo "The sequence number must be greater than the last sequence number. You can check the last sequence number by running the following command:
kubectl hlf chaincode querycommitted --config=resources/network.yaml --user=admin --peer=org1-peer0.default --channel=demo"
echo

echo "Using the following parameters:"
echo "Version: $VERSION"
echo "Sequence: $SEQUENCE"

# Confirmation
read -p "Do you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Exiting..."
    exit 1
fi

echo_cyan "Creating metadata file..."

# remove the code.tar.gz chaincode.tgz if they exist
rm code.tar.gz chaincode.tgz
CHAINCODE_NAME=asset
CHAINCODE_LABEL=asset
cat << METADATA-EOF > "metadata.json"
{
    "type": "ccaas",
    "label": "${CHAINCODE_LABEL}"
}
METADATA-EOF



echo_cyan "Preparing connection file..."

## chaincode as a service
cat > "connection.json" <<CONN_EOF
{
  "address": "${CHAINCODE_NAME}:7052",
  "dial_timeout": "10s",
  "tls_required": false
}
CONN_EOF

tar cfz code.tar.gz connection.json
tar cfz chaincode.tgz metadata.json code.tar.gz
PACKAGE_ID=$(kubectl hlf chaincode calculatepackageid --path=chaincode.tgz --language=node --label=$CHAINCODE_LABEL)
echo "PACKAGE_ID=$PACKAGE_ID"

kubectl hlf chaincode install --path=./chaincode.tgz \
    --config=resources/network.yaml --language=golang --label=$CHAINCODE_LABEL --user=admin --peer=org1-peer0.default
kubectl hlf chaincode install --path=./chaincode.tgz \
    --config=resources/network.yaml --language=golang --label=$CHAINCODE_LABEL --user=admin --peer=org1-peer1.default


kubectl hlf chaincode install --path=./chaincode.tgz \
    --config=resources/network.yaml --language=golang --label=$CHAINCODE_LABEL --user=admin --peer=org2-peer0.default
kubectl hlf chaincode install --path=./chaincode.tgz \
    --config=resources/network.yaml --language=golang --label=$CHAINCODE_LABEL --user=admin --peer=org2-peer1.default



echo_cyan "Building chaincode docker image..."
IMAGE="kfsoftware/asset-transfer-basic-ts:latest"
docker build -t $IMAGE --file=./asset-transfer-basic/Dockerfile ./asset-transfer-basic
kind load docker-image $IMAGE



echo_cyan "Deploying chaincode container on cluster..."
kubectl hlf externalchaincode sync --image=$IMAGE \
    --name=$CHAINCODE_NAME \
    --namespace=default \
    --package-id=$PACKAGE_ID \
    --tls-required=false \
    --replicas=1

echo_cyan "Checking installed chaincodes..."
kubectl hlf chaincode queryinstalled --config=resources/network.yaml --user=admin --peer=org1-peer0.default

echo_cyan "Approving chaincode for Org1..."
kubectl hlf chaincode approveformyorg --config=resources/network.yaml --user=admin --peer=org1-peer0.default \
    --package-id=$PACKAGE_ID \
    --version "$VERSION" --sequence "$SEQUENCE" --name=asset \
    --policy="AND('Org1MSP.member', 'Org2MSP.member')" --channel=demo

echo_cyan "Approving chaincode for Org2..."
kubectl hlf chaincode approveformyorg --config=resources/network.yaml --user=admin --peer=org2-peer0.default \
    --package-id=$PACKAGE_ID \
    --version "$VERSION" --sequence "$SEQUENCE" --name=asset \
    --policy="AND('Org1MSP.member', 'Org2MSP.member')" --channel=demo

echo_cyan "Committing chaincode..."
kubectl hlf chaincode commit --config=resources/network.yaml --user=admin --mspid=Org1MSP \
    --version "$VERSION" --sequence "$SEQUENCE" --name=asset \
    --policy="AND('Org1MSP.member', 'Org2MSP.member')" --channel=demo

echo_cyan "Chaincode deployed successfully!"