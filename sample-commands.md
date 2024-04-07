# Sample commands to interact with the network

## Get contract info
```bash
kubectl hlf chaincode query --config=resources/network.yaml \
    --user=admin --peer=org1-peer0.default 
    --chaincode=asset --channel=demo \
    --fcn=GetContractInfo
```

## Get all assets
```bash
kubectl hlf chaincode query --config=resources/network.yaml \
    --user=admin --peer=org1-peer0.default \
    --chaincode=asset --channel=demo \
    --fcn=GetAllAssets
```

## Create an asset
```bash
kubectl hlf chaincode invoke --config=resources/network.yaml \
    --user=admin --peer=org1-peer0.default \
    --chaincode=asset --channel=demo \
    --fcn=CreateAsset \
    -a="assetid1" \
    -a="assetname1" \
    -a="Wearable" \
    -a="0.0.0.0" \
    -a="true" \
    -a="0" \
    -a="true" \
    -a="-" \
    -a="Meander" \
    -a="Radiology" \
    -a="Jaylan"
```

## Read an asset
```bash
kubectl hlf chaincode query --config=resources/network.yaml \
    --user=admin --peer=org1-peer0.default \
    --chaincode=asset --channel=demo \
    --fcn=ReadAsset -a="assetid1"
```

## Query assets
```bash
kubectl hlf chaincode query --config=resources/network.yaml \
    --user=admin --peer=org1-peer0.default \
    --chaincode=asset --channel=demo \
    --fcn=QueryAssets -a="{\"selector\":{\"ID\": \"assetid1\"}, \"fields\": [\"IpAddress\"]}"
```

## Update an asset
```bash
kubectl hlf chaincode invoke --config=resources/network.yaml \
    --user=admin --peer=org1-peer0.default \
    --chaincode=asset --channel=demo \
    --fcn=UpdateAsset \
    -a="assetid1" \
    -a="newassetname" \
    -a="Not wearable" \
    -a="1.1.1.1" \
    -a="false" \
    -a="1" \
    -a="false" \
    -a="Amersfoort" \
    -a="Elizabeth" \
    -a="Oncology" \
    -a="Roderick"
```   

## Delete an asset
```bash
kubectl hlf chaincode invoke --config=resources/network.yaml \
    --user=admin --peer=org1-peer0.default \
    --chaincode=asset --channel=demo \
    --fcn=DeleteAsset -a="assetid1"
```