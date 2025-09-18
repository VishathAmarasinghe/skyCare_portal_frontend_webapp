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
  Chip,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { Employee } from "../../../slices/employeeSlice/employee";
import { APPLICATION_ADMIN, FILE_DOWNLOAD_BASE_URL } from "../../../config/config";
import {
  fetchSingleIncident,
  Incidents,
} from "../../../slices/incidentSlice/incident";
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

interface ClientTableProps {
  setIsIncidentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onViewReport: (incident: Incidents) => void;
}

const IncidentTable = ({
  setIsIncidentModalOpen,
  onViewReport,
}: ClientTableProps) => {
  const theme = useTheme();
  const incidentSlice = useAppSelector((state) => state?.incident);
  const employeeSlice = useAppSelector((state) => state?.employees);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const authSlice = useAppSelector((state)=>state?.auth);
  const [incidents, setIncidents] = useState<Incidents[]>([]);
  const dispatch = useAppDispatch();

  const findEmployee = (employeeID: string): Employee | null => {
    const employee = employeeSlice.metaAllEmployees.find(
      (employee) => employee.employeeID === employeeID
    );
    return employee ? employee : null;
  };

  const findIncidentType = (incidentTypeID: string): string => {
    const incidentType = incidentSlice.incidentsTypes.find(
      (incidentType) => incidentType.incidentTypeID === incidentTypeID
    );
    return incidentType?.title || "";
  };

  const findIncidentState = (incidentStateID: string): string => {
    const incidentState = incidentSlice.incidentStatus.find(
      (incidentState) => incidentState.incidentStatusID === incidentStateID
    );
    return incidentState?.activeStatus || "";
  };

  useEffect(() => {
    setIncidents(incidentSlice.incidents);
  }, [incidentSlice.incidents]);


  const initialColumns: GridColDef[] = [
    // {
    //   field: "incidentID",
    //   headerName: "Incident ID",
    //   width: 50,
    //   align: "center",
      
    // },
    // { field: "title", headerName: "title", flex: 1 },
    {
      field: "incidentTypeID",
      headerName: "Incident type",
      width: 130,
      renderCell: (params) => {
        return (
          <Chip
            size="small"
            label={
              findIncidentType(params.row.incidentTypeID) ||
              params.row.incidentTypeID
            }
            variant="outlined"
          />
        );
      },
    },
    {
      field: "incidentStatusID",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        return (
          <Chip
            size="small"
            label={
              findIncidentState(params.row.incidentStatusID) ||
              params.row.incidentStatusID
            }
            variant="outlined"
          />
        );
      },
    },
    {
      field: "employeeID",
      headerName: "Creator",
      flex: 1,
      renderCell: (params) => {
        const employee = findEmployee(params?.row?.employeeID);
        return (
          <Chip
            avatar={
              <Avatar
                src={
                  employee?.profile_photo
                    ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                        employee?.profile_photo || ""
                      )}`
                    : ""
                } // Replace with your avatar URL logic
                alt={
                  employee?.firstName?.charAt(0).toString() ||
                  params.row?.employeeID ||
                  ""
                }
              >
                {params?.row?.employeeID}
              </Avatar>
            }
            label={employee?.firstName + " " + employee?.lastName}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "incidentDate",
      headerName: "Incident Date",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "reportDate",
      headerName: "Reporting Date",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <Stack flexDirection="row">
            <Tooltip title="View Incident">
              <IconButton
                aria-label="view"
                onClick={() => {
                  dispatch(fetchSingleIncident(params.row?.incidentID));
                  setIsIncidentModalOpen(true);
                }}
              >
                <RemoveRedEyeOutlinedIcon />
              </IconButton>
            </Tooltip>
            {
              authSlice?.roles?.includes(APPLICATION_ADMIN)?
        <Tooltip title="View Report">
              <IconButton
                aria-label="report"
                onClick={() => {
                  onViewReport(params.row);
                }}
              >
                <AssessmentIcon />
              </IconButton>
            </Tooltip>:<></>
            }
          </Stack>
        );
      },
    },
  ];

  const initialColumnsMobile: GridColDef[] = [
    { field: "title", headerName: "title", flex: 1 },
    {
      field: "incidentDate",
      headerName: "Incident Date",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <Stack flexDirection="row">
            <Tooltip title="View Incident">
              <IconButton
                aria-label="view"
                onClick={() => {
                  dispatch(fetchSingleIncident(params.row?.incidentID));
                  setIsIncidentModalOpen(true);
                }}
              >
                <RemoveRedEyeOutlinedIcon />
              </IconButton>
            </Tooltip>
            {
              authSlice?.roles?.includes(APPLICATION_ADMIN) && 
              <Tooltip title="View Report">
                <IconButton
                  aria-label="report"
                  onClick={() => {
                  onViewReport(params.row);
                }}
                >
                <AssessmentIcon />
              </IconButton>
            </Tooltip>
            }
          </Stack>
        );
      },
    },
  ];

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={incidents as Incidents[]}
        columns={isMobile? initialColumnsMobile:initialColumns}
        getRowId={(row) => row.incidentID}
        density="compact"
        loading={incidentSlice.state === State?.loading}
        pagination
        paginationMode="client"
        pageSizeOptions={[10,15,20]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
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

export default IncidentTable;
