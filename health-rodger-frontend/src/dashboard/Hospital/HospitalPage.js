import * as React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chart from '../Chart';
import Deposits from '../Deposits';
import Orders from '../Orders';
import FileUpload from './FileUpload';
import Typography from '@mui/material/Typography';
import Title from '../Title';
import { ArrowForward, CheckCircle, ErrorOutline } from '@mui/icons-material';
import { Button } from '@mui/material';
import EntryTable from '../EntryTable';
import axios from 'axios';
import { green, grey, red } from '@mui/material/colors';

export default function HospitalPage() {
  const [uploadStatus, setUploadStatus] = React.useState('Waiting for a file...')
  const [entries, setEntries] = React.useState([]);

  const handleFileSelectSuccess = (file) => {
    setUploadStatus('Uploading file...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target.result;
      const lines = fileContent.split('\n');
      for (let line of lines) {
        try {
          // Assuming each line is in JSON format
          const data = JSON.parse(line);
          await sendToEndpoint(data);
        } catch (error) {
          setUploadStatus("Error processing the data!")
        }
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelectError = (errorMessage) => {
    setUploadStatus("Error chosing the file!");
  };

  const sendToEndpoint = async (data) => {
    try {
      const response = await axios.post('http://localhost:3003/submit', {
        fcn: 'CreateAsset',
        args: [data.AssetKey, data.Color, data.Size, data.AppraisedValue]
      });
      setUploadStatus('File upload completed.');
    } catch (error) {
      setUploadStatus("Error sending the data!")
    }
  };

  const fetchEntries = async () => {
    try {
      // Retrieve the username from local storage
      const username = localStorage.getItem('username');
      
      // Check if the username exists
      if (!username) {
        throw new Error('No username found in local storage.');
      }

      // Make the HTTP post request with the "x-user" header
      const response = await axios.post('http://localhost:3003/evaluate', {
        fcn: 'GetAllAssets',
      }, {
        headers: {
          'x-user': username, // Include the "x-user" header
        },
      });

  
      // Assuming the response data is the array of entries
      if (Array.isArray(response.data)) {
        setEntries(response.data); // Update your entries state with the response
        console.log('Entries fetched:', response.data); // Logging the fetched entries
      } else {
        throw new Error('Invalid data format received from the server.');
      }
    } catch (error) {
      // Handle errors that occur during the API request
      console.error('Error fetching entries:', error.response || error.message);
  
      // If it's an Axios error, you can access the detailed error response
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error', error.message);
      }
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
              {/* Chart */}
              <Grid item xs={12} md={8} lg={9}>
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 240,
      justifyContent: 'center', // Centers content vertically
      alignItems: 'center', // Centers content horizontally
    }}
  >
    <FileUpload
      onFileSelectSuccess={handleFileSelectSuccess}
      onFileSelectError={handleFileSelectError}
    />
    <Typography sx={{ mt: 2 }}>
      Upload the JSON data that you want to store in blockchain.
    </Typography>
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
            <Typography component="p" variant="h4" sx={{ color: uploadStatus.toLowerCase().includes('error') ? (red[500]) : (uploadStatus.toLowerCase().includes('waiting') ? grey[500] : green[500] ) }}>
              {uploadStatus}
            </Typography>
          </Paper>
        </Grid>
              {/* Recent Orders */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <EntryTable entries={entries}/>
                    <Button
                    variant="contained"
                    color="primary"
                    onClick={fetchEntries}
                    sx={{ mt: 3, py: 1, mr: 100 }}
                  >
                    Fetch Entries
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Container>
  );
}