import React from "react";
import GenericQuery from "./GenericQuery";
import GenericSingleParameterQuery from "./GenericSingleParameterQuery";
import GenericNoParameterQuery from "./GenericNoParameterQuery";

export default function ResearcherPage() {
  return (
    <>
      <GenericQuery />
      <GenericSingleParameterQuery
        title="List all devices not updated since given timestamp"
        headers={["ID", "Name", "LastUpdate"]}
        parameterName={"Unix Timestamp"}
        parameterType={"number"}
        argsToQueryString={(timestamp) => {
          return `{"selector": {"LastUpdate": {"$lt": ${timestamp}}}, "fields": ["ID", "Name", "LastUpdate"]}`;
        }}
      />
      <GenericSingleParameterQuery
        title="List all devices updated since given timestamp"
        headers={["ID", "Name", "LastUpdate"]}
        parameterName={"Unix Timestamp"}
        parameterType={"number"}
        argsToQueryString={(timestamp) => {
          return `{"selector": {"LastUpdate": {"$gt": ${timestamp}}}, "fields": ["ID", "Name", "LastUpdate"]}`;
        }}
      />
      <GenericSingleParameterQuery
        title="List all available devices not updated since given timestamp"
        headers={["ID", "Name", "LastUpdate"]}
        parameterName={"Unix Timestamp"}
        parameterType={"number"}
        argsToQueryString={(timestamp) => {
          return `{"selector": {"LastUpdate": {"$lt": ${timestamp}}, "Available": true}, "fields": ["ID", "Name", "LastUpdate"]}`;
        }}
      />
      <GenericSingleParameterQuery
        title="List all non-available devices not updated since given timestamp"
        headers={["ID", "Name", "LastUpdate"]}
        parameterName={"Unix Timestamp"}
        parameterType={"number"}
        argsToQueryString={(timestamp) => {
          return `{"selector": {"LastUpdate": {"$lt": ${timestamp}}, "Available": false}, "fields": ["ID", "Name", "LastUpdate"]}`;
        }}
      />
      <GenericSingleParameterQuery
        title={
          "5a. List all devices from a given department (over all hospitals)"
        }
        headers={["ID", "Name", "Available", "LastUpdate", "Owner"]}
        parameterName="Department name"
        argsToQueryString={(department) => {
          return `{"selector": {"Owner.Department": "${department}"}, "fields": ["ID", "Name", "Available", "LastUpdate", "Owner.Hospital", "Owner.ContactPerson"]}`;
        }}
      />
      <GenericSingleParameterQuery
        title={
          "5b. List all available devices from a given department (over all hospitals)"
        }
        headers={["ID", "Name", "LastUpdate", "Owner"]}
        parameterName="Department name"
        argsToQueryString={(department) => {
          return `{"selector": {"Owner.Department": "${department}", "Available": true}, "fields": ["ID", "Name", "LastUpdate", "Owner.Hospital", "Owner.ContactPerson"]}`;
        }}
      />
      <GenericSingleParameterQuery
        title={
          "5c. List all non-available devices from a given department (over all hospitals)"
        }
        headers={["ID", "Name", "LastUpdate", "Owner"]}
        parameterName="Department name"
        argsToQueryString={(department) => {
          return `{"selector": {"Owner.Department": "${department}", "Available": false}, "fields": ["ID", "Name", "LastUpdate", "Owner.Hospital", "Owner.ContactPerson"]}`;
        }}
      />
      <GenericSingleParameterQuery
        title={"6. List all devices of a given type"}
        headers={["ID", "Name", "Available", "LastUpdate"]}
        parameterName="Type"
        argsToQueryString={(type) => {
          return `{"selector": {"Type": "${type}"}, "fields": ["ID", "Name", "Available", "LastUpdate"]}`;
        }}
      />
      <GenericSingleParameterQuery
        title={"10. List all devices owned by given hospital"}
        headers={["ID", "Name", "Owner"]}
        parameterName="Hospital name"
        argsToQueryString={(hospital) => {
          return `{"selector": {"Owner.Hospital": "${hospital}"}, "fields": ["ID", "Name", "Owner.Department", "Owner.ContactPerson"]}`;
        }}
      />
      {/* <GenericNoParameterQuery
        title={"11. List the devices that have been unavailable the longest"}
        headers={["ID", "Name", "LastUpdate"]}
        queryString={`{"selector": {"Available": false}, "fields": ["ID", "Name", "LastUpdate"], "sort": [{"LastUpdate": "asc"}]`}
      /> */}
    </>
  );
}
