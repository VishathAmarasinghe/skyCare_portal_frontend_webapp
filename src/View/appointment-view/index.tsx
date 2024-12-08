import { Button, Stack, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import AppointmentCalender from "./components/AppointmentCalender";
import AddNewAppointmentModal from "@view/client-view/modal/AddNewAppointmentModal";
import { useAppDispatch } from "@slices/store";
import { resetSelectedAppointment } from "@slices/AppointmentSlice/appointment";


const AppointmentView = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [isAppointmentDetailShowingModalOpen,setIsAppointmentAddModalVisible] = useState<boolean>(false);
  const [isEditing,setIsEditing] = useState<boolean>(false);

  const handleOpenAddNewAppointmentModal = () => {
    setIsAppointmentAddModalVisible(true);
    dispatch(resetSelectedAppointment());
  }

  return (
    <Stack width="100%" border="2px solid red" height="100%">
      <AddNewAppointmentModal isAppointmentAddModalVisible={isAppointmentDetailShowingModalOpen} 
        setIsAppointmentAddModalVisible={setIsAppointmentAddModalVisible}
        isEditMode={isEditing}
        setIsEditMode={setIsEditing}
        />
      <Stack width="100%" flexDirection="row" alignItems="center" height="8%" justifyContent="space-between">
        <Typography color={theme.palette.primary.main} fontWeight="600" variant="h6">Appointments</Typography>
        <Button onClick={()=>handleOpenAddNewAppointmentModal()} variant='contained'>Add Appointment</Button>
      </Stack>
      <Stack width="100%" height="90%" border="2px solid green">
        <AppointmentCalender setIsAppointmentAddModalVisible={setIsAppointmentAddModalVisible} setIsEditing={setIsEditing}/>
      </Stack>
    </Stack>
  )
};

export default AppointmentView;
