import React, { useEffect, useState } from "react";
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
  Typography,
  useTheme,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import BulkSendAgreementsDialog from "./BulkSendAgreementsDialog";
import {
  Employee,
  deletePendingEmployee,
  fetchEmployeesByRole,
  fetchSingleEmployee,
} from "../../../slices/employeeSlice/employee";
import { fetchCareGivers } from "@slices/careGiverSlice/careGiver";
import { useConfirmationModalContext } from "../../../context/DialogContext";
import { ConfirmationType } from "../../../types/types";
import { FILE_DOWNLOAD_BASE_URL } from "../../../config/config";
import { fetchSingleCareGiverByEmployeeID } from "@slices/careGiverSlice/careGiver";
import {
  DEFAULT_CARE_GIVER_TYPE,
  getCareGiverTypeChipStyle,
  getCareGiverTypeLabel,
} from "../../../constants/index";

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
          label="Show deactivated employees"
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

interface ClientTableProps {}

const EmployeeTable = ({}: ClientTableProps) => {
  const theme = useTheme();
  const employeeSlice = useAppSelector((state) => state.employees);
  const careGiverSlice = useAppSelector((state) => state.careGivers);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showDeactivated, setShowDeactivated] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bulkSendOpen, setBulkSendOpen] = useState(false);
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { showConfirmation } = useConfirmationModalContext();

  const refreshEmployees = (accessRole: string) => {
    const role = accessRole === "Admin" ? "Admin" : "CareGiver";
    dispatch(fetchEmployeesByRole(role));
    if (role === "CareGiver") {
      dispatch(fetchCareGivers());
    }
  };

  const confirmDeletePendingEmployee = (employee: Employee) => {
    const name = `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.email;
    showConfirmation(
      "Delete pending employee",
      `Are you sure you want to delete "${name}"? This will permanently remove their pending profile. This action cannot be undone.`,
      "accept" as ConfirmationType,
      async () => {
        await dispatch(deletePendingEmployee(employee.employeeID)).unwrap();
        setSelectedRows((current) => current.filter((id) => id !== employee.employeeID));
        refreshEmployees(employee.accessRole);
      },
      "Delete",
      "Cancel"
    );
  };

  const careGiverTypeByEmployeeId = React.useMemo(() => {
    const map = new Map<string, string>();
    careGiverSlice.careGivers?.forEach((careGiver) => {
      const employeeId = careGiver?.employee?.employeeID;
      if (employeeId) {
        map.set(
          employeeId,
          careGiver.careGiverType?.trim() || DEFAULT_CARE_GIVER_TYPE
        );
      }
    });
    return map;
  }, [careGiverSlice.careGivers]);

  const selectedCareGiverIds = React.useMemo(
    () =>
      selectedRows
        .map((employeeId) => {
          const cg = careGiverSlice.careGivers?.find(
            (c) => c.employee?.employeeID === employeeId
          );
          return cg?.careGiverID;
        })
        .filter(Boolean) as string[],
    [selectedRows, careGiverSlice.careGivers]
  );

  useEffect(() => {
    let filteredEmployees = employeeSlice.employees;
    
    if (!showDeactivated) {
      filteredEmployees = employeeSlice.employees.filter(
        (employee) => employee.status !== "Deactivated"
      );
    }
    
    setEmployees(filteredEmployees);
  }, [employeeSlice.state, employeeSlice.employees, showDeactivated]);

  const handlePageChange = (newPage: number) => {};

  const initialColumns: GridColDef[] = [
    // {
    //   field: "employeeID",
    //   headerName: "Employee ID",
    //   width: 100,
    //   align: "center",
    // },
    { field: "firstName", headerName: "First Name", width: 130 },
    { field: "lastName", headerName: "Last Name", width: 130 },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      renderCell: (params) => {
        const employeeImage = employees?.find(
          (emp) => emp.employeeID === params?.row?.employeeID
        )?.profile_photo;
        return (
          <Chip
            avatar={
              <Avatar
                src={
                  employeeImage
                    ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                        employeeImage
                      )}`
                    : ""
                } // Replace with your avatar URL logic
                alt={
                  params.row.firstName ||
                  params.row.lastName ||
                  params.row.email
                }
              >
                {params.row?.email?.charAt(0).toUpperCase()}
              </Avatar>
            }
            label={params.value}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "address",
      headerName: "Address",
      flex:2,
      renderCell: (params) => params?.row?.employeeAddresses[0]?.address,
    },
    {
      field: "phone No",
      headerName: "Phone No",
      width: 100,
      renderCell: (params) => params?.row?.employeePhoneNo[0],
    },
    {
      field: "accessRole",
      headerName: "Care Giver Type",
      width: 140,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const role = params.value;

        if (role === "CareGiver") {
          const careGiverType =
            careGiverTypeByEmployeeId.get(params.row.employeeID) ||
            DEFAULT_CARE_GIVER_TYPE;
          const chipStyle = getCareGiverTypeChipStyle(careGiverType);

          return (
            <Chip
              size="small"
              label={getCareGiverTypeLabel(careGiverType)}
              variant="outlined"
              sx={{
                fontWeight: 600,
                ...chipStyle,
                border: `1px solid ${chipStyle.borderColor}`,
              }}
            />
          );
        }

        let color: "default" | "success" | "primary" = "default";
        switch (role) {
          case "Admin":
            color = "success";
            break;
          default:
            color = "default";
        }

        return (
          <Chip size="small" label={role} color={color} variant="outlined" />
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const status = params.value;
        let chipStyle = {}; // Default style

        // Assign background and text colors based on the status
        switch (status) {
          case "Activated":
            chipStyle = { backgroundColor: "#4caf50", color: "white" }; // Green
            break;
          case "Deactivated":
            chipStyle = { backgroundColor: "#f44336", color: "white" }; // Red
            break;
          case "Pending":
            chipStyle = { backgroundColor: "#ffc107", color: "black" }; // Yellow
            break;
          default:
            chipStyle = { backgroundColor: "#9e9e9e", color: "white" }; // Grey
        }

        return (
          <Chip
            size="small"
            label={status}
            style={chipStyle} // Apply the custom style
            variant="filled"
          />
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const navigate = useNavigate();
        const isPending = params.row.status === "Pending";

        return (
          <Stack flexDirection="row" justifyContent="center">
            <IconButton
              aria-label="view"
              onClick={() => {
                if (params?.row?.accessRole == "CareGiver") {
                  dispatch(
                    fetchSingleCareGiverByEmployeeID(params?.row?.employeeID)
                  );
                  navigate(
                    `/Employees/employeeInfo?employeeID=${params.row.employeeID}`
                  );
                } else {
                  dispatch(fetchSingleEmployee(params.row.employeeID));
                }
              }}
            >
              <RemoveRedEyeOutlinedIcon />
            </IconButton>
            {isPending && (
              <IconButton
                aria-label="delete pending employee"
                color="error"
                onClick={() => confirmDeletePendingEmployee(params.row as Employee)}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <Box sx={{ height: "100%", width: "100%", overflowY:"auto" }}>
      <DataGrid
        rows={employees}
        columns={initialColumns}
        getRowId={(row) => row.employeeID}
        density="compact"
        pagination
        paginationMode="client"
        pageSizeOptions={[8, 12, 20]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 8 },
          },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={(model) => setSelectedRows(model as string[])}
        isRowSelectable={(params) => params.row.accessRole === "CareGiver"}
        slots={{
          toolbar: () => (
            <CustomToolbar
              showDeactivated={showDeactivated}
              onToggleDeactivated={setShowDeactivated}
              selectedCount={selectedCareGiverIds.length}
              onBulkSend={() => setBulkSendOpen(true)}
            />
          ),
        }}
        sx={{
          height: "100%",
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
      <BulkSendAgreementsDialog
        open={bulkSendOpen}
        onClose={() => setBulkSendOpen(false)}
        recipientType="WORKER"
        recipientIds={selectedCareGiverIds}
        adminEmployeeId={auth.userInfo?.userID ?? ""}
        onComplete={() => {
          setBulkSendOpen(false);
          setSelectedRows([]);
        }}
      />
    </Box>
  );
};

export default EmployeeTable;
