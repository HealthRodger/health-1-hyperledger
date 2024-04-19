import React, { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { CheckCircle, ErrorOutline } from "@mui/icons-material";
import axios from "axios";
import { green, grey, red } from "@mui/material/colors";
import config from "../../config";

/**
 * A React component that provides a user interface for inputting and executing a generic query on a server.
 * Users can type a query in a text field and submit it to retrieve results, which are displayed on the page.
 * This component handles the query submission, processes the server's response, and manages the display of status
 * messages and query results. Visual feedback on the query's status (such as errors or successful retrieval)
 * is provided through status icons and background colors.
 *
 * @component
 * @returns {React.ReactElement} The `GenericQuery` component.
 */
function GenericQuery() {
  // State for the generic query string that will be sent to the server.
  const [genericQuery, setGenericQuery] = useState(`{"selector": {}}`);
  // State for displaying the status of the query to the user.
  const [uploadStatus, setUploadStatus] = useState("Enter your Generic query.");
  // State for storing the query results.
  const [entries, setEntries] = useState([]);

  // Function to update the genericQuery state when the user types in the TextField.
  const handleQueryChange = (event) => {
    setGenericQuery(event.target.value);
  };

  // Function to send the genericQuery to the server when the 'Send Generic Query' button is clicked.
  const sendQueryToServer = async () => {
    const functionName = "QueryAssets";
    const functionArgs = [genericQuery];

    // Notify the user that the query is being processed.
    setUploadStatus("Querying all assets...");

    try {
      // Execute a POST request to the server's evaluate endpoint with the query.
      const response = await axios.post(`${config.apiUrl}/evaluate`, {
        fcn: functionName,
        args: functionArgs,
      });

      // Update the entries state with the query results and notify the user of success.
      const assets = response.data;
      setUploadStatus("Assets successfully retrieved.");
      setEntries(assets);
    } catch (error) {
      // Log the error and notify the user if the query fails.
      console.error("Error querying assets:", error);
      setUploadStatus("Error retrieving assets.");
    }
  };

  // Function to determine the icon displayed based on the status of the upload.
  const getStatusIcon = () => {
    if (uploadStatus.toLowerCase().includes("error")) {
      return <ErrorOutline sx={{ fontSize: 40, color: red[500] }} />;
    } else if (uploadStatus.toLowerCase().includes("completed")) {
      return <CheckCircle sx={{ fontSize: 40, color: green[500] }} />;
    } else {
      return null; // Return no icon if there is no relevant status.
    }
  };

  // Function to determine the background color of the status Paper based on the upload status.
  const getBackgroundColor = () => {
    if (uploadStatus.toLowerCase().includes("error")) {
      return red[100];
    } else if (uploadStatus.toLowerCase().includes("completed")) {
      return green[100];
    } else if (uploadStatus.toLowerCase().includes("waiting")) {
      return grey[100];
    } else {
      return "inherit"; // Use the default color if none of the conditions are met.
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, py: 4, background: "#eee" }}>
      <Grid container spacing={3}>
        {/* Grid item for the query input */}
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
            <TextField
              fullWidth
              label="Generic Query"
              variant="outlined"
              multiline // Allows the input to have multiple lines
              minRows={4} // Minimum number of lines the input field will occupy
              value={genericQuery} // The current query string
              onChange={handleQueryChange} // Function to call when the query changes
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={sendQueryToServer} // Function to call when the button is clicked
            >
              Send Generic Query
            </Button>
          </Paper>
        </Grid>
        {/* Grid item for displaying the status of the query */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
              backgroundColor: getBackgroundColor(), // Background color based on the upload status
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {getStatusIcon()}
            <Typography
              component="p"
              variant="h4"
              sx={{
                color: uploadStatus.toLowerCase().includes("error")
                  ? red[500] // Text color for error status
                  : uploadStatus.toLowerCase().includes("enter")
                  ? grey[500] // Text color for initial status
                  : green[500], // Text color for success status
              }}
            >
              {uploadStatus}
            </Typography>
          </Paper>
        </Grid>
        {/* Grid item for displaying the query results */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6">
              Retrieved Assets will be displayed below:
            </Typography>
            <div
              style={{
                height: "300px",
                overflowY: "scroll",
                border: "1px solid #ccc",
                padding: "10px",
                resize: "vertical",
                fontSize: "12px",
              }}
            >
              {/* Display each query result as a formatted string */}
              <pre>
                {entries.map((result, index) => (
                  <div key={index}>{JSON.stringify(result, null, "\t")}</div>
                ))}
              </pre>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default GenericQuery
