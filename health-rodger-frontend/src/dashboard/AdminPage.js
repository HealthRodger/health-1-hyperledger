import React, { useState, useEffect } from 'react';
import { Container, Grid, TextField, Button, Typography, Paper, List, ListItem, ListItemButton, ListItemText, Alert } from '@mui/material';
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

  const [showRegisterUserForm, setShowRegisterUserForm] = useState(false);
  const [userRegistrationDetails, setUserRegistrationDetails] = useState({
    name: '',
    user: '',
    secret: '',
    userType: '',
    enrollId: '',
    enrollSecret: '',
    mspid: '',
  });

  const [showCreatePeerForm, setShowCreatePeerForm] = useState(false);
  const [peerCreationDetails, setPeerCreationDetails] = useState({
    statedb: 'couchdb',
    peerImage: 'hyperledger/fabric-peer',
    peerVersion: '2.4.6',
    enrollId: 'peer',
    enrollSecret: 'peerpw',
    capacity: '5Gi',
    name: '',
    caName: '',
    hosts: 'peer0-org1.localho.st',
    istioPort: '443',
    mspid: '',
  });


  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get('http://localhost:3003/list-organizations');
      setOrganizations(response.data.organizations || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrgDetails(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    setUserRegistrationDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handlePeerCreationChange = (e) => {
    const { name, value } = e.target;
    setPeerCreationDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
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
      setError('Error creating organization: ' + (error.response?.data.message || error.message));
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setError('');

    
    const registrationDetailsWithCAName = {
      ...userRegistrationDetails,
      name: selectedOrg.name, 
    };

    try {
      const response = await axios.post('http://localhost:3003/register-user', registrationDetailsWithCAName);
      setSuccess('User registered successfully.');
      setShowRegisterUserForm(false); 
    } catch (error) {
      setError('Error registering user: ' + (error.response?.data.message || error.message));
    }
  };

  const handleCreatePeer = async (e) => {
    e.preventDefault();
    setError(''); 
    try {
      
      const response = await axios.post('http://localhost:3003/create-peer', peerCreationDetails);
      setSuccess('Peer created successfully.'); 
      setShowCreatePeerForm(false); 
    } catch (error) {
      setError('Error creating peer: ' + (error.response?.data.message || error.message));
    }
  };


  const handleOrgClick = (org) => {
    setSelectedOrg(org);
    setShowCreateNewOrg(false); 
  };

  const renderOrgDetails = () => {
    if (showCreateNewOrg) {
      return (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Create New Organization</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
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
            <Button variant="contained" color="primary" onClick={() => setShowRegisterUserForm(true)}>
              Register User
            </Button>
            <Button variant="contained" color="primary" onClick={() => setShowCreatePeerForm(true)}>
              Create Peer
            </Button>
          </div>
          {showRegisterUserForm && (
            <form onSubmit={handleRegisterUser}>
              <TextField
                required
                id="user"
                name="user"
                label="Username"
                fullWidth
                variant="outlined"
                value={userRegistrationDetails.user}
                onChange={handleRegistrationChange}
                margin="normal"
              />
              <TextField
                required
                id="secret"
                name="secret"
                label="Secret"
                fullWidth
                variant="outlined"
                value={userRegistrationDetails.secret}
                onChange={handleRegistrationChange}
                margin="normal"
              />
              <TextField
                required
                id="userType"
                name="userType"
                label="User Type"
                fullWidth
                variant="outlined"
                value={userRegistrationDetails.userType}
                onChange={handleRegistrationChange}
                margin="normal"
              />
              <TextField
                required
                id="enrollId"
                name="enrollId"
                label="Enroll ID"
                fullWidth
                variant="outlined"
                value={userRegistrationDetails.enrollId}
                onChange={handleRegistrationChange}
                margin="normal"
              />
              <TextField
                required
                id="enrollSecret"
                name="enrollSecret"
                label="Enroll Secret"
                fullWidth
                variant="outlined"
                value={userRegistrationDetails.enrollSecret}
                onChange={handleRegistrationChange}
                margin="normal"
              />
              <TextField
                required
                id="mspid"
                name="mspid"
                label="MSP ID"
                fullWidth
                variant="outlined"
                value={userRegistrationDetails.mspid}
                onChange={handleRegistrationChange}
                margin="normal"
              />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Submit
              </Button>
            </form>
          )}
          {showCreatePeerForm && (
            <form onSubmit={handleCreatePeer}>
              <TextField
                required
                id="name"
                name="name"
                label="Peer Name"
                fullWidth
                variant="outlined"
                value={peerCreationDetails.name}
                onChange={handlePeerCreationChange}
                margin="normal"
              />
              <TextField
                required
                id="hosts"
                name="hosts"
                label="Hosts"
                fullWidth
                variant="outlined"
                value={peerCreationDetails.hosts}
                onChange={handlePeerCreationChange}
                margin="normal"
              />
              <TextField
                required
                id="mspid"
                name="mspid"
                label="MSP ID"
                fullWidth
                variant="outlined"
                value={peerCreationDetails.mspid}
                onChange={handlePeerCreationChange}
                margin="normal"
              />
              <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Create Peer
              </Button>
            </form>
          )}
        </Paper>
      );
    } else {
      return <Typography variant="h6" sx={{ mt: 2 }}>Select an organization to view details</Typography>;
    }
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, paddingLeft: '0 !important' }}>
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
