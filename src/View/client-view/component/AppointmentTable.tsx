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
import { State } from "../../../types/types";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  Appointment,
  fetchAppointmentTypes,
  fetchSingleAppointment,
} from "../../../slices/appointmentSlice/appointment";
import { EmployeeMapping } from "@slices/employeeSlice/employee";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter placeholder="Search" />
    </GridToolbarContainer>
  );
}

interface ClientTableProps {
  isCarePlanModalVisible: boolean;
  setIsCarePlanModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppointmentTable = ({
  isCarePlanModalVisible,
  setIsCarePlanModalVisible,
}: ClientTableProps) => {
  const appointmentSlice = useAppSelector((state) => state.appointments);
  const employeeSlice = useAppSelector((state)=>state?.employees);
  const [Appointments, setAppointments] = useState<Appointment[]>([]);

  const theme = useTheme();
  const dispatch = useAppDispatch();

  const getEmployeeIDByCareGiverID = (name: string, mapping: EmployeeMapping) => {
    return Object.keys(mapping).find((key) => mapping[key] === name) || null;
  };

  useEffect(() => {
    setAppointments(appointmentSlice.appointments);
  }, [appointmentSlice.state, appointmentSlice?.appointments]);

  const initialColumns: GridColDef[] = [
    {
      field: "appointmentID",
      headerName: "Appointment ID",
      width: 100,
      align: "left",
    },
    { field: "title", headerName: "Title", flex: 1 },
    {
      field: "appointmentTypeID",
      headerName: "Appointment Type",
      flex:1,
      renderCell: (params) => {
        const appointmentType = appointmentSlice.appointmentTypes.find(
          (type) => type.appointmentTypeID === params.value
        );

        return (
          <Chip
            size="small"
            label={appointmentType?.name || "Unknown"}
            style={{
              backgroundColor: appointmentType?.color || "#ccc", // Set chip color from the type
              color: "#fff", // Ensure text is visible on colored backgrounds
            }}
          />
        );
      },
    },
    {
      field: "Allocator",
      headerName: "Allocated Caregiver",
      headerAlign: "left",
      flex:1,
      align: "left",
      renderCell:(params)=>{
        if (params?.row?.jobAssigns?.careGiverIDs?.length>1) {
          return (
            <Stack width="100%" height="100%" justifyContent="center">
              <Typography>
                Multiple Caregivers
              </Typography>
            </Stack>
          )
        }else{
          const employeeID = getEmployeeIDByCareGiverID(params?.row?.jobAssigns?.careGiverIDs[0],employeeSlice?.metaAllEmployeeMapping);
          if (employeeID) {
            const employee = employeeSlice?.metaAllEmployees?.find((employee)=>employee.employeeID===employeeID);
            return (
              <Stack width="100%" height="100%" justifyContent="center">
                <Typography>
                  {employee?.firstName} {employee?.lastName}
                </Typography>
              </Stack>
            )
          }
        }
      }
    },
    {
      field: "startDate",
      headerName: "Start Date",
      headerAlign: "left",
      flex:1,
      align: "left",
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex:1,
      headerAlign: "left",
      align: "left",
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
            <IconButton
              aria-label="view"
              onClick={() => {
                dispatch(fetchSingleAppointment(params?.row?.appointmentID));
              }}
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
        rows={Appointments}
        columns={initialColumns}
        getRowId={(row) => row.appointmentID}
        density="compact"
        loading={appointmentSlice.state === State.loading}
        pagination
        paginationMode="client"
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5 },
          },
        }}
        slots={{
          toolbar: CustomToolbar,
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
    </Box>
  );
};

export default AppointmentTable;
