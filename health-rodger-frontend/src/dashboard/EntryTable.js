import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Button } from '@mui/material';
import Title from './Title';

// Generate Order Data
function createData(id, mID, name, type, ipAdr, available, lastUpdate, isWearable, ownerHospital, ownerDepartment, ownerContactPerson) {
  return { id, mID, name, type, ipAdr, available, lastUpdate, isWearable, ownerHospital, ownerDepartment, ownerContactPerson };
}

const rows = [
  createData(2, 2, 2, 2, 2, 2,2, 2,2, 2, 2),
];

function preventDefault(event) {
  event.preventDefault();
}

export default function EntryTable({ entries }) {
  return (
    <React.Fragment>
      <Title>Entries</Title>
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Ip Address</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Last Update</TableCell>
              <TableCell>Is Wearable</TableCell>
              <TableCell>Owner_Hospital</TableCell>
              <TableCell>Owner_Department</TableCell>
              <TableCell>Owner_Contact_Person</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.ID}>
                <TableCell>{entry.ID}</TableCell>
                <TableCell>{entry.Name}</TableCell>
                <TableCell>{entry.Type}</TableCell>
                <TableCell>{entry.IpAddress}</TableCell>
                <TableCell>{entry.Available ? 'Yes' : 'No'}</TableCell>
                <TableCell>{new Date(entry.LastUpdate * 1000).toLocaleString()}</TableCell>
                <TableCell>{entry.IsWearable ? 'Yes' : 'No'}</TableCell>
                <TableCell>{entry.Owner.Hospital}</TableCell>
                <TableCell>{entry.Owner.Department}</TableCell>
                <TableCell>{entry.Owner.ContactPerson}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </React.Fragment>
  );
}

