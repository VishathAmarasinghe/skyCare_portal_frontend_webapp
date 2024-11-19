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
      <GridToolbarColumnsButton   />
      <GridToolbarFilterButton  />
      <GridToolbarQuickFilter placeholder="Search" />
    </GridToolbarContainer>
  );
}

const initialColumns: GridColDef[] = [
  { field: "employeeID", headerName: "Employee ID", width: 100, align: "center" },
  { field: "firstName", headerName: "First Name", width: 130 },
  { field: "lastName", headerName: "Last Name", width: 130 },
  {
    field: "email",
    headerName: "Email",
    flex: 1,
    renderCell: (params) => (
      <Chip
        avatar={<Avatar>{params.row.email.charAt(0).toUpperCase()}</Avatar>}
        label={params.value}
        variant="outlined"
      />
    ),
  },
  {
    field: "occupation",
    headerName: "Occupation",
    width: 100,
    headerAlign: "center",
    align: "center",
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

const sampleEmployees = [
    {
      employeeID: "EMP001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@company.com",
      occupation: "admin",
    },
    {
      employeeID: "EMP002",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@company.com",
      occupation: "staff",
    },
    {
      employeeID: "EMP003",
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@company.com",
      occupation: "admin",
    },
    {
      employeeID: "EMP004",
      lastName: "Garcia",
      email: "olivia.garcia@company.com",
      occupation: "staff",
    },
    {
      employeeID: "EMP005",
      firstName: "David",
      lastName: "Miller",
      email: "david.miller@company.com",
      occupation: "staff",
    },
  ];
  

interface ClientTableProps {
  
}

const EmployeeTable = ({ }: ClientTableProps) => {
  const theme = useTheme();

  const handlePageChange = (newPage: number) => {
    
  };

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={sampleEmployees}
        columns={initialColumns}
        getRowId={(row) => row.employeeID}
        density="compact"
        paginationMode="server"
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

export default EmployeeTable
