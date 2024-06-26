import * as React from "react";
import { useState } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { useEffect } from "react";
import config from "../../config";

/**
 * AdminPage component for managing user accounts.
 * In this page:
 * 
 * - You can view existing users.
 * - You can remove existing users. (Revoke their certificate)
 * - You can signup new users. (Using a username, password, and a role)
 * @component
 * @param {Object} props - Props for AdminPage component.
 * @param {function} props.showSnackbar - Function to invoke to display a snackbar message. Used for notifying the user.
 * @returns {React.ReactElement} A React component that renders the AdminPage.
 */
function AdminPage({showSnackbar}) {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "",
  });

  const fetchUsers = () => {
    const x_username = localStorage.getItem("username");
    axios
      .get(`${config.apiUrl}/users`, {
        headers: {
          "x-user": x_username, // Include the "x-user" header
        },
      })
      .then((response) => {
        // Process the user data to extract roles
        const formattedUsers = response.data
          .filter((user) => {
            // Exclude users whose 'revoked' attribute is true or have specific ids
            return !user.revoked && user.id !== "enroll" && user.id !== "peer";
          }) // Properly excludes revoked users and those with ids 'enroll' or 'peer'
          .map((user) => {
            let roleAttribute = user.attributes.find(
              (attr) => attr.name === "role"
            );
            if (user.id === "admin") {
              roleAttribute = { value: "admin" }; // Create an object that mimics the expected structure
            }

            return {
              id: user.id,
              role: roleAttribute ? roleAttribute.value : "No role assigned", // Fallback in case 'role' is not found
            };
          });
        setUsers(formattedUsers);
      })
      .catch((error) => {
        const errorMessage = error.response?.data || error.message || "Error fetching users:";
        showSnackbar(errorMessage); // Use the passed-down function to show the snackbar
      });
  };
  useEffect(() => {
    // Fetch users when the component mounts
    fetchUsers();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleAddUser = () => {
    const x_username = localStorage.getItem("username");
    if (newUser.username && newUser.password && newUser.role) {
      // Construct the user data
      const userData = {
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
      };

      // Send a POST request to the server
      axios
        .post(`${config.apiUrl}/signup`, userData, {
          headers: {
            "x-user": x_username, // Include the "x-user" header
          },
        })
        .then((response) => {
          // Add user to the local state if you still need to
          setUsers([...users, newUser]);
          // Reset the newUser state
          setNewUser({ username: "", password: "", role: "" });
          fetchUsers();
        })
        .catch((error) => {
          const errorMessage = error.response?.data || error.message || "Failed to add user";
          showSnackbar(errorMessage); // Use the passed-down function to show the snackbar
        });
    } else {
      // Handle validation error
      showSnackbar("All fields are required."); // Use the passed-down function to show the snackbar
    }
  };

  const handleRemoveUser = (username) => {
    const x_username = localStorage.getItem("username");
    // Call the backend to revoke the user
    axios
      .post(
        `${config.apiUrl}/revoke`,
        { username: username },
        {
          headers: {
            "x-user": x_username, // Include the "x-user" header
          },
        }
      )
      .then((response) => {
        console.log("User revoked:", response.data.message);
        // Filter out the user from the list based on username
        setUsers(users.filter((user) => user.id !== username));
        // Fetch the updated list of users, if necessary
        fetchUsers();
      })
      .catch((error) => {
        console.error(
          "Error revoking user:",
          error.response?.data || error.message
        );
      });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Add User Form */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add User
            </Typography>
            <TextField
              margin="normal"
              fullWidth
              name="username"
              label="Username"
              value={newUser.username}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={newUser.password}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={newUser.role}
                label="Role"
                onChange={handleInputChange}
              >
                <MenuItem value="hospital">Hospital</MenuItem>
                <MenuItem value="researcher">Researcher</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </Paper>
        </Grid>
        {/* Users List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Users
            </Typography>
            <List>
              {users.map((user, index) => (
                <ListItem key={user.id}>
                  <ListItemText primary={user.id} secondary={user.role} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminPage
