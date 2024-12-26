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
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  Employee,
  fetchSingleEmployee,
} from "../../../slices/employeeSliceName/employee";
import { FILE_DOWNLOAD_BASE_URL } from "../../../configName/config";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter placeholder="Search" />
    </GridToolbarContainer>
  );
}

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

interface ClientTableProps {}

const EmployeeTable = ({}: ClientTableProps) => {
  const theme = useTheme();
  const employeeSlice = useAppSelector((state) => state.employees);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setEmployees(employeeSlice.employees);
  }, [employeeSlice.state]);

  const handlePageChange = (newPage: number) => {};

  const initialColumns: GridColDef[] = [
    {
      field: "employeeID",
      headerName: "Employee ID",
      width: 100,
      align: "center",
    },
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
      field: "accessRole",
      headerName: "Occupation",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const role = params.value; // Role value (e.g., "Admin" or "CareGiver")
        let color: "default" | "success" | "primary" = "default";

        // Assign colors based on the role
        switch (role) {
          case "Admin":
            color = "success"; // Green color
            break;
          case "CareGiver":
            color = "primary"; // Blue color
            break;
          default:
            color = "default"; // Default grey
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
      width: 110,
      renderCell: (params) => {
        const navigate = useNavigate();
        return (
          <Stack flexDirection="row">
            <IconButton
              aria-label="view"
              onClick={() =>
                dispatch(fetchSingleEmployee(params.row.employeeID))
              }
            >
              <RemoveRedEyeOutlinedIcon />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={employees}
        columns={initialColumns}
        getRowId={(row) => row.employeeID}
        density="compact"
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

export default EmployeeTable;
