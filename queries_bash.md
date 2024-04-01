# Example Ledger Queries
Some example ledger queries to get you started.
## Timestamps
1. List all devices not updated since given timestamp

```bash
# "{\"selector\": {\"LastUpdate\": {\"\$lt\": $TIMESTAMP}},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}"
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a="{\"selector\": {\"LastUpdate\": {\"\$lt\": $TIMESTAMP}},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}"
peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"LastUpdate\": {\"$lt\": $TIMESTAMP}},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}"]}'
```

2. List all devices updated since given timestamp

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"LastUpdate\": {\"$gt\": $TIMESTAMP}},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"LastUpdate\": {\"$gt\": $TIMESTAMP}},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}"]}'
```

3. List all available devices not updated since given timestamp

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"LastUpdate\": {\"\$lt\": timestamp},\"Available\": true},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"LastUpdate\": {\"$lt\": timestamp},\"Available\": true},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}"]}'
```

4. List all non-available devices not updated since given timestamp

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"LastUpdate\": {\"\$lt\": timestamp},\"Available\": false},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"LastUpdate\": {\"$lt\": timestamp},\"Available\": false},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}"]}'
```

## Departments

5. List all available devices from a given department

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"Department\": department,\"Available\": true},\"fields\": [\"ID\",\"Name\",\"Department\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"Department\": department,\"Available\": true},\"fields\": [\"ID\",\"Name\",\"Department\"]}"]}'
```


6. List all non-available devices from a given department

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"Department\": department,\"Available\": false},\"fields\": [\"ID\",\"Name\",\"Department\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"Department\": department,\"Available\": false},\"fields\": [\"ID\",\"Name\",\"Department\"]}"]}'
```
{"index":{"fields":["LastUpdate"]},"ddoc":"lastUpdateDoc", "name":"lastUpdate","type":"json"}

## Device Types

7. List all devices of a given type

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"Type\": type,},\"fields\": [\"ID\",\"Name\",\"Type\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"Type\": type,},\"fields\": [\"ID\",\"Name\",\"Type\"]}"]}'
```
<!-- 8. List the departments with the most devices of a given type XXX

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"Type\": type},\"fields\": [\"Department\",\"Type\"],\"sort\": [{\"Department\": \"asc\"}]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"Type\": type},\"fields\": [\"Department\",\"Type\"],\"sort\": [{\"Department\": \"asc\"}]}"]}'
``` -->

## Other
<!-- 
9. List the types of devices that are most commonly available XXX
    
```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"Available\": true},\"fields\": [\"Type\",\"Available\"],\"sort\": [{\"Type\": \"asc\"}]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"Available\": true},\"fields\": [\"Type\",\"Available\"],\"sort\": [{\"Type\": \"asc\"}]}"]}'
``` -->

10. List the devices that have been unavailable the longest
```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"Available\": false},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"],\"sort\": [{\"LastUpdate\": \"asc\"}]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"Available\": false},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"],\"sort\": [{\"LastUpdate\": \"asc\"}]}"]}'
```
