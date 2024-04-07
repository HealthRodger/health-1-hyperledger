#!/bin/bash

# Colorize the output
echo_cyan() {
    msg="# $1 #"
    edge=$(printf '%*s' "${#msg}" '' | tr ' ' '#')
    echo -e "\e[36m$edge\e[0m"
    echo -e "\e[36m$msg\e[0m"
    echo -e "\e[36m$edge\e[0m"
}

echo_red() {
    echo -e "\e[31m$1\e[0m"
}

echo_green() {
    echo -e "\e[32m$1\e[0m"
}

# Function to perform an assertion
assert_equal() {
    if [[ "$1" == "$2" ]]; then
        echo_green "Test passed: Expected output '$2' matches actual output '$1'"
        echo
    else
        echo_red "Test failed: Expected output '$2' does not match actual output '$1'"
        echo
        echo_red "Attempting clean up..."
        kubectl hlf chaincode invoke --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=DeleteAsset -a="assetid1"
        echo "Clean up complete"
        exit 1
    fi
}

assert_output_contains() {
    actual_output="$1"
    expected_output="$2"

    if [[ "$actual_output" == *"$expected_output"* ]]; then
        echo_green "Test passed: Output contains '$expected_output'"
        echo_green "Full output: $actual_output"
        echo
    else
        echo_red "Test failed: Output does not contain '$expected_output'"
        echo_red "Actual output: $actual_output"
        echo
        echo_red "Attempting clean up..."
        kubectl hlf chaincode invoke --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=DeleteAsset -a="assetid1"
        echo "Clean up complete"
        exit 1
    fi
}

echo_cyan "Warning: This script will create an asset in the database. It will be deleted at the end of the script. 
If you have any important data in the database, please back it up before continuing.
This script also assumes the following conditions:
- The network is up and running
- The chaincode (specifically the chaincode for the health project) is installed and instantiated
- Organization 1 is authorized to create assets
- Organization 2 is not authorized to create assets
- The channel configuration is set up as default (two peers per organization)
- The chaincode is set up as default (named "asset")"

echo

# If the assertion passes, the script will continue execution.
# If it fails, the script will exit with status code 1.

echo_cyan "GetAllAssets on empty db"
# Execute your CLI command and capture the output
actual_output=$(kubectl hlf chaincode query --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=GetAllAssets)
# Define the expected output
expected_output="[]"
# Perform assertion
assert_equal "$actual_output" "$expected_output"

echo_cyan "CreateAsset as org2 (unauthorized)"
actual_output=$(kubectl hlf chaincode invoke --config=resources/network.yaml --user=admin --peer=org2-peer0.default --chaincode=asset --channel=demo --fcn=CreateAsset -a="assetid1" -a="assetname1" -a="Wearable" -a="0.0.0.0" -a="true" -a="0" -a="true" -a="-" -a="Meander" -a="Radiology" -a="Jaylan" 2>&1 >/dev/null)
expected_output="Description: Client is not authorized to create an asset"
assert_output_contains "$actual_output" "$expected_output"

echo_cyan "CreateAsset as org1 (authorized)"
actual_output=$(kubectl hlf chaincode invoke --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=CreateAsset -a="assetid1" -a="assetname1" -a="Wearable" -a="0.0.0.0" -a="true" -a="0" -a="true" -a="-" -a="Meander" -a="Radiology" -a="Jaylan")
expected_output="" # No error message
assert_equal "$actual_output" "$expected_output"

echo_cyan "GetAllAssets on db with one asset"
actual_output=$(kubectl hlf chaincode query --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=GetAllAssets)
expected_output='[{"Available":true,"GPSLocation":"-","ID":"assetid1","IpAddress":"0.0.0.0","IsWearable":true,"LastUpdate":0,"Name":"assetname1","Owner":{"ContactPerson":"Jaylan","Department":"Radiology","Hospital":"Meander","OwnerClientID":"x509::/OU=admin/CN=admin::/C=ES/L=Alicante/=Alicante/O=Kung Fu Software/OU=Tech/CN=ca"},"Type":"Wearable","docType":"asset"}]'
assert_equal "$actual_output" "$expected_output"

echo_cyan "ReadAsset"
actual_output=$(kubectl hlf chaincode query --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=ReadAsset -a="assetid1")
expected_output='{"Available":true,"GPSLocation":"-","ID":"assetid1","IpAddress":"0.0.0.0","IsWearable":true,"LastUpdate":0,"Name":"assetname1","Owner":{"ContactPerson":"Jaylan","Department":"Radiology","Hospital":"Meander","OwnerClientID":"x509::/OU=admin/CN=admin::/C=ES/L=Alicante/=Alicante/O=Kung Fu Software/OU=Tech/CN=ca"},"Type":"Wearable","docType":"asset"}'
assert_equal "$actual_output" "$expected_output"

echo_cyan "QueryAssets (with filter)"
actual_output=$(kubectl hlf chaincode query --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=QueryAssets -a="{\"selector\":{\"ID\": \"assetid1\"}, \"fields\": [\"IpAddress\"]}")
expected_output='[{"Key":"assetid1","Record":{"IpAddress":"0.0.0.0"}}]'
assert_equal "$actual_output" "$expected_output"

echo_cyan "UpdateAsset as org1"
actual_output=$(kubectl hlf chaincode invoke --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=UpdateAsset -a="assetid1" -a="newassetname" -a="Not wearable" -a="1.1.1.1" -a="false" -a="1" -a="false" -a="Amersfoort" -a="Elizabeth" -a="Oncology" -a="Roderick")
expected_output='{"type":"Buffer","data":[]}' # No error message
assert_equal "$actual_output" "$expected_output"

echo_cyan "ReadAsset after update"
actual_output=$(kubectl hlf chaincode query --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=ReadAsset -a="assetid1")
expected_output='{"Available":false,"GPSLocation":"Amersfoort","ID":"assetid1","IpAddress":"1.1.1.1","IsWearable":false,"LastUpdate":1,"Name":"newassetname","Owner":{"ContactPerson":"Roderick","Department":"Oncology","Hospital":"Elizabeth","OwnerClientID":"x509::/OU=admin/CN=admin::/C=ES/L=Alicante/=Alicante/O=Kung Fu Software/OU=Tech/CN=ca"},"Type":"Not wearable","docType":"asset"}'
assert_equal "$actual_output" "$expected_output"

# Transfer is currently not supported
# echo_cyan "TransferAsset as org1"
# actual_output=$(kubectl hlf chaincode invoke --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=TransferAsset -a="assetid1" -a="org2")
# expected_output='{"type":"Buffer","data":[]}' # No error message
# assert_equal "$actual_output" "$expected_output"

# echo_cyan "ReadAsset after transfer"
# actual_output=$(kubectl hlf chaincode query --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=ReadAsset -a="assetid1")
# expected_output='{"Available":false,"GPSLocation":"Amersfoort","ID":"assetid1","IpAddress":"1.1.1.1","IsWearable":false,"LastUpdate":1,"Name":"newassetname","Owner":{"ContactPerson":"Roderick","Department":"Oncology","Hospital":"Elizabeth","OwnerClientID":"org2"},"Type":"Not wearable","docType":"asset"}'
# assert_equal "$actual_output" "$expected_output"

echo_cyan "DeleteAsset as org1"
actual_output=$(kubectl hlf chaincode invoke --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=DeleteAsset -a="assetid1")
expected_output="" # No error message
assert_equal "$actual_output" "$expected_output"

echo_cyan "GetAllAssets after delete"
actual_output=$(kubectl hlf chaincode query --config=resources/network.yaml --user=admin --peer=org1-peer0.default --chaincode=asset --channel=demo --fcn=GetAllAssets)
expected_output="[]"
assert_equal "$actual_output" "$expected_output"

echo_cyan "All clear!"
