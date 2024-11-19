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
      <GridToolbarColumnsButton
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      />
      <GridToolbarFilterButton
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      />
      <GridToolbarQuickFilter placeholder="Search" />
    </GridToolbarContainer>
  );
}

const initialColumns: GridColDef[] = [
  { field: "carePlanID", headerName: "Care Plan ID", width: 100, align: "center" },
  { field: "startDate", headerName: "Start Date" },
  { field: "endDate", headerName: "End Date" },

  {
    field: "carePlan",
    headerName: "Care Plan",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "status",
    headerName: "Status",
    width: 100,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "action",
    headerName: "Action",
    width: 150,
    align: "center",
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
      carePlanID: "CP001",
      startDate: "2023-01-01",
      endDate: "2023-06-01",
      carePlan: "General Health",
      status: "Active",
    },
    {
      carePlanID: "CP002",
      startDate: "2023-02-15",
      endDate: "2023-07-15",
      carePlan: "Diabetes Management",
      status: "Pending",
    },
    {
      carePlanID: "CP003",
      startDate: "2023-03-10",
      endDate: "2023-09-10",
      carePlan: "Cardiac Care",
      status: "Completed",
    },
  ];
  
  

interface ClientTableProps {}

const CarePlanTable = ({}: ClientTableProps) => {
  const theme = useTheme();

  const handlePageChange = (newPage: number) => {};

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={sampleRows}
        columns={initialColumns}
        getRowId={(row) => row.carePlanID}
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

export default CarePlanTable