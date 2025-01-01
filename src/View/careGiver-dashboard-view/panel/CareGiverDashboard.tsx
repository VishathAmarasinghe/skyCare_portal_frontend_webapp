import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import HelloCard from "../../dashboard-view/Components/HelloCard";
import BroadcastAppointmentCard from "../components/BroadcastAppointmentCard";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import PendingCard from "../components/PendingCard";
import {
  AppointmentCareGiver,
  fetchAppointmentsByCareGiverAndStatus,
  fetchAppointmentTypes,
  fetchNextAppointmentbyCareGiver,
  fetchPendingAppointmentsWithUser,
  PendingAppointments,
  resetSelectedAppointment,
} from "@slices/appointmentSlice/appointment";
import { selectUserInfo } from "../../../slices/authSlice/auth";
import AppointmentDetailsModal from "../modal/AppointmentDetailsModal";
import { State } from "../../../types/types";
import NextAppointmentCard from "../components/NextAppointmentCard";
import ShiftNoteModal from "../modal/ShiftNoteModal";
import { fetchCareGiverDashboard } from "../../../slices/dashboardSlice/dashboard";
import AppointmentBarChart from "../../dashboard-view/Components/AppointmentBarChart";
import RecurrentAppointmentDetailsModal from "../modal/RecurrentAppointmentDetailsModal";

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

  const Item = ({ children }: { children: React.ReactNode }) => (
    <Paper
      sx={{
        p: 2,
        width: "100%",
        height: "100%",
        // textAlign: "center",
        color: "text.secondary",
        backgroundColor: "white",
        boxShadow: 1,
        borderRadius: 2,
      }}
    >
      <Typography>{children}</Typography>
    </Paper>
  );

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
        <Typography variant="h6">Dashboard</Typography>
        <ShiftNoteModal
          pureNew={false}
          foreignDetails={{ careGiverID: null, recurrentID: null }}
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
        sx={{
          // border: "2px solid red",
          width: "100%",
          height: "90%",
          mt: 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            // border: "2px solid red",
            height: "100%",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)", // 1 column for mobile
              sm: "repeat(1, 1fr)", // 1 column for small screens
              md: "repeat(12, 1fr)", // 12-column grid for medium+ screens
            },
            gap: 2,
          }}
        >
          {/* Left Top Item */}
          <Box
            sx={{
              gridColumn: { md: "span 8", xs: "span 12" },
              height: "100%",
              // border: "2px solid blue",
            }}
          >
            <Item>
              <AppointmentBarChart
                twoWeekAppointmentCount={
                  careGiverDashboard?.careGiverDashboard
                    ?.twoWeekAppointmentCount || {}
                }
              />
            </Item>
          </Box>

          {/* Right Item */}
          <Box
            sx={{
              gridColumn: { md: "span 4", xs: "span 12" },
              gridRow: { md: "span 2" },
              height: "100%",
              // border: "2px solid yellow",
            }}
          >
            <Item>
              <Stack
                sx={{
                  width: "100%",
                  height: "100%",
                  minHeight: "100%", // Ensure a minimum height
                  maxHeight: "250px", // Maximum height for the stack
                }}
              >
                {/* Fixed title */}
                <Typography variant="h6" fontWeight="bold">
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
                        setIsModalVisible={
                          setIsRecurrentAppointmentModalVisible
                        }
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No pending appointments.
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Item>
          </Box>

          {/* Left Bottom Item */}
          <Box
            sx={{
              gridColumn: { md: "span 8", xs: "span 12" },
              height: "100%",
              // border: "2px solid blue",
            }}
          >
            <Item>
              <Stack
                justifyContent="flex-start"
                flexDirection="column"
                borderRadius={2}
                width={"100%"}
                sx={{
                  height: { xs: "auto", md: "100%" },
                  minHeight: "150px",
                }}
              >
                {/* Title */}
                <Stack width={"100%"} sx={{ p: 1 }} height={"10%"}>
                  <Typography variant="h6" fontWeight="bold">
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
            </Item>
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
};

export default CareGiverDashboard;
