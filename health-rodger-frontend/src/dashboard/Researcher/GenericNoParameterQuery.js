import React, { useState } from "react";
import { Container, Grid, Paper, Typography, Button } from "@mui/material";
import { CheckCircle, ErrorOutline } from "@mui/icons-material";
import axios from "axios";
import { green, grey, red } from "@mui/material/colors";
import GenericTable from "../GenericTable";
import config from "../../config";

/**
 * A React component for sending a specified query to a server and displaying the results.
 * This component is used to execute a query that does not require any parameters.
 * It displays a button that users can click to send the query, and it shows the results in a table.
 * The component also provides visual feedback on the query's status through icons and background colors.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.title - The title displayed above the query button.
 * @param {string} props.queryString - The actual query string that will be sent to the backend.
 * @param {Array<string>} props.headers - The column headers for the table that displays the results of the query.
 * @returns {React.ReactElement} The `GenericNoParameterQuery` component.
 */
function GenericNoParameterQuery({
  title,
  queryString,
  headers,
}) {
  // State for displaying the current status of the query
  const [uploadStatus, setUploadStatus] = useState(
    "Query status will be displayed here."
  );
  // State for storing the entries (results) that come back from the query
  const [entries, setEntries] = useState([]);

  // Function to send the query to the server when triggered
  const sendQueryToServer = async () => {
    // Function name as expected by the backend
    const functionName = "QueryAssets";
    // Arguments for the backend function
    const functionArgs = [queryString];

    // Indicate to the user that the query process has begun
    setUploadStatus("Querying all assets...");

    try {
      // Make a POST request to the backend to execute the function
      const response = await axios.post(`${config.apiUrl}/evaluate`, {
        fcn: functionName,
        args: functionArgs,
      });

      // Extract the data from the response
      const assets = response.data;

      // If the request is successful, update the entries and status
      setUploadStatus("Assets successfully retrieved.");
      setEntries(assets);
    } catch (error) {
      // In case of an error, log it and update the status accordingly
      console.error("Error querying assets:", error);
      setUploadStatus("Error retrieving assets.");
    }
  };

  // Function to determine which status icon to show based on the current status
  const getStatusIcon = () => {
    if (uploadStatus.toLowerCase().includes("error")) {
      return <ErrorOutline sx={{ fontSize: 40, color: red[500] }} />;
    } else if (uploadStatus.toLowerCase().includes("completed")) {
      return <CheckCircle sx={{ fontSize: 40, color: green[500] }} />;
    } else {
      return null; // If status is neither 'error' nor 'completed', return no icon
    }
  };

  // Function to get the appropriate background color based on the current status
  const getBackgroundColor = () => {
    if (uploadStatus.toLowerCase().includes("error")) {
      return red[100];
    } else if (uploadStatus.toLowerCase().includes("completed")) {
      return green[100];
    } else if (uploadStatus.toLowerCase().includes("waiting")) {
      return grey[100];
    } else {
      return "inherit"; // Default background if none of the conditions are met
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, py: 4, background: "#eee" }}>
      <Grid container spacing={3}>
        {/* Query initiation section */}
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
              {title} {/* Title for the query section */}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={sendQueryToServer} // Button to trigger the query
            >
              Send Query
            </Button>
          </Paper>
        </Grid>
        {/* Status display section */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: getBackgroundColor(), // Background color based on the status
            }}
          >
            {getStatusIcon()} {/* Display the status icon */}
            <Typography
              component="p"
              variant="h4"
              sx={{
                // Color the text based on the status
                color: uploadStatus.toLowerCase().includes("error")
                  ? red[500]
                  : uploadStatus.toLowerCase().includes("query status")
                  ? grey[500]
                  : green[500],
              }}
            >
              {uploadStatus} {/* Current status text */}
            </Typography>
          </Paper>
        </Grid>
        {/* Resulting data table section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            {/* Pass headers and entry data to the GenericTable component for display */}
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

export default GenericNoParameterQuery
