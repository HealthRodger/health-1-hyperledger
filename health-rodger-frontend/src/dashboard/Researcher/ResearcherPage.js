import React, { useState } from 'react';
import { Container, Grid, Paper, Typography, TextField, Button } from '@mui/material';
import { CheckCircle, ErrorOutline } from '@mui/icons-material';
import axios from 'axios';
import { green, grey, red } from '@mui/material/colors';
import EntryTable from '../EntryTable';

export default function ResearcherPage() {
  const [sqlQuery, setSqlQuery] = useState('');
  const [uploadStatus, setUploadStatus] = useState('Enter your SQL query.');
  const [entries, setEntries] = useState([]);

  const handleQueryChange = (event) => {
    setSqlQuery(event.target.value);
  };

  const sendQueryToServer = async () => {
    const singleLineQuery = sqlQuery.replace(/\n/g, ' ').trim(); // Replace new lines with spaces
    if (!singleLineQuery) {
      setUploadStatus("Please enter a valid SQL query.");
      return;
    }
    setUploadStatus('Sending SQL query...');
    try {
      console.log(singleLineQuery)
      const response = await axios.post('http://localhost:3003/evaluate', { sqlQuery: singleLineQuery });
      setUploadStatus('SQL query successfully submitted.');
      setEntries(response.data); // Assuming the response data is the set of entries to display
    } catch (error) {
      console.error(error);
      setUploadStatus("Error sending the SQL query.");
    }
  };

    // Determine the icon and color based on uploadStatus
    const getStatusIcon = () => {
      if (uploadStatus.toLowerCase().includes('error')) {
        return <ErrorOutline sx={{ fontSize: 40, color: red[500] }} />;
      } else if (uploadStatus.toLowerCase().includes('completed')) {
        return <CheckCircle sx={{ fontSize: 40, color: green[500] }} />;
      } else {
        return null; // No icon
      }
    };
  
    // Determine the background color based on uploadStatus
    const getBackgroundColor = () => {
      if (uploadStatus.toLowerCase().includes('error')) {
        return red[100];
      } else if (uploadStatus.toLowerCase().includes('completed')) {
        return green[100];
      } else if (uploadStatus.toLowerCase().includes('waiting')) {
        return grey[100];
      } else {
        return 'inherit';
      }
    };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 240 }}>
            <TextField
              fullWidth
              label="SQL Query"
              variant="outlined"
              multiline // Enables multiline input
              minRows={4} // Minimum number of rows the textarea will occupy
              value={sqlQuery}
              onChange={handleQueryChange}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" onClick={sendQueryToServer}>
              Send SQL Query
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              backgroundColor: getBackgroundColor(),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {getStatusIcon()}
            <Typography component="p" variant="h4" sx={{ color: uploadStatus.toLowerCase().includes('error') ? (red[500]) : (uploadStatus.toLowerCase().includes('enter') ? grey[500] : green[500]) }}>
              {uploadStatus}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <EntryTable entries={entries} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}