import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';

/**
 * MainListItems renders navigation list items dynamically based on the user's role. It provides a set of
 * navigation buttons that are conditionally rendered to match the access level of the user (Hospital, Researcher, Admin).
 * Clicking on any of these buttons will change the currently active page in the main application dashboard.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.setClickedButton - A function from the parent component to set the current active page.
 * @param {string} props.role - The user's role, which determines which buttons are displayed.
 * @returns {React.ReactElement} A fragment containing conditional ListItemButton components based on the user's role.
 */
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
      {role == "NetAdmin" ? <ListItemButton onClick={() => setClickedButton("NetAdminPage")}>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="NetAdmin" />
      </ListItemButton> : <></>}
    </React.Fragment>
  );
};

/**
 * SecondaryListItems renders additional list items for secondary actions or navigation unrelated to the user's primary role,
 * such as logging in. This list is static and does not depend on the user's role.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.setClickedButton - A function from the parent component to set the current active page.
 * @returns {React.ReactElement} A fragment containing a ListSubheader and a ListItemButton for the login page.
 */
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
