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
          {entries.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.mID}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.ipAdr}</TableCell>
                <TableCell>{row.available}</TableCell>
                <TableCell>{row.lastUpdate}</TableCell>
                <TableCell>{row.isWearable}</TableCell>
                <TableCell>{row.ownerHospital}</TableCell>
                <TableCell>{row.ownerDepartment}</TableCell>
                <TableCell>{row.ownerContactPerson}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </React.Fragment>
  );
}
