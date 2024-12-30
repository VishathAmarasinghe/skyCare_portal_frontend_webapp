import { Stack, Typography, useTheme } from "@mui/material";
import {
  fetchCareGiverJobAssignViews,
  JobAssignCareGiverView,
} from "../../slices/appointmentSlice/appointment";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import React, { useEffect, useState } from "react";
import AllocationCard from "./components/AllocationCard";
import RecurrentAppointmentDetailsModal from "../careGiver-dashboard-view/modal/RecurrentAppointmentDetailsModal";
import ShiftNoteModal from "../careGiver-dashboard-view/modal/ShiftNoteModal";
import { State } from "../../types/types";

const CareGiverAllocationsView = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const authSlice = useAppSelector((slice) => slice?.auth);

  const [shiftModalOpen, setShiftModalOpen] = useState<boolean>(false);
  const [shiftIsEditMode, setShiftIsEditMode] = useState<boolean>(false);
  const [
    selectedRecurrentShiftModalForignValues,
    setSelectedRecurrentShiftModalForignValues,
  ] = useState<{ recurrentID: string | null; careGiverID: string | null }>({
    recurrentID: null,
    careGiverID: null,
  });
  const appointmentSlice = useAppSelector((slice) => slice?.appointments);
  const [selectedShiftNote, setSelectedShiftNote] = useState<{
    shiftNoteID: string | null;
  }>({ shiftNoteID: null });
  const [jobAssigns, setJobAssigns] = useState<JobAssignCareGiverView[]>([]);
  const shiftSlice = useAppSelector((state) => state?.shiftNotes);
  const [
    isRecurrentAppointmentModalVisible,
    setIsRecurrentAppointmentModalVisible,
  ] = useState<boolean>(false);

  useEffect(() => {
    if (appointmentSlice?.JobAssignToCareGiverViewList.length > 0) {
      console.log(
        "job asings ",
        appointmentSlice?.JobAssignToCareGiverViewList
      );

      setJobAssigns(appointmentSlice?.JobAssignToCareGiverViewList);
    }
  }, [appointmentSlice?.state]);

  useEffect(() => {
    if (
      shiftSlice?.submitState === State?.success ||
      shiftSlice?.updateState === State?.success
    ) {
      setShiftModalOpen(false);
      setSelectedShiftNote({ shiftNoteID: null });
      setSelectedRecurrentShiftModalForignValues({
        careGiverID: null,
        recurrentID: null,
      });
      setShiftIsEditMode(false);
    }
    if (authSlice?.userInfo?.userID) {
      dispatch(
        fetchCareGiverJobAssignViews({
          employeeID: authSlice.userInfo.userID,
        })
      );
    }
  }, [
    shiftSlice?.submitState,
    shiftSlice?.updateState,
    appointmentSlice?.updateState,
  ]);

  useEffect(() => {
    if (authSlice?.userInfo?.userID) {
      dispatch(
        fetchCareGiverJobAssignViews({ employeeID: authSlice.userInfo.userID })
      );
    }
  }, [shiftSlice]);

  const handleModalClose = () => {
    setIsRecurrentAppointmentModalVisible(false);
  };

  return (
    <Stack
      width="100%"
      data-aos="fade-right"
      data-aos-duration="200"
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: 1,
        borderRadius: 2,
        padding: 2,
      }}
      height="100%"
    >
      <RecurrentAppointmentDetailsModal
        open={isRecurrentAppointmentModalVisible}
        onClose={handleModalClose}
      />
      <ShiftNoteModal
        pureNew={true}
        foreignDetails={selectedRecurrentShiftModalForignValues}
        isEditMode={shiftIsEditMode}
        setIsEditMode={setShiftIsEditMode}
        isNoteModalVisible={shiftModalOpen}
        setIsNoteModalVisible={setShiftModalOpen}
        selectedShiftNote={selectedShiftNote}
        setSelectedShiftNote={setSelectedShiftNote}
      />
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h6"
        >
          Appointment Allocation
        </Typography>
      </Stack>
      <Stack
        width="100%"
        height="480px"
        sx={{ overflowY: "auto", padding: 1 }}
        spacing={2}
      >
        {jobAssigns.map((data, index) => (
          <Stack key={index} width={"100%"}>
            <AllocationCard
              isRecurrentModalVisible={isRecurrentAppointmentModalVisible}
              setIsRecurrentModalVisible={setIsRecurrentAppointmentModalVisible}
              isShiftNoteModalVisible={shiftModalOpen}
              setShiftNoteModalVisible={setShiftModalOpen}
              isEditMode={shiftIsEditMode}
              setIsEditMode={setShiftIsEditMode}
              setSelectedRecurrentShiftModalForignValues={
                setSelectedRecurrentShiftModalForignValues
              }
              jobAssignData={data}
            />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default CareGiverAllocationsView;
