import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import * as $ from 'jquery';

export default function FileUpload() {

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

    const [uploadStatus, setUploadStatus] = useState('');

    const handleUploadClick = async (e) => {
        e.preventDefault();
        if (!file) {
        return;
        }

        
        // Retrieve the username from local storage
        const username = localStorage.getItem('username');

        let data = $.csv.toObjects(fileName);
        let success = []
        let fail = []
        let count = 0
        for(var asset of data) {

            // Skip first line of csv with the headers
            if (count == 0 ) { 
                count++;
                continue;
            }
            
            // Submit each asset individually
            try {
        
                const args = [
                    asset.id,
                    asset.name,
                    asset.type,
                    asset.ipAddress,
                    asset.available,
                    asset.lastUpdate,
                    asset.isWearable,
                    asset.gpsLocation.replace("\"", ""), // Remove quotation marks present in csv file
                    asset.hospital,
                    asset.department,
                    asset.contactPerson,
                ];
                
                // Check if the username exists
                if (!username) {
                    throw new Error('No username found in local storage.');
                }
            
                // Make the HTTP post request with the "x-user" header
                const response = await axios.post('http://localhost:3003/submit', {
                    fcn: 'CreateAsset',
                    args: args,
                }, {
                    headers: {
                    'x-user': username, // Include the "x-user" header
                    },
                });
            
                if (response.status === 200) {
                    setUploadStatus('Asset submitted successfully');
                    success.append(count);
                } else {
                    setUploadStatus('Failed to submit an asset');
                    fail.append(count);
                }
            } catch (error) {
            setUploadStatus(`Error submitting an asset: ${error.message}`);
            fail.append(count);
            }
            count++;
        }

        // Set final uploadstatus
        let failureinfo = ""
        if( length(fail) > 0 ) {
            failureinfo = "\nFailures were on lines: "
            for( num of fail) {
                failureinfo = failureinfo + num.toString() + ", "
            }
            failureinfo = failureinfo.substring(0, str.length - 2);
        }
        setUploadStatus( str(success.length) + "/" + str(count - 1) + " assets successfully uploaded" + failureinfo)

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
                    onClick={handleUploadClick}
                    variant="contained"
                    color="primary"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                >
                    Upload
                </Button>
            </label>
            <TextField
                margin="normal"
                fullWidth
                variant="outlined"
                value={uploadStatus}
                disabled
            />
        </FormControl>
    );
};
