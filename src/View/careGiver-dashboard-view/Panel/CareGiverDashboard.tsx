import { Box, Grid, Stack, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import HelloCard from "../../dashboard-view/Components/HelloCard";
import BroadcastAppointmentCard from "../components/BroadcastAppointmentCard";
import { useAppDispatch, useAppSelector } from "@slices/store";
import {
  AppointmentCareGiver,
  fetchAppointmentsByCareGiverAndStatus,
  fetchAppointmentTypes,
  fetchNextAppointmentbyCareGiver,
} from "@slices/AppointmentSlice/appointment";
import { selectUserInfo } from "@slices/authSlice/Auth";
import AppointmentDetailsModal from "../Modal/AppointmentDetailsModal";
import { State } from "../../../types/types";
import NextAppointmentCard from "../components/NextAppointmentCard";
import ShiftNoteModal from "../Modal/ShiftNoteModal";

const CareGiverDashboard = () => {
  const dispatch = useAppDispatch();
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] =
    React.useState<boolean>(false);
  const currentUser = useAppSelector(selectUserInfo);
  const [broadcastAppointments, setBroadcastAppointments] = React.useState<
    AppointmentCareGiver[]
  >([]);
  const [shiftModalOpen, setShiftModalOpen] = useState<boolean>(false);
  const [shiftIsEditMode, setShiftIsEditMode] = useState<boolean>(false);
  const appointmentSlice = useAppSelector((state) => state?.appointments);
  const shiftNoteState = useAppSelector((state)=>state?.shiftNotes);
  const [selectedShiftNote, setSelectedShiftNote] = useState<{ shiftNoteID: string | null }>({ shiftNoteID: null });

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
      dispatch(fetchAppointmentTypes());
      dispatch(
        fetchNextAppointmentbyCareGiver({
          employeeID: currentUser?.userID ?? "",
        })
      );
    }
  }

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
      <Stack width="100%" height="5%">
        <Typography variant="h5">Dashboard</Typography>
        <ShiftNoteModal isEditMode={shiftIsEditMode} setIsEditMode={setShiftIsEditMode} 
        isNoteModalVisible={shiftModalOpen} setIsNoteModalVisible={setShiftModalOpen}
        selectedShiftNote={selectedShiftNote} setSelectedShiftNote={setSelectedShiftNote}  
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
          <Box width="100%" 
           p={2}>
            <Grid
              container
              spacing={2}
              sx={{
                flexDirection: { xs: "column-reverse", sm: "row" }, // On mobile, last item comes first
              }}
            >
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    padding: 2,
                    textAlign: "center",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  Item 1
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    padding: 2,
                    textAlign: "center",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  Item 2
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                  <NextAppointmentCard 
                  selectedShiftNote={selectedShiftNote} setSelectedShiftNote={setSelectedShiftNote}  
                  setIsEditMode={setShiftIsEditMode} setIsModalVisible={setShiftModalOpen} />
              </Grid>
            </Grid>
          </Box>
        </Stack>
        <Stack
          width="100%"
          justifyContent={{
            xs: "flex-start",
            sm: "flex-start",
            md: "space-between",
            lg: "space-between",
            xl: "space-between",
          }}
          // border="2px solid red"
          height="80%"
          sx={{
            flexDirection: {
              xs: "column",
              sm: "column",
              md: "row",
              lg: "row",
              xl: "row",
            },
          }}
        >
          {/* Broadcast Appointments */}
          <Stack
            bgcolor="white"
            justifyContent="flex-start"
            flexDirection="column"
            borderRadius={2}
            boxShadow={2}
            sx={{
              width: {
                xs: "100%",
                sm: "100%",
                md: "60%",
                lg: "60%",
                xl: "60%",
              },
              height: { xs: "auto", md: "100%" },
              minHeight: "150px",
            }}
            // border="2px solid purple"
          >
            <Stack width={"100%"} sx={{ p: 1 }} height={"10%"}>
              <Typography variant="h6" fontWeight="bold">
                Broadcast Appointments
              </Typography>
            </Stack>
            {/* Scrollable Stack for the Cards */}
            <Stack
              width={"100%"}
                // height={"100%"}
              // border="2px solid orange"
              flexDirection="column"
              mt={1}
              sx={{
                justifyContent: "flex-start",
                alignItems: "flex-start",

                overflowY: "auto",
                // maxHeight: "calc(100vh - 200px)",
              }}
            >
              {broadcastAppointments.map((appointment) => {
                return (
                  <BroadcastAppointmentCard
                    setIsAppointmentAddModalVisible={
                      setIsAppointmentModalVisible
                    }
                    jobDetails={appointment}
                    key={appointment.appointmentData?.appointmentID}
                  />
                );
              })}
              {/* Add more cards as needed */}
            </Stack>
          </Stack>

          {/* Pending Appointments */}
          <Stack
            sx={{
              backgroundColor: "white",
              padding: 2,
              borderRadius: 2,
              boxShadow: 2,
              width: {
                xs: "100%",
                sm: "100%",
                md: "35%",
                lg: "35%",
                xl: "35%",
              },
              height: { xs: "auto", md: "100%" }, // Auto height for mobile, full height for desktop
              minHeight: "150px", // Ensure a minimum height
            }}
            // border="2px solid yellow"
          >
            Pending Appointments
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default CareGiverDashboard;
