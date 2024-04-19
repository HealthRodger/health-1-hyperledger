import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "./Title";
/**
 * GenericTable is a React component that renders a table for displaying entries based on provided headers and entry data.
 * It accepts an array of header titles and an array of entry objects, rendering each entry in rows under the appropriate headers.
 * This component is versatile and can be used in various parts of an application where tabular data needs to be displayed.
 *
 * @component
 * @param {Object} props - The props for the component.
 * @param {string[]} props.headers - An array of strings representing the column headers to display in the table.
 * @param {Object[]} props.entries - An array of objects where each object represents a row of data in the table.
 *   Each object's keys should correspond to the headers provided, and the values are the data displayed in the table cells.
 *
 * @returns {React.ReactElement} A component that renders a table with a scrollable body, ensuring that the content is
 *   viewable within a confined space.
 */
function GenericTable({ headers, entries }) {
  return (
    <React.Fragment>
      <Title>Entries</Title>
      <div style={{ maxHeight: "400px", overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.ID}>
                {headers.map((header) => (
                  <TableCell key={header}>
                    {typeof entry[header] !== "string" && entry[header] !== null
                      ? JSON.stringify(entry[header])
                      : entry[header]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </React.Fragment>
  );
}

export default GenericTable;
