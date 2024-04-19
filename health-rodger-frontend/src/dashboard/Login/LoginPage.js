import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import config from "../../config";

const defaultTheme = createTheme();

/**
 * LoginPage is a React component that provides a user interface for logging into the application. Any user using the system has to be authenticated.
 * 
 * This component displays a form for users to input their username and password. Upon submission,
 * it sends a POST request to the server with these credentials. If authentication is successful,
 * the username is stored in local storage, a success message is shown, and the page is reloaded.
 * If authentication fails, an error message is displayed using a Snackbar.
 *
 * @component
 * @returns {React.ReactElement} The `LoginPage` component.
 */
function LoginPage() {
  const [open, setOpen] = useState(false); // State for Snackbar visibility
  const [notification, setNotification] = useState(""); // State for notification message

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get("uname"); // Adjust according to your backend expectation
    const password = data.get("password");

    try {
      const response = await axios.post(`${config.apiUrl}/login`, {
        username,
        password,
      });

      // Assuming your server sends back a positive response for successful login
      console.log(response.data);
      localStorage.setItem("username", username); // Save username in local storage
      setNotification("Login successful"); // Set notification message
      setOpen(true); // Show notification

      window.location.reload(); // This will reload the entire page
    } catch (error) {
      console.error("Failed to submit:", error);
      setNotification("Login failed: Incorrect username or password"); // Set notification message
      setOpen(true); // Show notification
    }
  };

  // Function to close the Snackbar
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="uname"
              label="Username"
              name="uname"
              autoComplete="Username"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity={notification.includes("failed") ? "error" : "success"}
            sx={{ width: "100%" }}
          >
            {notification}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default LoginPage;
