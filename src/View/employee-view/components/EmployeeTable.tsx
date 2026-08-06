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
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import BulkSendAgreementsDialog from "./BulkSendAgreementsDialog";
import {
  Employee,
  deletePendingEmployee,
  fetchEmployeesByRole,
  fetchSingleEmployee,
  updateTimesheetSubmissionDisabled,
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

const employeeInfoPath = (employeeID: string) =>
  `/Employees/employeeInfo?employeeID=${employeeID}`;

interface ClientTableProps {}

const EmployeeTable = ({}: ClientTableProps) => {
  const navigate = useNavigate();
  const employeeSlice = useAppSelector((state) => state.employees);
  const careGiverSlice = useAppSelector((state) => state.careGivers);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showDeactivated, setShowDeactivated] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bulkSendOpen, setBulkSendOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuEmployee, setMenuEmployee] = useState<Employee | null>(null);
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

  const closeActionMenu = () => {
    setMenuAnchor(null);
    setMenuEmployee(null);
  };

  const openActionMenu = (
    event: React.MouseEvent<HTMLElement>,
    employee: Employee
  ) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuEmployee(employee);
  };

  const viewCareGiverDetails = (employee: Employee, newTab = false) => {
    dispatch(fetchSingleCareGiverByEmployeeID(employee.employeeID));
    const path = employeeInfoPath(employee.employeeID);
    if (newTab) {
      window.open(`${window.location.origin}${path}`, "_blank", "noopener,noreferrer");
    } else {
      navigate(path);
    }
  };

  const handleRowClick = (employee: Employee, event: React.MouseEvent) => {
    if (employee.accessRole !== "CareGiver") return;
    const target = event.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest(".MuiCheckbox-root") ||
      target.closest('[role="checkbox"]') ||
      target.closest(".MuiDataGrid-cellCheckbox")
    ) {
      return;
    }
    viewCareGiverDetails(employee, false);
  };

  const confirmDeletePendingEmployee = (employee: Employee) => {
    const name =
      `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
      employee.email;
    showConfirmation(
      "Delete pending employee",
      `Are you sure you want to delete "${name}"? This will permanently remove their pending profile. This action cannot be undone.`,
      "accept" as ConfirmationType,
      async () => {
        await dispatch(deletePendingEmployee(employee.employeeID)).unwrap();
        setSelectedRows((current) =>
          current.filter((id) => id !== employee.employeeID)
        );
        refreshEmployees(employee.accessRole);
      },
      "Delete",
      "Cancel"
    );
  };

  const confirmTimesheetToggle = (employee: Employee) => {
    const name =
      `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
      employee.email;
    const currentlyDisabled = !!employee.timesheetSubmissionDisabled;
    const willDisable = !currentlyDisabled;

    showConfirmation(
      willDisable
        ? "Disable timesheet submissions"
        : "Enable timesheet submissions",
      willDisable
        ? `Warning: "${name}" will no longer be able to submit timesheets from the portal or mobile app until you enable this again. Are you sure you want to disable timesheet submissions for this caregiver?`
        : `You are about to enable timesheet submissions for "${name}". They will be able to submit timesheets again. Do you want to continue?`,
      "accept" as ConfirmationType,
      async () => {
        await dispatch(
          updateTimesheetSubmissionDisabled({
            employeeID: employee.employeeID,
            disabled: willDisable,
          })
        ).unwrap();
        refreshEmployees(employee.accessRole);
      },
      willDisable ? "Disable" : "Enable",
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

  const initialColumns: GridColDef[] = [
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
                }
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
      flex: 2,
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
      width: 250,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const status = params.value;
        let chipStyle = {};

        switch (status) {
          case "Activated":
            chipStyle = { backgroundColor: "#4caf50", color: "white" };
            break;
          case "Deactivated":
            chipStyle = { backgroundColor: "#f44336", color: "white" };
            break;
          case "Pending":
            chipStyle = { backgroundColor: "#ffc107", color: "black" };
            break;
          default:
            chipStyle = { backgroundColor: "#9e9e9e", color: "white" };
        }

        return (
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%" }}
          >
            <Chip size="small" label={status} style={chipStyle} variant="filled" />
            {params.row.accessRole === "CareGiver" &&
              params.row.timesheetSubmissionDisabled && (
                <Chip
                  size="small"
                  label="Timesheets disabled"
                  color="error"
                  variant="filled"
                  sx={{ fontWeight: 600 }}
                />
              )}
          </Stack>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 90,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const employee = params.row as Employee;
        const isCareGiver = employee.accessRole === "CareGiver";
        const isPending = employee.status === "Pending";

        if (!isCareGiver) {
          return (
            <Stack flexDirection="row" justifyContent="center">
              <IconButton
                aria-label="view"
                onClick={() => {
                  dispatch(fetchSingleEmployee(employee.employeeID));
                }}
              >
                <RemoveRedEyeOutlinedIcon />
              </IconButton>
              {isPending && (
                <IconButton
                  aria-label="delete pending employee"
                  color="error"
                  onClick={() => confirmDeletePendingEmployee(employee)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Stack>
          );
        }

        return (
          <Stack flexDirection="row" justifyContent="center">
            <IconButton
              aria-label="employee actions"
              onClick={(event) => openActionMenu(event, employee)}
            >
              <MoreVertIcon />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  const timesheetsDisabled = !!menuEmployee?.timesheetSubmissionDisabled;

  return (
    <Box sx={{ height: "100%", width: "100%", overflowY: "auto" }}>
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
        onRowClick={(params, event) =>
          handleRowClick(params.row as Employee, event as unknown as React.MouseEvent)
        }
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
          "& .MuiDataGrid-row": {
            cursor: "pointer",
          },
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

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor) && !!menuEmployee}
        onClose={closeActionMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            if (!menuEmployee) return;
            viewCareGiverDetails(menuEmployee, false);
            closeActionMenu();
          }}
        >
          <ListItemIcon>
            <RemoveRedEyeOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View details</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!menuEmployee) return;
            viewCareGiverDetails(menuEmployee, true);
            closeActionMenu();
          }}
        >
          <ListItemIcon>
            <OpenInNewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open in new tab</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!menuEmployee) return;
            const employee = menuEmployee;
            closeActionMenu();
            confirmTimesheetToggle(employee);
          }}
        >
          <ListItemIcon>
            {timesheetsDisabled ? (
              <CheckCircleOutlineIcon fontSize="small" color="success" />
            ) : (
              <BlockIcon fontSize="small" color="error" />
            )}
          </ListItemIcon>
          <ListItemText>
            {timesheetsDisabled
              ? "Enable timesheet submissions"
              : "Disable timesheet submissions"}
          </ListItemText>
        </MenuItem>
        {menuEmployee?.status === "Pending" && (
          <MenuItem
            onClick={() => {
              if (!menuEmployee) return;
              const employee = menuEmployee;
              closeActionMenu();
              confirmDeletePendingEmployee(employee);
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete pending employee</ListItemText>
          </MenuItem>
        )}
      </Menu>

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
