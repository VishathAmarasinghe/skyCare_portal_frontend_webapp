import { Box, Grid, Stack, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import HelloCard from "../../dashboard-view/Components/HelloCard";
import BroadcastAppointmentCard from "../components/BroadcastAppointmentCard";
import { useAppDispatch, useAppSelector } from "@slices/store";
import PendingCard from "../components/PendingCard";
import {
  AppointmentCareGiver,
  fetchAppointmentsByCareGiverAndStatus,
  fetchAppointmentTypes,
  fetchNextAppointmentbyCareGiver,
  fetchPendingAppointmentsWithUser,
  PendingAppointments,
  resetSelectedAppointment,
} from "@slices/AppointmentSlice/appointment";
import { selectUserInfo } from "@slices/authSlice/Auth";
import AppointmentDetailsModal from "../Modal/AppointmentDetailsModal";
import { State } from "../../../types/types";
import NextAppointmentCard from "../components/NextAppointmentCard";
import ShiftNoteModal from "../Modal/ShiftNoteModal";
import { fetchCareGiverDashboard } from "@slices/DashboardSlice/dashboard";
import AppointmentBarChart from "@view/dashboard-view/Components/AppointmentBarChart";
import RecurrentAppointmentDetailsModal from "../Modal/RecurrentAppointmentDetailsModal";

const CareGiverDashboard = () => {
  const dispatch = useAppDispatch();
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] =
    React.useState<boolean>(false);
  const currentUser = useAppSelector(selectUserInfo);
  const careGiverDashboard = useAppSelector((state) => state.dashboard);
  const [broadcastAppointments, setBroadcastAppointments] = React.useState<
    AppointmentCareGiver[]
  >([]);
  const [shiftModalOpen, setShiftModalOpen] = useState<boolean>(false);
  const [shiftIsEditMode, setShiftIsEditMode] = useState<boolean>(false);
  const appointmentSlice = useAppSelector((state) => state?.appointments);
  const shiftNoteState = useAppSelector((state) => state?.shiftNotes);
  const [selectedShiftNote, setSelectedShiftNote] = useState<{
    shiftNoteID: string | null;
  }>({ shiftNoteID: null });
  const [pendingAppointment, setPendingAppointments] = useState<
    PendingAppointments[] | null
  >(null);
  const [
    isRecurrentAppointmentModalVisible,
    setIsRecurrentAppointmentModalVisible,
  ] = useState<boolean>(false);

  useEffect(() => {
    setPendingAppointments(appointmentSlice?.pendingAppointments);
  }, [appointmentSlice?.pendingAppointments]);

  useEffect(() => {
    handleFetchingData();
  }, [currentUser?.userID, dispatch]);

  const handleFetchingData = () => {
    if (currentUser?.userID !== null) {
      dispatch(
        fetchAppointmentsByCareGiverAndStatus({
          employeeID: currentUser?.userID ?? "",
          status: "Allocated",
        })
      );
      dispatch(fetchCareGiverDashboard(currentUser?.userID ?? ""));
      dispatch(
        fetchPendingAppointmentsWithUser({
          employeeID: currentUser?.userID ?? "",
        })
      );
      dispatch(fetchAppointmentTypes());
      dispatch(
        fetchNextAppointmentbyCareGiver({
          employeeID: currentUser?.userID ?? "",
        })
      );
    }
  };

  useEffect(() => {
    handleFetchingData();

    // Set up the interval to call the function every 5 minutes (300000 ms)
    const interval = setInterval(() => {
      handleFetchingData();
    }, 300000);

    // Cleanup function to clear the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (shiftNoteState?.submitState === State.success) {
      setShiftModalOpen(false);
      setSelectedShiftNote({ shiftNoteID: null });
      setShiftIsEditMode(false);
      handleFetchingData();
    }
  }, [shiftNoteState?.submitState]);

  useEffect(() => {
    console.log("Appointment Slice", appointmentSlice.updateState);
    if (appointmentSlice?.updateState === State.success) {
      dispatch(
        fetchAppointmentsByCareGiverAndStatus({
          employeeID: currentUser?.userID ?? "",
          status: "Allocated",
        })
      );
      dispatch(fetchAppointmentTypes());
    }
  }, [appointmentSlice?.updateState, currentUser?.userID, dispatch]);

  useEffect(() => {
    setBroadcastAppointments(appointmentSlice?.careGvierAppointments);
  }, [appointmentSlice?.state, appointmentSlice?.careGvierAppointments]);

  useEffect(() => {
    if (!isAppointmentModalVisible) {
      dispatch(resetSelectedAppointment());
    }
  }, [isAppointmentModalVisible]);

  const handleModalClose = () => {
    setIsRecurrentAppointmentModalVisible(false);
  };

  return (
    <Stack
      width="100%"
      height="100%"
      data-aos="fade-right"
      data-aos-duration="200"
      // border="2px solid pink"
      flexDirection="column"
      alignItems="center"
    >
      <RecurrentAppointmentDetailsModal
        open={isRecurrentAppointmentModalVisible}
        onClose={handleModalClose}
      />
      <Stack width="100%" height="5%">
        <Typography variant="h5">Dashboard</Typography>
        <ShiftNoteModal
          pureNew={false}
          isEditMode={shiftIsEditMode}
          setIsEditMode={setShiftIsEditMode}
          isNoteModalVisible={shiftModalOpen}
          setIsNoteModalVisible={setShiftModalOpen}
          selectedShiftNote={selectedShiftNote}
          setSelectedShiftNote={setSelectedShiftNote}
        />
      </Stack>
      <HelloCard />
      <AppointmentDetailsModal
        open={isAppointmentModalVisible}
        onClose={() => setIsAppointmentModalVisible(false)}
      />
      <Stack
        width="100%"
        height={"90%"}
        my={2}
        flexDirection="column"
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack
          width="100%"
          sx={{
            flexDirection: {
              xs: "column-reverse",
              sm: "column-reverse",
              md: "column",
              lg: "column-reverse",
              xl: "column",
            },
          }}
        >
          <Box width="100%" p={2}>
            <Grid
              container
              spacing={2}
              sx={{
                flexDirection: { xs: "column-reverse", sm: "row" }, // On mobile, last item comes first
              }}
            >
              <Grid item xs={12} sm={8}>
                <Box
                  sx={{
                    width: "100%",
                    padding: 2,
                    borderRadius: 2,
                    elevation: 2,
                    textAlign: "center",
                    backgroundColor: "white",
                  }}
                >
                  <AppointmentBarChart
                    twoWeekAppointmentCount={
                      careGiverDashboard?.careGiverDashboard
                        ?.twoWeekAppointmentCount || {}
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <NextAppointmentCard
                  isRecurrentModalVisible={isRecurrentAppointmentModalVisible}
                  setIsRecurrentModalVisible={
                    setIsRecurrentAppointmentModalVisible
                  }
                  selectedShiftNote={selectedShiftNote}
                  setSelectedShiftNote={setSelectedShiftNote}
                  setIsEditMode={setShiftIsEditMode}
                  setIsModalVisible={setShiftModalOpen}
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
        <Grid
          container
          spacing={2} // Add spacing between grid items
          sx={{ height: "80%", width: "100%" }}
        >
          {/* Broadcast Appointments */}
          <Grid item xs={12} md={8}>
            {" "}
            {/* Occupies full width on small screens and 8/12 on medium+ screens */}
            <Stack
              bgcolor="white"
              justifyContent="flex-start"
              flexDirection="column"
              borderRadius={2}
              boxShadow={2}
              sx={{
                height: { xs: "auto", md: "100%" },
                minHeight: "150px",
              }}
            >
              {/* Title */}
              <Stack width={"100%"} sx={{ p: 1 }} height={"10%"}>
                <Typography variant="h6" fontWeight="bold" fontSize={"12px"}>
                  Broadcast Appointments
                </Typography>
              </Stack>

              {/* Scrollable Stack for the Cards */}
              <Stack
                width={"100%"}
                flexDirection="column"
                mt={1}
                sx={{
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  overflowY: "auto",
                }}
              >
                {broadcastAppointments.map((appointment) => (
                  <BroadcastAppointmentCard
                    setIsAppointmentAddModalVisible={
                      setIsAppointmentModalVisible
                    }
                    jobDetails={appointment}
                    key={appointment.appointmentData?.appointmentID}
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Pending Appointments */}
          <Grid item xs={12} md={4}>
            {" "}
            {/* Occupies full width on small screens and 4/12 on medium+ screens */}
            <Stack
              sx={{
                backgroundColor: "white",
                padding: 2,
                borderRadius: 2,
                boxShadow: 2,
                height: "100%",
                minHeight: "150px", // Ensure a minimum height
                maxHeight: "250px", // Maximum height for the stack
              }}
            >
              {/* Fixed title */}
              <Typography variant="h6" fontWeight="bold" fontSize={"12px"}>
                Pending Appointments
              </Typography>

              {/* Scrollable area */}
              <Box
                sx={{
                  overflowY: "auto", // Enable scrolling
                  maxHeight: "150px", // Adjust based on remaining height
                  mt: 2, // Add some spacing between the title and the list
                }}
              >
                {pendingAppointment?.length ?? 0 > 0 ? (
                  pendingAppointment?.map((appointment, index) => (
                    <PendingCard
                      key={index}
                      jobDetails={appointment}
                      isModalVisible={isRecurrentAppointmentModalVisible}
                      setIsModalVisible={setIsRecurrentAppointmentModalVisible}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No pending appointments.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
};

export default CareGiverDashboard;
