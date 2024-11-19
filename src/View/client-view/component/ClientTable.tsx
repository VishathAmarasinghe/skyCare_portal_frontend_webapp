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
  Typography,
  useTheme,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@slices/store";
import { Client } from "@slices/clientSlice/client";
import { State } from "../../../types/types";

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
  { field: "clientID", headerName: "Client ID", width: 100, align: "center" },
  { field: "firstName", headerName: "First Name", width: 130 },
  { field: "lastName", headerName: "Last Name", width: 130 },
  {
    field: "email",
    headerName: "Email Address",
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
    field: "gender",
    headerName: "Gender",
    width: 100,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "clientType",
    headerName: "Client Type",
    width: 150,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "action",
    headerName: "Action",
    width: 80,
    renderCell: (params) => {
      const navigate = useNavigate();
      return (
        <IconButton
          aria-label="view"
          onClick={() => {
            navigate(`/Clients/clientInfo?clientID=${params.row.clientID}`);
          }}
        >
          <RemoveRedEyeOutlinedIcon />
        </IconButton>
      );
    },
  },
];



interface ClientTableProps {
  
}

const ClientTable = ({ }: ClientTableProps) => {
  const theme = useTheme();
  const clientInfo = useAppSelector((state) => state.clients);
  const [clients, setClients] = useState<Client[]>([]);

  const handlePageChange = (newPage: number) => {
    
  };

  useEffect(() => {
    console.log("function called");
      setClients(clientInfo.clients);
    }, [clientInfo.State]);

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={clients}
        columns={initialColumns}
        getRowId={(row) => row.clientID}
        density="compact"
        loading={clientInfo.State === State.loading}
        pagination
        paginationMode="client"
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5 },
          },
        }}
        slots={{
          toolbar: CustomToolbar,
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

export default ClientTable;
