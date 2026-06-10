import React, { useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  useTheme,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../slices/store";
import { Client } from "../../../slices/clientSlice/client";
import { State } from "../../../types/types";
import malAvatar from "../../../assets/images/maleavatar.jpg";
import femaleAvatar from "../../../assets/images/female.png";
import roboAvatar from "../../../assets/images/roboavatar.png";
import BulkSendAgreementsDialog from "../../employee-view/components/BulkSendAgreementsDialog";

interface CustomToolbarProps {
  showDeactivated: boolean;
  onToggleDeactivated: (checked: boolean) => void;
  selectedCount: number;
  onBulkSend: () => void;
}

function CustomToolbar({
  showDeactivated,
  onToggleDeactivated,
  selectedCount,
  onBulkSend,
}: CustomToolbarProps) {
  return (
    <GridToolbarContainer sx={{ justifyContent: "space-between" }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarQuickFilter placeholder="Search" />
        <FormControlLabel
          control={
            <Checkbox
              checked={showDeactivated}
              onChange={(e) => onToggleDeactivated(e.target.checked)}
              size="small"
            />
          }
          label="Show deactivated clients"
          sx={{ marginLeft: 2 }}
        />
      </Stack>
      {selectedCount > 0 && (
        <Button
          variant="contained"
          size="small"
          startIcon={<SendOutlinedIcon />}
          onClick={onBulkSend}
        >
          Bulk send agreements ({selectedCount})
        </Button>
      )}
    </GridToolbarContainer>
  );
}

const ClientTable = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const clientInfo = useAppSelector((state) => state.clients);
  const auth = useAppSelector((state) => state.auth);
  const [clients, setClients] = useState<Client[]>([]);
  const [showDeactivated, setShowDeactivated] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bulkSendOpen, setBulkSendOpen] = useState(false);

  useEffect(() => {
    let filteredClients = clientInfo.clients;

    if (!showDeactivated) {
      filteredClients = clientInfo.clients.filter(
        (client) => client.status !== "Deactivated"
      );
    }

    setClients(filteredClients);
  }, [clientInfo.State, clientInfo.clients, showDeactivated]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "referenceNo",
        headerName: "Reference No",
        width: 180,
        align: "left",
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
                {params.row.email?.charAt(0).toUpperCase()}
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
          const gender = params.value as "Male" | "Female" | "Other";
          const chipStyles = {
            Male: { backgroundColor: "#1976d2", color: "white" },
            Female: { backgroundColor: "#e91e63", color: "white" },
            Other: { backgroundColor: "#9e9e9e", color: "white" },
          };
          const style = chipStyles[gender] || chipStyles.Other;
          return (
            <Chip
              size="small"
              label={gender || "Other"}
              sx={{ ...style, width: "70px", height: "25px" }}
            />
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={
              params.value === "Activated"
                ? "success"
                : params.value === "Deactivated"
                ? "error"
                : "default"
            }
          />
        ),
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
        width: 80,
        sortable: false,
        renderCell: (params) => (
          <IconButton
            aria-label="view"
            size="small"
            onClick={() => {
              navigate(`/Clients/clientInfo?clientID=${params.row.clientID}`);
            }}
          >
            <RemoveRedEyeOutlinedIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    [navigate]
  );

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
        columns={columns}
        getRowId={(row) => row.clientID}
        density="compact"
        loading={clientInfo.State === State.loading}
        pagination
        paginationMode="client"
        pageSizeOptions={[15, 20, 25]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 15 },
          },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={(model) => setSelectedRows(model as string[])}
        isRowSelectable={(params) => params.row.status !== "Deactivated"}
        slots={{
          toolbar: () => (
            <CustomToolbar
              showDeactivated={showDeactivated}
              onToggleDeactivated={setShowDeactivated}
              selectedCount={selectedRows.length}
              onBulkSend={() => setBulkSendOpen(true)}
            />
          ),
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
      <BulkSendAgreementsDialog
        open={bulkSendOpen}
        onClose={() => setBulkSendOpen(false)}
        recipientType="CLIENT"
        recipientIds={selectedRows}
        adminEmployeeId={auth.userInfo?.userID ?? ""}
        onComplete={() => {
          setBulkSendOpen(false);
          setSelectedRows([]);
        }}
      />
    </Box>
  );
};

export default ClientTable;
