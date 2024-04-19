import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import AssignmentIcon from '@mui/icons-material/Assignment';

export const MainListItems = ({ setClickedButton, role }) => {
  return (
    <React.Fragment>
      {role == "Hospital" ? <ListItemButton onClick={() => setClickedButton("HospitalPage")}>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Hospital" />
      </ListItemButton> : <></>}
      {role == "Researcher" ? <ListItemButton onClick={() => setClickedButton("ResearcherPage")}>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Researcher" />
      </ListItemButton> : <></>}
      {role == "Admin" ? <ListItemButton onClick={() => setClickedButton("AdminPage")}>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Admin" />
      </ListItemButton> : <></>}
    </React.Fragment>
  );
};

export const SecondaryListItems = ({ setClickedButton }) => (
  <React.Fragment>
    <ListSubheader component="div" inset>
      Authentication
    </ListSubheader>
    <ListItemButton onClick={() => setClickedButton("LoginPage")}>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Login" />
    </ListItemButton>
  </React.Fragment>
);
