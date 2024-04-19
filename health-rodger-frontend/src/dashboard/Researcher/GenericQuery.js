import React, { useRef, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  TextareaAutosize,
} from "@mui/material";
import { CheckCircle, ErrorOutline } from "@mui/icons-material";
import axios from "axios";
import { green, grey, red } from "@mui/material/colors";
// import EntryTable from "../EntryTable";

export default function GenericQuery() {
  const [genericQuery, setGenericQuery] = useState(`{"selector": {}}`);
  const [uploadStatus, setUploadStatus] = useState("Enter your Generic query.");
  const [entries, setEntries] = useState([]);

  const handleQueryChange = (event) => {
    setGenericQuery(event.target.value);
  };

  const sendQueryToServer = async () => {
    const functionName = "QueryAssets";
    const functionArgs = [genericQuery];

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
            <TextField
              fullWidth
              label="Generic Query"
              variant="outlined"
              multiline // Enables multiline input
              minRows={4} // Minimum number of rows the textarea will occupy
              value={genericQuery}
              onChange={handleQueryChange}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={sendQueryToServer}
            >
              Send Generic Query
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
              backgroundColor: getBackgroundColor(),
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
                  ? red[500]
                  : uploadStatus.toLowerCase().includes("enter")
                  ? grey[500]
                  : green[500],
              }}
            >
              {uploadStatus}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8} lg={9}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            {/* Display entries as plaintext */}
            <Typography variant="h6">
              Retrieved Assets will be displayed below:
            </Typography>
            {/* I don't know how to do this with material UI components */}
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
