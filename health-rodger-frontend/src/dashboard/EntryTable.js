import * as React from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Button } from "@mui/material";
import Title from "./Title";

// Generate Order Data
function createData(
  id,
  mID,
  name,
  type,
  ipAdr,
  available,
  lastUpdate,
  isWearable,
  ownerHospital,
  ownerDepartment,
  ownerContactPerson
) {
  return {
    id,
    mID,
    name,
    type,
    ipAdr,
    available,
    lastUpdate,
    isWearable,
    ownerHospital,
    ownerDepartment,
    ownerContactPerson,
  };
}

const rows = [createData(2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2)];

function preventDefault(event) {
  event.preventDefault();
}
/**
 * EntryTable is a React component that renders a data table for displaying detailed entries.
 * It takes an array of entry objects as props and displays them in a table format. Each entry includes
 * details such as ID, name, type, IP address, availability, last update, wearable status, and ownership information.
 *
 * @component
 * @param {Object[]} entries - An array of objects containing the details of each entry to be displayed in the table.
 * Each object must contain the following properties:
 *   - {number} ID - Unique identifier for the entry.
 *   - {string} Name - Name of the entry.
 *   - {string} Type - Type classification of the entry.
 *   - {string} IpAddress - IP address associated with the entry.
 *   - {boolean} Available - Availability status of the entry.
 *   - {number} LastUpdate - Timestamp of the last update, stored as seconds since the Unix epoch.
 *   - {boolean} IsWearable - Indicates if the entry is wearable.
 *   - {string} Owner.Hospital - Name of the hospital owning the entry.
 *   - {string} Owner.Department - Department within the hospital that owns the entry.
 *   - {string} Owner.ContactPerson - Contact person for the entry within the hospital.
 * @returns {React.ReactElement} - The rendered table component wrapped in a React Fragment with overflow controls.
 */
function EntryTable({ entries }) {
  return (
    <React.Fragment>
      <Title>Entries</Title>
      <div style={{ maxHeight: "400px", overflow: "auto" }}>
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
                <TableCell>{entry.Available ? "Yes" : "No"}</TableCell>
                <TableCell>
                  {new Date(entry.LastUpdate * 1000).toLocaleString()}
                </TableCell>
                <TableCell>{entry.IsWearable ? "Yes" : "No"}</TableCell>
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

export default EntryTable;
