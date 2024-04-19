import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { Typography } from '@mui/material';

export default function FileUpload({ onFileSelectSuccess, onFileSelectError }) {

    const [fileName, setFileName] = useState('');

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (!file) {
            onFileSelectError("No file selected");
        } else {
            setFileName(file.name); // maybe just file?
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
                value={fileName == '' ? "Your filename.csv" : fileName}
                disabled
            />
            <Typography variant="caption" color="text.secondary">
                File must be in CSV format
            </Typography>
            <label htmlFor="upload-file">
                <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                >
                    Select File
                </Button>
            </label>
        </FormControl>
    );
};
