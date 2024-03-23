
# create network.yaml
kubectl hlf inspect -c=demo --output resources/network.yaml -o Org1MSP -o Org2MSP -o OrdererMSP

kubectl hlf ca register --name=org1-ca --user=admin --secret=adminpw --type=admin \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org1MSP

kubectl hlf ca enroll --name=org1-ca --user=admin --secret=adminpw --mspid Org1MSP \
        --ca-name ca  --output resources/peer-org1.yaml

kubectl hlf utils adduser --userPath=resources/peer-org1.yaml --config=resources/network.yaml --username=admin --mspid=Org1MSP

kubectl hlf ca register --name=org2-ca --user=admin --secret=adminpw --type=admin \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org2MSP

kubectl hlf ca enroll --name=org2-ca --user=admin --secret=adminpw --mspid Org2MSP \
        --ca-name ca  --output resources/peer-org2.yaml

kubectl hlf utils adduser --userPath=resources/peer-org2.yaml --config=resources/network.yaml --username=admin --mspid=Org2MSP

rm code.tar.gz chaincode.tgz
export CHAINCODE_NAME=asset
export CHAINCODE_LABEL=asset
cat << METADATA-EOF > "metadata.json"
{
    "type": "ccaas",
    "label": "${CHAINCODE_LABEL}"
}
METADATA-EOF

cat > "connection.json" <<CONN_EOF
{
  "address": "${CHAINCODE_NAME}:7052",
  "dial_timeout": "10s",
  "tls_required": false
}
CONN_EOF

tar cfz code.tar.gz connection.json
tar cfz chaincode.tgz metadata.json code.tar.gz
export PACKAGE_ID=$(kubectl hlf chaincode calculatepackageid --path=chaincode.tgz --language=node --label=$CHAINCODE_LABEL)
echo "PACKAGE_ID=$PACKAGE_ID"

kubectl hlf chaincode install --path=./chaincode.tgz \
    --config=resources/network.yaml --language=golang --label=$CHAINCODE_LABEL --user=admin --peer=org1-peer0.default

kubectl hlf chaincode install --path=./chaincode.tgz \
    --config=resources/network.yaml --language=golang --label=$CHAINCODE_LABEL --user=admin --peer=org2-peer0.default

