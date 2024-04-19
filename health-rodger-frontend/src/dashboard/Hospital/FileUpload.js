import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Input from "@mui/material/Input";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from 'axios';
import { Typography } from '@mui/material';

/**
 * Provides a button that allows users to select a file to upload.
 *
 * This component displays a button that opens a file selector when clicked. The name of the selected
 * file is shown in a non-editable text field. If a file is successfully selected, the `onFileSelectSuccess`
 * callback is invoked with the selected file. If no file is selected, or there is an error, the
 * `onFileSelectError` callback is invoked with an error message.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onFileSelectSuccess - The callback function to be called when a file is selected successfully.
 * @param {Function} props.onFileSelectError - The callback function to be called when an error occurs during file selection.
 * @returns {React.ReactElement} The `FileUpload` component.
 */
const FileUpload = ({ onFileSelectSuccess, onFileSelectError }) => {
  // State to store the name of the file
  const [fileName, setFileName] = useState("");

  // handleFileInput is called when the user selects a file.
  const handleFileInput = (e) => {
    // Get the first file from the FileList object
    const file = e.target.files[0];
    if (!file) {
      // If no file is selected, call the onFileSelectError callback
      onFileSelectError("No file selected");
    } else {
      // Update the fileName state and call the onFileSelectSuccess callback with the selected file
      setFileName(file.name);
      onFileSelectSuccess(file);
    }
  };

  return (
    // FormControl is used here for the layout of the upload button and file name display
    <FormControl fullWidth>
      {/* InputLabel is used to label the hidden file input element */}
      <InputLabel shrink htmlFor="upload-file">
        Upload File
      </InputLabel>
      {/* The Input element is hidden and when clicked will open the file selector */}
      <Input
        id="upload-file"
        type="file"
        onChange={handleFileInput}
        sx={{ display: "none" }}
      />
      {/* TextField is used to display the selected file name, but it is disabled for user editing */}
      <TextField
        margin="normal"
        fullWidth
        value={fileName == '' ? "Your filename.csv" : fileName}
        disabled
      />
    <Typography variant="caption" color="text.secondary">
                File must be in CSV format
    </Typography>
      {/* Label element used as a wrapper for the Button to trigger the file input */}
      <label htmlFor="upload-file">
        {/* Button styled as a contained button that triggers the hidden file input */}
        <Button
          variant="contained"
          color="primary"
          component="span" // Ensures the button behaves as an inline element
          startIcon={<CloudUploadIcon />} // Adds the upload cloud icon to the button
        >
          Upload
        </Button>
      </label>
    </FormControl>
  );
};

export default FileUpload;
