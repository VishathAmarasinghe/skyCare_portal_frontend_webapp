import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}  />
      <GridToolbarFilterButton placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
      <GridToolbarQuickFilter placeholder="Search" />
    </GridToolbarContainer>
  );
}

const initialColumns: GridColDef[] = [
  { field: "incidentID", headerName: "Incident ID", width: 100, align: "center" },
  { field: "title", headerName: "title", width: 130 },
  { field: "type", headerName: "type", width: 130 },
  {
    field: "client",
    headerName: "client",
    flex: 1,
    renderCell: (params) => (
      <Chip
        avatar={<Avatar>{params.row.clientName.charAt(0).toUpperCase()}</Avatar>}
        label={params.value}
        variant="outlined"
      />
    ),
  },
  {
    field: "incidentDate",
    headerName: "Incident Date",
    width: 100,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "reportingDate",
    headerName: "Reporting Date",
    width: 150,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "createdBy",
    headerName: "Created By",
    flex: 1,
    renderCell: (params) => (
      <Chip
        avatar={<Avatar>{params.row.createdBy.charAt(0).toUpperCase()}</Avatar>}
        label={params.value}
        variant="outlined"
      />
    ),
  },
  {
    field: "action",
    headerName: "Action",
    width: 150,
    renderCell: (params) => {
      const navigate = useNavigate();
      return (
        <Stack flexDirection="row">
          <IconButton>
            <EditIcon />
          </IconButton>

          <IconButton>
            <DeleteIcon />
          </IconButton>

          <IconButton
            aria-label="view"
            onClick={() => {
              navigate(`/Clients/clientInfo?clientID=${params.row.clientID}`);
            }}
          >
            <RemoveRedEyeOutlinedIcon />
          </IconButton>
        </Stack>
      );
    },
  },
];

const sampleRows = [
    {
      incidentID: "INC001",
      title: "Data Breach",
      type: "Security",
      client: "Alice Johnson",
      clientName: "Alice Johnson",
      incidentDate: "2023-10-01",
      reportingDate: "2023-10-02",
      createdBy: "Sam Adams",
      clientID: "C001",
    },
    {
      incidentID: "INC002",
      title: "System Outage",
      type: "Operational",
      client: "Bob Smith",
      clientName: "Bob Smith",
      incidentDate: "2023-10-05",
      reportingDate: "2023-10-06",
      createdBy: "Laura Brown",
      clientID: "C002",
    },
    {
      incidentID: "INC003",
      title: "Phishing Attack",
      type: "Cybersecurity",
      client: "Charlie Davis",
      clientName: "Charlie Davis",
      incidentDate: "2023-10-07",
      reportingDate: "2023-10-08",
      createdBy: "Alex Johnson",
      clientID: "C003",
    },
    {
      incidentID: "INC004",
      title: "Server Maintenance",
      type: "IT",
      client: "Dana White",
      clientName: "Dana White",
      incidentDate: "2023-10-10",
      reportingDate: "2023-10-11",
      createdBy: "Chris Lee",
      clientID: "C004",
    },
    {
      incidentID: "INC005",
      title: "Software Update Issue",
      type: "Technical",
      client: "Evan Parker",
      clientName: "Evan Parker",
      incidentDate: "2023-10-12",
      reportingDate: "2023-10-13",
      createdBy: "Jamie Lin",
      clientID: "C005",
    },
  ];
  

interface ClientTableProps {
  
}

const IncidentTable = ({ }: ClientTableProps) => {
  const theme = useTheme();

  const handlePageChange = (newPage: number) => {
    
  };

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={sampleRows}
        columns={initialColumns}
        getRowId={(row) => row.incidentID}
        density="compact"
        disableSelectionOnClick
        pagination
        page={1}
        pageSize={5}
        onPageChange={handlePageChange}
        components={{
          Toolbar: CustomToolbar,
        }}
        sx={{
          
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "white",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "white",
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
        }}
      />
    </Box>
  );
};

export default IncidentTable;