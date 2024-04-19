import React, { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
// Import components required for date and time picking functionality
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { CheckCircle, ErrorOutline } from "@mui/icons-material";
import axios from "axios";
import { green, grey, red } from "@mui/material/colors";
import GenericTable from "../GenericTable";
import config from "../../config";

/**
 * A React component for submitting time-based queries to a server and displaying the results.
 * Users can select a date and time using a DateTimePicker, and submit this data as part of a query.
 * The component handles submission, response processing, and error handling, providing user feedback
 * through status messages and icons. Results are displayed in a dynamically generated table.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.title - The title displayed above the date and time picker.
 * @param {function} props.argsToQueryString - A function that converts the selected date and time
 * into a query string suitable for sending to the server.
 * @param {Array<string>} props.headers - The headers for the table that displays the results of the query.
 * @returns {React.ReactElement} - The rendered component.
 */
function GenericTimeQuery({
  title, // Title of the query section
  argsToQueryString, // Function to transform arguments into a query string
  headers, // Headers for displaying results in a table
}) {
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for the selected date
  const [uploadStatus, setUploadStatus] = useState(
    "Query status will be displayed here."
  ); // State for the status of the query
  const [entries, setEntries] = useState([]); // State for storing the query results

  // Handler for changes to the date picker input
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Function to send the selected date and time to the server
  const sendQueryToServer = async () => {
    const functionName = "QueryAssets"; // Specifies the function to be called on the server
    const unixTime = Math.floor(selectedDate.getTime() / 1000);
    const functionArgs = [argsToQueryString(unixTime)]; // Converts the date into a suitable query string

    setUploadStatus("Querying all assets..."); // Inform the user that querying has started

    try {
      // POST request to the server using the selected function and arguments
      const response = await axios.post(`${config.apiUrl}/evaluate`, {
        fcn: functionName,
        args: functionArgs,
      });

      const assets = response.data; // Store the returned data
      setUploadStatus("Assets successfully retrieved."); // Update the status upon successful retrieval
      setEntries(assets); // Store the assets data for display
    } catch (error) {
      // Handle errors and update the status accordingly
      console.error("Error querying assets:", error);
      setUploadStatus("Error retrieving assets.");
    }
  };

  // Function to determine the appropriate icon based on the current status
  const getStatusIcon = () => {
    if (uploadStatus.toLowerCase().includes("error")) {
      return <ErrorOutline sx={{ fontSize: 40, color: red[500] }} />;
    } else if (uploadStatus.toLowerCase().includes("completed")) {
      return <CheckCircle sx={{ fontSize: 40, color: green[500] }} />;
    } else {
      return null; // Return no icon if the status is neither error nor completed
    }
  };

  // Function to determine the background color of the status display based on the current status
  const getBackgroundColor = () => {
    if (uploadStatus.toLowerCase().includes("error")) {
      return red[100];
    } else if (uploadStatus.toLowerCase().includes("completed")) {
      return green[100];
    } else if (uploadStatus.toLowerCase().includes("waiting")) {
      return grey[100];
    } else {
      return "inherit"; // Use the default color if no specific conditions are met
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, py: 4, background: "#eee" }}>
      <Grid container spacing={3}>
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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Select Date & Time"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
            <Button
              sx={{ mt: 2 }}
              variant="contained"
              color="primary"
              onClick={sendQueryToServer}
            >
              Send Query
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: getBackgroundColor(),
            }}
          >
            {getStatusIcon()}
            <Typography
              component="p"
              variant="h4"
              sx={{
                color: uploadStatus.toLowerCase().includes("error")
                  ? red[500]
                  : uploadStatus.toLowerCase().includes("query status")
                  ? grey[500]
                  : green[500],
              }}
            >
              {uploadStatus}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <GenericTable
              headers={headers} // Display table headers
              entries={entries.map((entry) => entry.Record)} // Display table entries
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default GenericTimeQuery;
