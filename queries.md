# Example Ledger Queries
Some example ledger queries to get you started.
## Timestamps
1. List all devices not updated since given timestamp

```js
const timestamp;

{
  "selector": {
    "LastUpdate": {
      "$lt": timestamp
    }
  },
  "fields": [
    "ID",
    "Name",
    "LastUpdate"
  ]
}
```
```bash
# "{\"selector\": {\"LastUpdate\": {\"\$lt\": $TIMESTAMP}},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}"
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a="{\"selector\": {\"LastUpdate\": {\"\$lt\": $TIMESTAMP}},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}"
peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"LastUpdate\": {\"$lt\": $TIMESTAMP}},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}"]}'
```

2. List all devices updated since given timestamp

```js
const timestamp;

{
  "selector": {
    "LastUpdate": {
      "$gt": timestamp
    }
  },
  "fields": [
    "ID",
    "Name",
    "LastUpdate"
  ]
}
```

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"LastUpdate\": {\"$gt\": $TIMESTAMP}},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"LastUpdate\": {\"$gt\": $TIMESTAMP}},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}"]}'
```

3. List all available devices not updated since given timestamp

```js
const timestamp;

{
  "selector": {
    "LastUpdate": {
      "$lt": timestamp
    },
    "Available": true
  },
  "fields": [
    "ID",
    "Name",
    "LastUpdate"
  ]
}
```
```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"LastUpdate\": {\"\$lt\": timestamp},\"Available\": true},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"LastUpdate\": {\"$lt\": timestamp},\"Available\": true},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}"]}'
```

4. List all non-available devices not updated since given timestamp

```js
const timestamp;

{
  "selector": {
    "LastUpdate": {
      "$lt": timestamp
    },
    "Available": false
  },
  "fields": [
    "ID",
    "Name",
    "LastUpdate"
  ]
}
```

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"LastUpdate\": {\"\$lt\": timestamp},\"Available\": false},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"LastUpdate\": {\"$lt\": timestamp},\"Available\": false},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"]}"]}'
```

## Departments

5. List all available devices from a given department

```js
const department;

{
  "selector": {
    "Department": department,
    "Available": true
  },
  "fields": [
    "ID",
    "Name",
    "Department"
  ]
}
```

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"Owner.Department\": department,\"Available\": true},\"fields\": [\"ID\",\"Name\",\"Owner.Department\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"Owner.Department\": department,\"Available\": true},\"fields\": [\"ID\",\"Name\",\"Owner.Department\"]}"]}'
```


6. List all non-available devices from a given department

```js
const department;

{
  "selector": {
    "Department": department,
    "Available": false
  },
  "fields": [
    "ID",
    "Name",
    "Department"
  ]
}
```

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"Owner.Department\": department,\"Available\": false},\"fields\": [\"ID\",\"Name\",\"Owner.Department\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"Owner.Department\": department,\"Available\": false},\"fields\": [\"ID\",\"Name\",\"Owner.Department\"]}"]}'
```

## Device Types

7. List all devices of a given type

```js
const type;

{
  "selector": {
    "Type": type,
  },
  "fields": [
    "ID",
    "Name",
    "Type"
  ]
}
```

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"Type\": type,},\"fields\": [\"ID\",\"Name\",\"Type\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"Type\": type,},\"fields\": [\"ID\",\"Name\",\"Type\"]}"]}'
```

8. List the devices of a given type in a given hospital

```js
const type;
const hospital;

{
  "selector": {
    "Type": type,
    "Owner.Hospital": hospital
  },
  "fields": [
    "ID",
    "Available"
  ],
}
```

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"Type\": type,\"Owner.Hospital\": hospital},\"fields\": [\"ID\",\"Available\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"Type\": type, \"Owner.Hospital\": hospital},\"fields\": [\"ID\",\"Available\"]}"]}'
```

9. List all devices in a specific department of a specific hospital

```js
const department;
const hospital;

{
  "selector": {
    "Owner.Hospital": hospital,
    "Owner.Department": department
  },
  "fields": [
    "ID",
    "Name"
  ]
}
```

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"Owner.Hospital\": hospital, \"Owner.Department\": department},\"fields\": [\"ID\",\"Name\"]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"Owner.Hospital\": hospital, \"Owner.Department\": department},\"fields\": [\"ID\",\"Name\"]}"]}'
```

## Other

10. List the devices that have been unavailable the longest
```js
{
    "selector": {
        "Available": false
    },
    "fields": [
        "ID",
        "Name",
        "LastUpdate"
    ],
    "sort": [
        {
        "LastUpdate": "asc"
        }
    ]
}
```

```bash
kubectl hlf chaincode query --config=resources/network.yaml     --user=admin --peer=org1-peer0.default     --chaincode=asset --channel=demo     --fcn=QueryAssets -a='{\"selector\": {\"Available\": false},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"],\"sort\": [{\"LastUpdate\": \"asc\"}]}'

peer chaincode query -C mychannel -n ledger -c '{"function":"QueryAssets","Args":["{\"selector\": {\"Available\": false},\"fields\": [\"ID\",\"Name\",\"LastUpdate\"],\"sort\": [{\"LastUpdate\": \"asc\"}]}"]}'
```