import React, { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { CheckCircle, ErrorOutline } from "@mui/icons-material";
import axios from "axios";
import { green, grey, red } from "@mui/material/colors";
import GenericTable from "../GenericTable";

export default function GenericTimeQuery({
  title,
  argsToQueryString,
  headers,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [uploadStatus, setUploadStatus] = useState(
    "Query status will be displayed here."
  );
  const [entries, setEntries] = useState([]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const sendQueryToServer = async () => {
    const functionName = "QueryAssets";
    const functionArgs = [argsToQueryString(selectedDate)];

    setUploadStatus("Querying all assets...");

    try {
      const response = await axios.post("http://localhost:3003/evaluate", {
        fcn: functionName,
        args: functionArgs,
      });

      const assets = response.data;
      console.log(assets);

      setUploadStatus("Assets successfully retrieved.");
      setEntries(assets);
    } catch (error) {
      console.error("Error querying assets:", error);
      setUploadStatus("Error retrieving assets.");
    }
  };

  // Determine the icon and color based on uploadStatus
  const getStatusIcon = () => {
    if (uploadStatus.toLowerCase().includes("error")) {
      return <ErrorOutline sx={{ fontSize: 40, color: red[500] }} />;
    } else if (uploadStatus.toLowerCase().includes("completed")) {
      return <CheckCircle sx={{ fontSize: 40, color: green[500] }} />;
    } else {
      return null; // No icon
    }
  };

  // Determine the background color based on uploadStatus
  const getBackgroundColor = () => {
    if (uploadStatus.toLowerCase().includes("error")) {
      return red[100];
    } else if (uploadStatus.toLowerCase().includes("completed")) {
      return green[100];
    } else if (uploadStatus.toLowerCase().includes("waiting")) {
      return grey[100];
    } else {
      return "inherit";
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
              headers={headers}
              entries={entries.map((entry) => entry.Record)}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
