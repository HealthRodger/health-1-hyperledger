import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { MainListItems, SecondaryListItems } from "./listItems";
import HospitalPage from "./Hospital/HospitalPage";
import AdminPage from "./Admin/AdminPage";
import ResearcherPage from "./Researcher/ResearcherPage";
import LoginPage from "./Login/LoginPage";
import axios from "axios";
import config from "../config";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  //Drawer component on the left
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

/**
 * Dashboard serves as the main root component for the web application, managing navigation,
 * user roles, and the display of various pages such as AdminPage, ResearcherPage, HospitalPage,
 * and LoginPage. This component includes a navigation drawer, a snackbar for notifications, and
 * dynamic content rendering based on the active user's role and selected navigation item.
 *
 * @component
 * @returns {React.ReactElement} - The rendered Dashboard component which includes the AppBar,
 */
function Dashboard() {
  const [open, setOpen] = React.useState(true); // State to control if the drawer is open
  const [clickedButton, setClickedButton] = React.useState("LoginPage"); // State to manage which page is active
  const [role, setRole] = React.useState(null); // State to store the user's role
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");

  React.useEffect(() => {
    // On component mount, fetch the user's role from the server
    // Get the username somehow, perhaps from local storage or context
    const username = localStorage.getItem("username");

    axios
      .post(`${config.apiUrl}/role_check`, { username })
      .then((response) => {
        console.log(response.data);
        if (response.data === "admin") {
          // If role check passes, set the role state
          setRole("Admin");
          setClickedButton("AdminPage");
        }
        if (response.data === "hospital") {
          // If role check passes, set the role state
          setRole("Hospital");
          setClickedButton("HospitalPage");
        }
        if (response.data === "researcher") {
          // If role check passes, set the role state
          setRole("Researcher");
          setClickedButton("ResearcherPage");
        }
      })
      .catch((error) => {
        const errorMessage = error.response?.data || error.message;
        setSnackbarMessage(`Error checking role: ${errorMessage}`);
        setSnackbarOpen(true);
      });
  }, []);

  const toggleDrawer = () => {
    // Function to toggle the drawer open/close
    setOpen(!open);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  return (
    // Applying the theme to the component tree
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <MainListItems setClickedButton={setClickedButton} role={role} />
            <Divider sx={{ my: 1 }} />
            <SecondaryListItems setClickedButton={setClickedButton} />
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />

          {clickedButton == "AdminPage" ? (
            <AdminPage showSnackbar={showSnackbar} />
          ) : clickedButton == "ResearcherPage" ? (
            <ResearcherPage />
          ) : clickedButton == "LoginPage" ? (
            <LoginPage />
          ) : (
            <HospitalPage />
          )}
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          {/* Notification component */}
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard;
