import { Button, Stack, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import AppointmentCalender from "./components/AppointmentCalender";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import { resetSelectedAppointment } from "../../slices/appointmentSlice/appointment";
import {
  APPLICATION_ADMIN,
  APPLICATION_SUPER_ADMIN,
} from "../../config/config";
import RecurrentAppointmentDetailsModal from "../careGiver-dashboard-view/modal/RecurrentAppointmentDetailsModal";
import AddNewAppointmentModal from "../client-view/modal/AddNewAppointmentModal";

const AppointmentView = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [isAppointmentDetailShowingModalOpen, setIsAppointmentAddModalVisible] =
    useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const authRole = useAppSelector((State) => State?.auth?.roles);
  const [recurrentAppointmentVisible, setRecurrentAppointmentVisible] =
    useState<boolean>(false);

  const handleOpenAddNewAppointmentModal = () => {
    setIsAppointmentAddModalVisible(true);
    setIsEditing(true);
    dispatch(resetSelectedAppointment());
  };

  return (
    <Stack
      width="100%"
      height="100%"
      data-aos="fade-right"
      data-aos-duration="200"
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: 1,
        borderRadius: 2,
        padding: 2,
      }}
    >
      <AddNewAppointmentModal
        isAppointmentAddModalVisible={isAppointmentDetailShowingModalOpen}
        setIsAppointmentAddModalVisible={setIsAppointmentAddModalVisible}
        isEditMode={isEditing}
        setIsEditMode={setIsEditing}
      />
      <RecurrentAppointmentDetailsModal
        open={recurrentAppointmentVisible}
        onClose={() => setRecurrentAppointmentVisible(false)}
      />
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="center"
        height="8%"
        justifyContent="space-between"
      >
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h5"
        >
          Appointments
        </Typography>
        {authRole?.includes(APPLICATION_ADMIN) ||
        authRole?.includes(APPLICATION_SUPER_ADMIN) ? (
          <Button
            onClick={() => handleOpenAddNewAppointmentModal()}
            variant="contained"
          >
            Add Appointment
          </Button>
        ) : null}
      </Stack>
      <Stack width="100%" height="90%">
        <AppointmentCalender
          setRecurrentAppointmentVisible={setRecurrentAppointmentVisible}
          setIsAppointmentAddModalVisible={setIsAppointmentAddModalVisible}
          setIsEditing={setIsEditing}
        />
      </Stack>
    </Stack>
  );
};

export default AppointmentView;
