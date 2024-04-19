import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload = ({ onFileSelectSuccess, onFileSelectError }) => {
    const [fileName, setFileName] = useState('');

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (!file) {
            onFileSelectError("No file selected");
        } else {
            setFileName(file.name);
            onFileSelectSuccess(file);
        }
    };

    return (
        <FormControl fullWidth>
            <InputLabel shrink htmlFor="upload-file">
                Upload File
            </InputLabel>
            <Input
                id="upload-file"
                type="file"
                onChange={handleFileInput}
                sx={{ display: 'none' }}
            />
            <TextField
                margin="normal"
                fullWidth
                variant="outlined"
                value={fileName}
                disabled
            />
            <label htmlFor="upload-file">
                <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                >
                    Upload
                </Button>
            </label>
        </FormControl>
    );
};

export default FileUpload;
