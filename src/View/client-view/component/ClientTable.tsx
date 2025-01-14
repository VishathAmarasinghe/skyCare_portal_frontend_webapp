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
import malAvatar from "../../../assets/images/maleavatar.jpg";
import femaleAvatar from "../../../assets/images/female.png";
import roboAvatar from "../../../assets/images/roboavatar.png";

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
  { field: "clientID", headerName: "Client ID", width:100, align: "left" },
  {
    field:"referenceNo",headerName:"Reference No",width:180,align:"left"
  },
  { field: "firstName", headerName: "First Name", flex: 1 },
  { field: "lastName", headerName: "Last Name", flex: 1 },
  {
    field: "email",
    headerName: "Email Address",
    flex: 2,
    renderCell: (params) => (
      <Chip
        avatar={
          <Avatar
            src={
              params?.row?.gender === "Male"
                ? malAvatar
                : params?.row?.gender === "Female"
                ? femaleAvatar
                : roboAvatar
            }
          >
            {params.row.email.charAt(0).toUpperCase()}
          </Avatar>
        }
        label={params.value}
        variant="outlined"
      />
    ),
  },
  {
    field: "clientStatus",
    headerName: "Client Status",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "clientClassifications",
    headerName: "Client Fundings",
    width: 260,
    headerAlign: "left",
    align: "left",
  },
  {
    field: "gender",
    headerName: "Gender",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      const gender = params.value as keyof typeof chipStyles;

      // Define colors for different genders
      const chipStyles = {
        Male: { backgroundColor: "#1976d2", color: "white" }, // Blue for Male
        Female: { backgroundColor: "#e91e63", color: "white" }, // Pink for Female
        Other: { backgroundColor: "#9e9e9e", color: "white" }, // Gray for Other
      };

      const style = chipStyles[gender] || chipStyles["Other"];

      return (
        <Chip
          size="small"
          label={gender || "Other"}
          sx={{
            ...style,
            width: "70px", // Fixed width
            height: "25px", // Fixed height
            // fontWeight: "bold",
          }}
        />
      );
    },
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
        pageSizeOptions={[ 15, 20,25]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 15 },
          },
        }}
        slots={{
          toolbar: CustomToolbar,
        }}
        sx={{
          height: "100%",
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
