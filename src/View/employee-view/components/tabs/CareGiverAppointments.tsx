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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { fetchCareGiverAllJobAssignViews, fetchSingleAppointment, resetSelectedAppointment } from "@slices/appointmentSlice/appointment";
import { JobAssignCareGiverView } from "@slices/appointmentSlice/appointment";
import { State } from "../../../../types/types";
import AddNewAppointmentModal from "../../../client-view/modal/AddNewAppointmentModal";

const CareGiverAppointments = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] =
    useState<boolean>(false);
  const employeeID = searchParams.get("employeeID");
  const appointmentSlice = useAppSelector((state) => state?.appointments);
  const [jobAssigns, setJobAssigns] = useState<JobAssignCareGiverView[]>([]);
  const theme = useTheme();
  const [rows, setRows] = useState<any[]>([]);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    fetchCareGiverAllJobDetails();
  }, [employeeID]);

  useEffect(() => {
    if (
      appointmentSlice?.submitState === State.success ||
      appointmentSlice?.updateState === State.success
    ) {
      setIsAppointmentModalVisible(false);
      dispatch(resetSelectedAppointment());
      setIsEditMode(false);
      fetchCareGiverAllJobDetails();
    }
  }, [appointmentSlice.submitState, appointmentSlice.updateState]);

  useEffect(() => {
    if (appointmentSlice?.selectedAppointment !== null) {
      setIsAppointmentModalVisible(true);
    }
  }, [appointmentSlice?.selectedAppointment]);

  const handleTransformData = (data: JobAssignCareGiverView[]) => {
    return data.map((item) => ({
      id: item.assignJob.assignID,
      recurrentAppointmentID: item?.recurrentAppointment?.recurrentAppointmentID,
      startDate: item?.recurrentAppointment?.startDate,
      startTime: item?.recurrentAppointment?.startTime,
      status: item?.recurrentAppointment?.status,
      isCancelled: item?.recurrentAppointment?.isCancelled,
      title: item?.appointment?.title,
      acceptanceType: item?.assignJob?.acceptanceType,
      appointmentID:item?.appointment?.appointmentID
    }));
  };

  useEffect(() => {
    if (appointmentSlice?.JobAssignToCareGiverViewList) {
      const transformedData = handleTransformData(
        appointmentSlice.JobAssignToCareGiverViewList
      );
      setRows(transformedData);
    }
  }, [appointmentSlice?.JobAssignToCareGiverViewList]);

  const fetchCareGiverAllJobDetails = async () => {
    if (employeeID && employeeID !== "") {
      dispatch(fetchCareGiverAllJobAssignViews({ employeeID }));
    }
  };


  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarQuickFilter placeholder="Search" />
      </GridToolbarContainer>
    );
  }

  const columns: GridColDef[] = [
    { field: "recurrentAppointmentID", headerName: "Recurrent ID", width: 100 },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "startDate", headerName: "Start Date", width: 150 },
    { field: "startTime", headerName: "Start Time", width: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Chip
        size="small"
          label={params.row.status}
          color={params.row.status === "Active" ? "success" : "warning"}
          variant="outlined"
        />
      ),
    },
    {
      field: "isCancelled",
      headerName: "Is Cancelled",
      width: 150,
      renderCell: (params) => (
        <Chip
        size="small"
          label={params.row.isCancelled ? "Cancelled" : "Active"}
          color={params.row.isCancelled ? "error" : "success"}
          variant="outlined"
        />
      ),
    },
    { field: "acceptanceType", headerName: "Acceptance Type", width: 150 },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <IconButton
          aria-label="view"
          onClick={() => dispatch(fetchSingleAppointment(params?.row?.appointmentID))}
        >
          <RemoveRedEyeOutlinedIcon />
        </IconButton>
      ),
    },
  ];


  return (
    <Box sx={{ height: "100%", width: "100%" }}>
        <AddNewAppointmentModal
        isEditMode={isEditMode}
        selectedTimeFram={{
          startDate: "",
          endDate: "",
          endTime: "",
          startTime: "",
        }}
        setSelectedTimeFrame={() => {}}
        setIsEditMode={setIsEditMode}
        isAppointmentAddModalVisible={isAppointmentModalVisible}
        setIsAppointmentAddModalVisible={setIsAppointmentModalVisible}
      />
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        density="compact"
        loading={appointmentSlice?.state === State?.loading}
        pagination
        pageSizeOptions={[5, 10, 15]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5 },
          },
        }}
        slots={{
          toolbar: CustomToolbar,
        }}
        sx={{
            height:"100%",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.paper,
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: theme.palette.background.paper,
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
        }}
      />
    </Box>
  );
};

export default CareGiverAppointments;
