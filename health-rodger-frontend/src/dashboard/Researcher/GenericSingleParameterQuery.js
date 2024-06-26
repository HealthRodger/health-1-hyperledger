import React, { useState } from "react";
import {
  Container, // Material UI container component for centering the layout on the page
  Grid, // Material UI component for creating a responsive grid layout
  Paper, // Material UI component that represents a paper sheet
  Typography, // Material UI component for rendering text
  TextField, // Material UI input component
  Button, // Material UI button component
} from "@mui/material";
import { CheckCircle, ErrorOutline } from "@mui/icons-material"; // Material UI icons
import axios from "axios"; // HTTP client for making requests
import { green, grey, red } from "@mui/material/colors"; // Color palette from Material UI
import GenericTable from "../GenericTable"; // A custom component to render tables
import config from "../../config"; // Configuration file that includes API URL

/**
 * A React component for making and displaying the results of a server query that requires a single parameter.
 * The user can input a parameter to query the server and see the results in a dynamic table. This component
 * provides feedback through status messages and icons based on the outcome of the query. It is designed to be
 * reusable for any type of single-parameter queries by passing necessary configurations through props.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.title - Title displayed at the top of the query section.
 * @param {string} props.parameterName - The name of the parameter to be used in the query.
 * @param {string} [props.parameterType="string"] - The data type of the parameter (e.g., "string", "number").
 * @param {function} props.argsToQueryString - A function that constructs the query string from the input parameter.
 * @param {Array<string>} props.headers - Column headers for the results table.
 * @returns {React.ReactElement} The `GenericSingleParameterQuery` component.
 */
function GenericSingleParameterQuery({
  title,
  parameterName,
  parameterType = "string",
  argsToQueryString,
  headers,
}) {
  const [parameter, setParameter] = useState(""); // State for the query parameter
  const [uploadStatus, setUploadStatus] = useState(
    "Query status will be displayed here."
  ); // State for the upload status message
  const [entries, setEntries] = useState([]); // State for the query results

  // Function to handle changes to the query parameter input field
  const handleQueryChange = (event) => {
    setParameter(event.target.value);
  };

  // Function to send the constructed query to the server
  const sendQueryToServer = async () => {
    const functionName = "QueryAssets"; // The blockchain function to query assets
    const functionArgs = [argsToQueryString(parameter)]; // Converts the parameter into a query string

    // Update the upload status to inform the user that querying is in progress
    setUploadStatus("Querying all assets...");

    try {
      // POST request to the evaluate API endpoint with the function name and arguments
      const response = await axios.post(`${config.apiUrl}/evaluate`, {
        fcn: functionName,
        args: functionArgs,
      });

      // On success, update the entries with the response and set the upload status
      const assets = response.data;
      setUploadStatus("Assets successfully retrieved.");
      setEntries(assets);
    } catch (error) {
      // On error, log the error and update the upload status to reflect the error
      console.error("Error querying assets:", error);
      setUploadStatus("Error retrieving assets.");
    }
  };

  // Function to determine which status icon to display based on the current upload status
  const getStatusIcon = () => {
    if (uploadStatus.toLowerCase().includes("error")) {
      return <ErrorOutline sx={{ fontSize: 40, color: red[500] }} />;
    } else if (uploadStatus.toLowerCase().includes("completed")) {
      return <CheckCircle sx={{ fontSize: 40, color: green[500] }} />;
    } else {
      return null; // No icon is displayed for other statuses
    }
  };

  // Function to get the background color for the status display based on the current upload status
  const getBackgroundColor = () => {
    if (uploadStatus.toLowerCase().includes("error")) {
      return red[100];
    } else if (uploadStatus.toLowerCase().includes("completed")) {
      return green[100];
    } else if (uploadStatus.toLowerCase().includes("waiting")) {
      return grey[100];
    } else {
      return "inherit"; // Default background color
    }
  };

  // Render the component UI using Material UI components
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, py: 4, background: "#eee" }}>
      <Grid container spacing={3}>
        {/* Query input field */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: 240,
            }}
          >
            <Typography variant="h5" sx={{ m: 2 }}>
              {title}
            </Typography>
            <TextField
              label={parameterName} // Label for the input field
              variant="outlined" // Outlined variant of the text field
              type={parameterType} // Set the type (e.g., "string", "number") of the input field
              value={parameter} // The current value of the input field
              onChange={handleQueryChange} // Function to call when the input field changes
              sx={{ mb: 2 }} // Margin bottom for styling
            />
            <Button
              variant="contained" // Contained variant of the button
              color="primary" // Color of the button
              onClick={sendQueryToServer} // Function to call when the button is clicked
            >
              Send Query
            </Button>
          </Paper>
        </Grid>
        {/* Status display */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: getBackgroundColor(), // Background color based on the upload status
            }}
          >
            {getStatusIcon()}
            <Typography
              component="p"
              variant="h4"
              sx={{
                color: uploadStatus.toLowerCase().includes("error")
                  ? red[500] // Text color for error status
                  : uploadStatus.toLowerCase().includes("query status")
                  ? grey[500] // Text color for neutral status
                  : green[500], // Text color for successful status
              }}
            >
              {uploadStatus}
            </Typography>
          </Paper>
        </Grid>
        {/* Table display for query results */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <GenericTable
              headers={headers}
              entries={entries.map((entry) => entry.Record)}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default GenericSingleParameterQuery;
