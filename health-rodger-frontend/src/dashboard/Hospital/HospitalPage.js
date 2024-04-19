import React, { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import FileUpload from "./FileUpload";
import axios from "axios";

export default function HospitalPage() {
  const [assetData, setAssetData] = useState({
    id: "",
    name: "",
    type: "",
    ipAddress: "",
    available: "",
    lastUpdate: "",
    isWearable: "",
    gpsLocation: "",
    hospital: "",
    department: "",
    contactPerson: "",
  });
  const [uploadStatus, setUploadStatus] = useState("Fill in the asset data");

  const handleFileSelectSuccess = (file) => {
    setUploadStatus("Uploading file...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target.result;
      const lines = fileContent.split("\n");
      for (let line of lines) {
        try {
          // Assuming each line is in JSON format
          // Comma separated values can be parsed using line.split(',')
          const split = line.split(",");
          if (split.length !== 11) {
            throw new Error("Invalid number of fields");
          }
          await sendToEndpoint(split);
        } catch (error) {
          setUploadStatus("Error processing the data!");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelectError = (errorMessage) => {
    setUploadStatus("Error chosing the file!");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssetData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus("Submitting asset...");

    try {
      const convertedData = {
        ...assetData,
        available: assetData.available === "true",
        isWearable: assetData.isWearable === "true",
      };

      const args = [
        convertedData.id,
        convertedData.name,
        convertedData.type,
        convertedData.ipAddress,
        convertedData.available.toString(),
        convertedData.lastUpdate,
        convertedData.isWearable.toString(),
        convertedData.gpsLocation,
        convertedData.hospital,
        convertedData.department,
        convertedData.contactPerson,
      ];

      sendToEndpoint(args);
    } catch (error) {
      setUploadStatus(`Error submitting asset: ${error.message}`);
    }
  };

  const sendToEndpoint = async (data) => {
    // Retrieve the username from local storage
    const username = localStorage.getItem("username");

    // Check if the username exists
    if (!username) {
      throw new Error("No username found in local storage.");
    }

    // Make the HTTP post request with the "x-user" header
    const response = await axios.post(
      "http://localhost:3003/submit",
      {
        fcn: "CreateAsset",
        args: data,
      },
      {
        headers: {
          "x-user": username, // Include the "x-user" header
        },
      }
    );

    if (response.status === 200) {
      setUploadStatus("Asset submitted successfully");
    } else {
      setUploadStatus("Failed to submit asset");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Asset Details
              </Typography>
              {Object.keys(assetData).map((key) => (
                <TextField
                  key={key}
                  name={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={assetData[key]}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              ))}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button type="submit" variant="contained" color="primary">
                  Submit Asset
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography>{uploadStatus}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </form>
      {/* File upload box */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Upload File
          </Typography>
          <FileUpload
            onFileSelectSuccess={handleFileSelectSuccess}
            onFileSelectError={handleFileSelectError}
          />
        </Paper>
      </Grid>
    </Container>
  );
}
