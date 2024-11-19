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
  { field: "resourceID", headerName: "Resource ID", width: 100, align: "center" },
  { field: "title", headerName: "Title", width: 130 },
  { field: "lastUpdatedDate", headerName: "Updated Date", width: 130 },
  {
    field: "createdBy",
    headerName: "Created By",
    flex: 1,
    renderCell: (params) => (
      <Chip
        avatar={<Avatar>{params.row.creatorName.charAt(0).toUpperCase()}</Avatar>}
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

const sampleResources = [
    {
      resourceID: "RES001",
      title: "Important Document",
      lastUpdatedDate: "2023-11-09",
      createdBy: "John Doe",
      creatorName: "John Doe",
    },
    {
      resourceID: "RES002",
      title: "Project Proposal",
      lastUpdatedDate: "2023-11-08",
      createdBy: "Jane Smith",
      creatorName: "Jane Smith",
    },
    {
      resourceID: "RES003",
      title: "Sales Report",
      lastUpdatedDate: "2023-11-07",
      createdBy: "Michael Chen",
      creatorName: "Michael Chen",
    },
    {
      resourceID: "RES004",
      title: "Marketing Strategy",
      lastUpdatedDate: "2023-11-06",
      createdBy: "Olivia Garcia",
      creatorName: "Olivia Garcia",
    },
    {
      resourceID: "RES005",
      title: "Financial Report",
      lastUpdatedDate: "2023-11-05",
      createdBy: "David Miller",
      creatorName: "David Miller",
    },
  ];
  

interface ClientTableProps {
  
}

const ResourceTable = ({ }: ClientTableProps) => {
  const theme = useTheme();

  const handlePageChange = (newPage: number) => {
    
  };

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={sampleResources}
        columns={initialColumns}
        getRowId={(row) => row.resourceID}
        density="compact"
        disableSelectionOnClick
        pagination
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

export default ResourceTable