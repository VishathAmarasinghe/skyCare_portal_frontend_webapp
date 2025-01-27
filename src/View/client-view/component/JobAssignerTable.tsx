import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  Button,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import { Modal } from "antd";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {
  cancelAppointment,
  CareGiverAssignedDTO,
  fetchJobAssignmentTable,
  JobAssignShowerDTO,
  RecurrentAppointmentValues,
  updateNewAllocations,
} from "../../../slices/appointmentSlice/appointment";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { ConfirmationType, State } from "../../../types/types";
import { CareGiver } from "../../../slices/careGiverSlice/careGiver";
import { FILE_DOWNLOAD_BASE_URL } from "../../../config/config";
import { useConfirmationModalContext } from "../../../context/DialogContext";

interface JobAssignerTableProps {
  setSelectedRecurrentAppointment: React.Dispatch<
    React.SetStateAction<RecurrentAppointmentValues | null>
  >;
}

const JobAssignerTable = ({
  setSelectedRecurrentAppointment,
}: JobAssignerTableProps) => {
  const [data, setData] = useState<JobAssignShowerDTO[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentRow, setCurrentRow] = useState<JobAssignShowerDTO | null>(null);
  const appointmentSlice = useAppSelector((state) => state?.appointments);
  const [careGivers, setCareGivers] = useState<CareGiver[]>([]);
  const authInfo = useAppSelector((state) => state.auth.userInfo);
  const dispatch = useAppDispatch();
  const careGiverSlice = useAppSelector((state) => state.careGivers);
  const [selectedCareGiverID, setSelectedCareGiverID] = useState<string>("");
  const { showConfirmation } = useConfirmationModalContext();
  const [assignerChanges, setAssignerChanges] = useState<{
    added: string[];
    deleted: string[];
    recurrentAppointmentID: string;
    assignerID: string;
  }>({
    added: [],
    deleted: [],
    recurrentAppointmentID: "",
    assignerID: authInfo?.userID || "",
  });

  useEffect(() => {
    if (openModal && appointmentSlice.selectedAppointment) {
      setSelectedCareGiverID("");
      dispatch(
        fetchJobAssignmentTable({
          appointmentID: appointmentSlice.selectedAppointment.appointmentID,
        })
      );
      setAssignerChanges({
        added: [],
        deleted: [],
        recurrentAppointmentID: "",
        assignerID: authInfo?.userID || "",
      });
      
    }
  }, [openModal]);

  useEffect(() => {
    setCareGivers(careGiverSlice?.careGivers);
  }, [careGiverSlice?.careGivers]);

  useEffect(() => {
    console.log(assignerChanges);
  }, [assignerChanges]);

  useEffect(() => {
    if (currentRow) {
      const updatedRow = data.find(
        (item) =>
          item.recurrentAppointmentID === currentRow.recurrentAppointmentID
      );
      setCurrentRow(updatedRow || null);
    }
  }, [data]);

  useEffect(() => {
    setData(appointmentSlice?.jobAssignerTable);
  }, [appointmentSlice.jobAssignerState]);

  const handleRemoveCaregiver = (rowId: string, caregiverId: string) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.recurrentAppointmentID === rowId
          ? {
              ...item,
              assigners: item.assigners.filter(
                (assigner) => assigner.careGiverID !== caregiverId
              ),
            }
          : item
      )
    );

    setAssignerChanges((prevState) => ({
      ...prevState,
      deleted: [...prevState.deleted, caregiverId],
      recurrentAppointmentID: rowId,
      assignerID: authInfo?.userID || "",
    }));
  };

  const handleAddCaregiver = (caregiver: CareGiverAssignedDTO) => {
    if (currentRow) {
      setData((prevData) =>
        prevData.map((item) =>
          item.recurrentAppointmentID === currentRow.recurrentAppointmentID
            ? {
                ...item,
                assigners: [...item.assigners, caregiver],
              }
            : item
        )
      );

      setAssignerChanges((prevState) => ({
        ...prevState,
        added: [...prevState.added, caregiver.careGiverID],
        recurrentAppointmentID: currentRow.recurrentAppointmentID,
        assignerID: authInfo?.userID || "",
      }));
    }
  };

  const handleSave = () => {
    console.log("Save changes:", assignerChanges);
    if (
      assignerChanges.added.length > 0 ||
      assignerChanges.deleted.length > 0
    ) {
      dispatch(updateNewAllocations(assignerChanges));
    }
    setOpenModal(false);
  };

  const handleRowSelection = (selection: GridRowSelectionModel) => {
    setSelectedRecurrentAppointment(null);
    const selectedRow = data.find(
      (row) => row.recurrentAppointmentID === selection[0]
    );
    if (selectedRow) {
      setCurrentRow(selectedRow);
      console.log("Selected Row:", selectedRow);
      setSelectedRecurrentAppointment({
        recurrentAppointmentID: selectedRow.recurrentAppointmentID,
        startDate: selectedRow.startDate,
        startTime: selectedRow.startTime,
        endDate: selectedRow.endDate,
        endTime: selectedRow.endTime,
        comment: selectedRow.comment,
      });
      // Perform any additional logic with the selected row
    }
  };

  const handleCancel = () => {
    setOpenModal(false);
  };

  const handleCancelAppointment = (recurrentAppointmentID: string) => {
    if (recurrentAppointmentID) {
      dispatch(
        cancelAppointment({ recurrentAppointmentID: recurrentAppointmentID })
      );
    }
  };

  const columns: GridColDef[] = [
    { field: "recurrentAppointmentID", headerName: "ID", flex:1 },
    { field: "jobState", headerName: "Job State", width: 80 },
    { field: "startDate", headerName: "Start Date", width: 120 },
    { field: "startTime", headerName: "Start Time", width: 80 },
    { field: "endDate", headerName: "End Date", width: 120 },
    { field: "endTime", headerName: "End Time", width: 80 },
    {
      field: "assigners",
      headerName: "Assigners",
      width:120,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          disabled={params.row.jobState === "cancelled"}
          onClick={() => {
            setCurrentRow(params.row);
            setOpenModal(true);
          }}
        >
          Manage
        </Button>
      )
    },
    // {
    //   field: "headcountSatisfied",
    //   headerName: "Headcount",
    //   width: 150,
    //   renderCell: (params) => (
    //     <Stack height={"100%"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"} alignContent={"center"}>
    //     <Typography
    //       color={
    //         params.row.assigners.length >= params.row.requiredHeadcount
    //           ? "green"
    //           : "red"
    //       }
    //     >
    //       {params.row.assigners.length >= params.row.requiredHeadcount
    //         ? "Satisfied"
    //         : "Not Satisfied"}
    //     </Typography>
    //     </Stack>
    //   ),
    // },
    {
      field: "Action",
      headerName: "Action",
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          disabled={params.row.jobState === "cancelled"}
          onClick={() => {
            showConfirmation(
              "Cancel Appointment",
              `Are you sure you want to Cancel Appointment "${params.row.recurrentAppointmentID}"?`,
              ConfirmationType.update,
              () => handleCancelAppointment(params.row.recurrentAppointmentID),
              "Cancel Appointment",
              "Cancel"
            );
          }}
        >
          Cancel
        </Button>
      ),
    },
  ];

  const modalColumns: GridColDef[] = [
    { field: "employeeID", headerName: "Employee ID", width: 100 },
    { field: "careGiverID", headerName: "Caregiver ID", width: 100 },
    {
      field: "firstName",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={`${params?.row?.firstName} ${params?.row?.lastName}`}
          avatar={
            <Avatar
              src={
                params?.row?.userProfilePhoto
                  ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                      params?.row?.userProfilePhoto
                    )}`
                  : ""
              }
              alt={`${params?.row?.firstName} ${params?.row?.lastName}`}
            />
          }
        />
      ),
    },
    {
      field: "acceptanceState",
      headerName: "Acceptance State",
      width: 150,
      renderCell: (params) => {
        let color: "default" | "success" | "error" | "warning" = "default";
        if (params.value === "Allocated") color = "warning";
        else if (params.value === "Accepted") color = "success";
        else if (params.value === "Rejected") color = "error";

        return <Chip label={params.value} color={color} variant="outlined" />;
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <IconButton
          onClick={() =>
            handleRemoveCaregiver(
              currentRow!.recurrentAppointmentID,
              params.row.careGiverID
            )
          }
        >
          <RemoveCircleIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={data}
        columns={columns}
        checkboxSelection
        disableMultipleRowSelection
        onRowSelectionModelChange={(selection) => handleRowSelection(selection)}
        loading={appointmentSlice.jobAssignerState === State.loading}
        isRowSelectable={(params) =>
          params.row.jobState !== "cancelled" &&
          params.row.jobState !== "completed"
        }
        getRowId={(row) => row.recurrentAppointmentID}
        slots={{
          toolbar: () => (
            <GridToolbarContainer>
              <GridToolbarColumnsButton />
              <GridToolbarFilterButton />
              <GridToolbarQuickFilter placeholder="Search" />
            </GridToolbarContainer>
          ),
        }}
      />

      <Modal
        title="Manage Assigners"
        open={openModal}
        onCancel={handleCancel}
        footer={
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Box>
        }
        centered
        width={700}
      >
        <Select
          fullWidth
          displayEmpty
          value={selectedCareGiverID}
          onChange={(e) => {
            const selectedCareGiver = careGivers.find(
              (option) => option.careGiverID === e.target.value
            );
            if (selectedCareGiver) {
              const careGiverDTO: CareGiverAssignedDTO = {
                careGiverID: selectedCareGiver.careGiverID,
                employeeID: selectedCareGiver.employee?.employeeID,
                firstName: selectedCareGiver.employee?.firstName || "",
                lastName: selectedCareGiver.employee?.lastName || "",
                acceptanceState: "Allocated",
                userProfilePhoto:
                  selectedCareGiver.employee?.profile_photo || "",
              };
              handleAddCaregiver(careGiverDTO);
            }
          }}
        >
          <MenuItem value="" disabled>
            Select Caregiver
          </MenuItem>
          {careGivers
            .filter(
              (caregiver) =>
                !currentRow?.assigners.some(
                  (assigner) => assigner.careGiverID === caregiver.careGiverID
                )
            )
            .map((caregiver) => (
              <MenuItem
                key={caregiver.careGiverID}
                value={caregiver.careGiverID}
              >
                <Chip
                  label={`${caregiver.employee?.firstName} ${caregiver.employee?.lastName}`}
                  avatar={
                    <Avatar
                      src={
                        caregiver.employee?.profile_photo
                          ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                              caregiver.employee?.profile_photo
                            )}`
                          : ""
                      }
                      alt={`${caregiver.employee?.firstName} ${caregiver.employee?.lastName}`}
                    />
                  }
                />
              </MenuItem>
            ))}
        </Select>
        <Box sx={{ height: 400, mt: 2 }}>
          <DataGrid
            rows={currentRow?.assigners || []}
            columns={modalColumns}
            getRowId={(row) => row.careGiverID}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default JobAssignerTable;
