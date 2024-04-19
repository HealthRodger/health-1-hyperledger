import React from "react";
import GenericQuery from "./GenericQuery";
import GenericSingleParameterQuery from "./GenericSingleParameterQuery";
// import GenericNoParameterQuery from "./GenericNoParameterQuery"; // This line is commented out, potentially for future use.
import GenericTimeQuery from "./GenericTimeQuery";

/**
 * ResearcherPage is a React component that serves as a container for various query components,
 * each tailored to fetch and display data based on specific query parameters. This page includes multiple
 * instances of `GenericTimeQuery` and `GenericSingleParameterQuery`, each configured for different types
 * of data retrieval scenarios, such as querying by timestamps or specific attributes like department name
 * or device type. Researchers use this page to operate on the blockchain.
 *
 * @component
 * @returns {React.ReactElement} Renders a page with various configured query components.
 */
function ResearcherPage() {
  return (
    <>
      {/* GenericQuery can be configured to perform a variety of database queries. Currently, it does not have specific props passed to it. */}
      <GenericQuery />

      {/* Instances of GenericTimeQuery configured to fetch devices based on timestamp criteria. Each takes a title, headers for the table, and a function that constructs the query string from a timestamp. */}
      <GenericTimeQuery
        title="1. List all devices not updated since given timestamp"
        headers={["ID", "Name", "LastUpdate"]}
        argsToQueryString={(timestamp) => {
          // Constructs a CouchDB query for devices last updated before the given timestamp
          return `{"selector": {"LastUpdate": {"$lt": ${timestamp}}}, "fields": ["ID", "Name", "LastUpdate"]}`;
        }}
      />
      <GenericTimeQuery
        title="2. List all devices updated since given timestamp"
        headers={["ID", "Name", "LastUpdate"]}
        argsToQueryString={(timestamp) => {
          // Constructs a CouchDB query for devices last updated after the given timestamp
          return `{"selector": {"LastUpdate": {"$gt": ${timestamp}}}, "fields": ["ID", "Name", "LastUpdate"]}`;
        }}
      />
      <GenericTimeQuery
        title="3. List all available devices not updated since given timestamp"
        headers={["ID", "Name", "LastUpdate"]}
        argsToQueryString={(timestamp) => {
          // Additional query to filter by availability status
          return `{"selector": {"LastUpdate": {"$lt": ${timestamp}}, "Available": true}, "fields": ["ID", "Name", "LastUpdate"]}`;
        }}
      />
      <GenericTimeQuery
        title="4. List all non-available devices not updated since given timestamp"
        headers={["ID", "Name", "LastUpdate"]}
        argsToQueryString={(timestamp) => {
          // Additional query to filter by non-availability status
          return `{"selector": {"LastUpdate": {"$lt": ${timestamp}}, "Available": false}, "fields": ["ID", "Name", "LastUpdate"]}`;
        }}
      />

      {/* Instances of GenericSingleParameterQuery are configured to perform queries based on single parameters like department name or device type. */}
      <GenericSingleParameterQuery
        title={
          "5. List all devices with a given name (over all hospitals and departments)"
        }
        headers={["ID", "Name", "Available", "LastUpdate", "Owner"]}
        parameterName="Device Name"
        argsToQueryString={(deviceName) => {
          return `{"selector": {"Name": "${deviceName}"}, "fields": ["ID", "Name", "Available", "LastUpdate", "Owner.Hospital", "Owner.ContactPerson"]}`;
        }}
      />
      <GenericSingleParameterQuery
        title={
          "6. List all devices from a given department (over all hospitals)"
        }
        headers={["ID", "Name", "Available", "LastUpdate", "Owner"]}
        parameterName="Department name"
        argsToQueryString={(department) => {
          // Query for all devices within a specific department
          return `{"selector": {"Owner.Department": "${department}"}, "fields": ["ID", "Name", "Available", "LastUpdate", "Owner.Hospital", "Owner.ContactPerson"]}`;
        }}
      />
      {/* Additional queries for available and non-available devices within a department */}
      <GenericSingleParameterQuery
        title={
          "7. List all available devices from a given department (over all hospitals)"
        }
        headers={["ID", "Name", "LastUpdate", "Owner"]}
        parameterName="Department name"
        argsToQueryString={(department) => {
          return `{"selector": {"Owner.Department": "${department}", "Available": true}, "fields": ["ID", "Name", "LastUpdate", "Owner.Hospital", "Owner.ContactPerson"]}`;
        }}
      />
      <GenericSingleParameterQuery
        title={
          "8. List all non-available devices from a given department (over all hospitals)"
        }
        headers={["ID", "Name", "LastUpdate", "Owner"]}
        parameterName="Department name"
        argsToQueryString={(department) => {
          return `{"selector": {"Owner.Department": "${department}", "Available": false}, "fields": ["ID", "Name", "LastUpdate", "Owner.Hospital", "Owner.ContactPerson"]}`;
        }}
      />
      <GenericSingleParameterQuery
        title={"9. List all devices of a given type"}
        headers={["ID", "Name", "Available", "LastUpdate"]}
        parameterName="Type"
        argsToQueryString={(type) => {
          // Query for all devices of a specific type
          return `{"selector": {"Type": "${type}"}, "fields": ["ID", "Name", "Available", "LastUpdate"]}`;
        }}
      />
      <GenericSingleParameterQuery
        title="10. List all devices owned by given hospital"
        headers={["ID", "Name", "Owner"]}
        parameterName="Hospital name"
        argsToQueryString={(hospital) => {
          // Query for all devices owned by a specific hospital
          return `{"selector": {"Owner.Hospital": "${hospital}"}, "fields": ["ID", "Name", "Owner.Department", "Owner.ContactPerson"]}`;
        }}
      />
    </>
  );
}

export default ResearcherPage;
