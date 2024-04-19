import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "./Title";

export default function GenericTable({ headers, entries }) {
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
