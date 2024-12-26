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
import { Avatar, Box, Chip, IconButton, useTheme } from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../slices/store";
import { Client } from "../../../slices/clientSlice/client";
import { State } from "../../../types/types";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter placeholder="Search" />
    </GridToolbarContainer>
  );
}

const initialColumns: GridColDef[] = [
  { field: "clientID", headerName: "Client ID", flex: 1, align: "center" },
  { field: "firstName", headerName: "First Name", flex: 1 },
  { field: "lastName", headerName: "Last Name", flex: 1 },
  {
    field: "email",
    headerName: "Email Address",
    flex: 2,
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
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "clientType",
    headerName: "Client Type",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "action",
    headerName: "Action",
    flex: 1,
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

const ClientTable = () => {
  const theme = useTheme();
  const clientInfo = useAppSelector((state) => state.clients);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setClients(clientInfo.clients);
  }, [clientInfo.State]);

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DataGrid
        rows={clients}
        columns={initialColumns}
        getRowId={(row) => row.clientID}
        density="compact"
        loading={clientInfo.State === State.loading}
        pagination
        paginationMode="client"
        autoHeight
        initialState={{
          pagination: {
            paginationModel: { pageSize: 15 },
          },
        }}
        slots={{
          toolbar: CustomToolbar,
        }}
        sx={{
          flexGrow: 1,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.grey[200],
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
