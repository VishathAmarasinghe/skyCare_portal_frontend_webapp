import React, { useEffect } from "react";
import { Card, Typography, Stack, Button, Divider } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { fetchRecurrentAppointmentDetails, NextAppointmentDTO } from "../../../slices/AppointmentSlice/appointment";
import { ConfirmationType } from "../../../types/types";
import { useConfirmationModalContext } from "@context/DialogContext";
import { getCurrnetShiftNoteState, submitStartShiftNote } from "@slices/ShiftNoteSlice/ShiftNote";
import { set } from "date-fns";
import EventBusyIcon from "@mui/icons-material/EventBusy";

interface NextAppointmentCardProps {
    setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
    setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    selectedShiftNote:{shiftNoteID: string | null };
    setSelectedShiftNote:React.Dispatch<React.SetStateAction<{shiftNoteID: string | null }>>;  
    setIsRecurrentModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isRecurrentModalVisible: boolean;
}

const NextAppointmentCard = ({setIsEditMode,isRecurrentModalVisible,setIsRecurrentModalVisible,setIsModalVisible,setSelectedShiftNote,selectedShiftNote}:NextAppointmentCardProps) => {
  const appointmentSlice = useAppSelector((state) => state.appointments);
  const { showConfirmation } = useConfirmationModalContext();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.userInfo);
  const [nextAppointment, setNextAppointment] = React.useState<NextAppointmentDTO | null>(null);
  const shiftNotesSlice = useAppSelector((State)=>State.shiftNotes);
  const [isShiftNoteStarted,setIsShiftNoteStarted]=React.useState<boolean>(false);

  useEffect(() => {
    setNextAppointment(appointmentSlice?.nextAppointment || null);
  }, [appointmentSlice?.state, appointmentSlice?.nextAppointment]);

  useEffect(()=>{
    handleShiftStarted();
  },[shiftNotesSlice?.currentShiftNoteState])

  useEffect(()=>{
    if (authUser?.userID && nextAppointment?.recurrentTask?.recurrentAppointmentID) {
      dispatch(getCurrnetShiftNoteState({
        employeeID: authUser.userID,
        recurrentAppointmentID: nextAppointment?.recurrentTask?.recurrentAppointmentID
      }));
    }
  },[shiftNotesSlice?.startState,nextAppointment])

  const handleShiftStarted=()=>{
    console.log("shiftNote Availability ",shiftNotesSlice?.currentShiftNoteState?.shiftNoteAvailability);
    console.log("Shift State ",shiftNotesSlice?.currentShiftNoteState?.shiftNoteState);
    console.log("Employee ID ",shiftNotesSlice?.currentShiftNoteState?.employeeID);

    
    console.log("Shift Started ",shiftNotesSlice?.currentShiftNoteState?.shiftNoteAvailability=="available" && 
        shiftNotesSlice?.currentShiftNoteState?.shiftNoteState=="Started" && shiftNotesSlice?.currentShiftNoteState?.employeeID==authUser?.userID);
    
  }

  const isWithinStartWindow = () => {
    if (!nextAppointment) return false;
  
    const startTime = dayjs(
      `${nextAppointment?.recurrentTask?.startDate}T${nextAppointment?.recurrentTask?.startTime}`,
      "YYYY-MM-DDTHH:mm"
    );
  
    const currentTime = dayjs(); // Get the current time
    const startWindowTime = startTime?.subtract(20, "minutes"); // Start window begins 10 minutes before
  
    return currentTime?.isAfter(startWindowTime);
  };

  const handleStartShiftNote = () => {
    if (authUser?.userID && nextAppointment?.recurrentTask.recurrentAppointmentID) {
      dispatch(submitStartShiftNote({
        employeeID: authUser?.userID,
        recurrentAppointmentID: nextAppointment?.recurrentTask?.recurrentAppointmentID
      }));
    }
  }
  

  return (
    <Card
      sx={{
        padding: 2,
        borderRadius: 3,
        backgroundColor: "white",
        width: "100%",
        boxShadow: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      {!nextAppointment?.recurrentTask ? (
        <Stack alignItems="center" spacing={2} sx={{ width: "100%", textAlign: "center" }}>
        <EventBusyIcon color="action" sx={{ fontSize: 48 }} /> {/* Add the icon */}
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ width: "100%" }}
        >
          No future appointments
        </Typography>
      </Stack>
      ) : (
        <>
          {/* Title Section */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ marginBottom: 2 }}>
            <Stack flexDirection={"row"} alignItems={"center"}>
              <EventIcon color="primary" />
              <Typography variant="h6" ml={1} fontWeight="bold" color="primary">
                Next Appointment
                {/* {nextAppointment.recurrentTask.recurrentAppointmentID} */}
              </Typography>
            </Stack>
            <Stack direction={{sx:"row",sm:"row",md:"column",lg:"row"}} spacing={1}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<VisibilityIcon />}
                size="small"
                sx={{ textTransform: "capitalize" }}
                onClick={() => {
                  dispatch(fetchRecurrentAppointmentDetails({ recurrentAppointmentID: nextAppointment?.recurrentTask?.recurrentAppointmentID }))
                  setIsRecurrentModalVisible(true);
                }}
              >
                View
              </Button>
              {isWithinStartWindow()  && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrowIcon />}
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                  onClick={() => showConfirmation(
                    "Start Appointment Shift",
                    `Are you sure you want to Start Appointment`,
                    ConfirmationType.update,
                    () => handleStartShiftNote(),
                    "Start Now",
                    "Cancel"
                  )}
                >
                  Start
                </Button>
              )}
              {
                shiftNotesSlice?.currentShiftNoteState?.shiftNoteAvailability=="available" && 
                shiftNotesSlice?.currentShiftNoteState?.shiftNoteState=="Started" && shiftNotesSlice?.currentShiftNoteState?.employeeID==authUser?.userID
                &&
                 (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<PlayArrowIcon />}
                    size="small"
                    sx={{ textTransform: "capitalize" }}
                    onClick={() => showConfirmation(
                      "Finishd Appointment Shift",
                      `Are you sure you want to Finish Appointment`,
                      ConfirmationType.update,
                      () => {setIsEditMode(true),setIsModalVisible(true),setSelectedShiftNote({shiftNoteID:shiftNotesSlice?.currentShiftNoteState?.shiftNoteID ?? null})},
                      "Finish Now",
                      "Cancel"
                    )}
                  >
                    Stop
                  </Button>
                )
              }
            </Stack>
          </Stack>
          <Divider sx={{ marginBottom: 2 }} />

          {/* Details in Column */}
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center">
              <AccessTimeIcon color="action" />
              <Typography variant="body2" ml={1}>
                <strong>Start:</strong> {dayjs(nextAppointment?.recurrentTask?.startDate).format("MMM D, YYYY")}{" "}
                {dayjs(nextAppointment?.recurrentTask?.startTime, "HH:mm").format("h:mm A")}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center">
              <AccessTimeIcon color="action" />
              <Typography variant="body2" ml={1}>
                <strong>End:</strong> {dayjs(nextAppointment?.recurrentTask?.endDate).format("MMM D, YYYY")}{" "}
                {dayjs(nextAppointment?.recurrentTask?.endTime, "HH:mm").format("h:mm A")}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center">
              <LocationOnIcon color="action" />
              <Typography variant="body2" ml={1}>
                <strong>Comment:</strong> {nextAppointment?.recurrentTask?.comment || "No comments available"}
              </Typography>
            </Stack>
          </Stack>
        </>
      )}
    </Card>
  );
};

export default NextAppointmentCard;
