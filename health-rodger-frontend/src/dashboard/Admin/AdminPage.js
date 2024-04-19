
import React, { useState, useEffect } from 'react';
import { Container, Grid, TextField, Button, Typography, Paper, List, ListItem, ListItemButton, ListItemText, Alert, Snackbar } from '@mui/material';
import axios from 'axios';

export default function OrganizationManager() {
  const [orgDetails, setOrgDetails] = useState({
    orgName: '',
    enrollId: '',
    enrollPw: '',
    hosts: '',
    caImage: 'hyperledger/fabric-ca',
    caVersion: '1.5.6',
    storageClass: 'standard',
    capacity: '1Gi',
    istioPort: '443',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showCreateNewOrg, setShowCreateNewOrg] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get('http://localhost:3003/list-organizations');
      setOrganizations(response.data.organizations || []);
    } catch (error) {
      handleRequestError(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrgDetails(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDeployPeer = async () => {
    if (!selectedOrg) {
      setError('Please select an organization first.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3003/create-peer', { orgName: selectedOrg.name });
      setSuccess('Peer deployed successfully.');
      fetchOrganizations(); 
    } catch (error) {
      handleRequestError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:3003/create-organization', orgDetails);
      setSuccess('Organization created successfully.');
      fetchOrganizations();
      setShowCreateNewOrg(false); 
    } catch (error) {
      handleRequestError(error);
    }
  };

  const handleOrgClick = (org) => {
    setSelectedOrg(org);
    setShowCreateNewOrg(false);
  };

  const handleRemoveOrg = async (orgName) => {
    try {
      const response = await axios.post('http://localhost:3003/disable-organization', { orgName });
      if (response.status === 200) {
        setSuccess('Organization removed successfully.');
        fetchOrganizations();
      } else {
        throw new Error('Failed to remove organization');
      }
    } catch (error) {
      handleRequestError(error);
    }
  };

  const handleRequestError = (error) => {
    setError('Error: ' + (error.response?.data.message || error.message));
  };

  const handleCloseSnackbar = () => {
    setError('');
  };

  const renderOrgDetails = () => {
    if (showCreateNewOrg) {
      return (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Create New Organization</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              required
              id="orgName"
              name="orgName"
              label="Organization Name"
              fullWidth
              variant="outlined"
              value={orgDetails.orgName}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              required
              id="enrollId"
              name="enrollId"
              label="Enroll ID"
              fullWidth
              variant="outlined"
              value={orgDetails.enrollId}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              required
              id="enrollPw"
              name="enrollPw"
              label="Enroll Password"
              fullWidth
              variant="outlined"
              value={orgDetails.enrollPw}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              required
              id="hosts"
              name="hosts"
              label="Hosts"
              fullWidth
              variant="outlined"
              value={orgDetails.hosts}
              onChange={handleChange}
              margin="normal"
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Create Organization
            </Button>
          </form>
        </Paper>
      );
    } else if (selectedOrg) {
      return (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6">{selectedOrg.name}</Typography>
          <div style={{ display: 'flex', justifyContent: 'start', gap: '10px', marginTop: '20px' }}>
            <Button variant="contained" color="primary" onClick={handleDeployPeer}>
              Deploy Peer
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#d32f2f', 
                color: 'white',
                '&:hover': {
                  backgroundColor: '#9a0007', 
                },
                mt: 2
              }}
              onClick={() => handleRemoveOrg(selectedOrg.name)}
            >
              Remove Organization
            </Button>
          </div>
        </Paper>
      );
    } else {
      return <Typography variant="h6" sx={{ mt: 2 }}>Select an organization to manage</Typography>;
    }
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, paddingLeft: '0 !important' }}>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, backgroundColor: '#f0f0f0' }}>
            <Button variant="contained" onClick={() => setShowCreateNewOrg(true)} sx={{ mb: 2, backgroundColor: '#1976d2' }}>+ Create New Org</Button>
            <List sx={{ maxHeight: 600, overflow: 'auto' }}>
              {organizations.map((org, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => handleOrgClick(org)} sx={{ textAlign: 'left' }}>
                    <ListItemText primary={org.name} primaryTypographyProps={{ fontSize: '1.1rem', color: '#1976d2' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          {renderOrgDetails()}
        </Grid>
      </Grid>
    </Container>
  );
}