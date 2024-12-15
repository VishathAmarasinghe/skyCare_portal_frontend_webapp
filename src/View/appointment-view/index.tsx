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
    <Stack width="100%"  height="100%" 
    data-aos="fade-right"
    data-aos-duration="200"
    sx={{backgroundColor: theme.palette.background.paper, boxShadow: 1, borderRadius: 2, padding: 2}}
    >
      <AddNewAppointmentModal isAppointmentAddModalVisible={isAppointmentDetailShowingModalOpen} 
        setIsAppointmentAddModalVisible={setIsAppointmentAddModalVisible}
        isEditMode={isEditing}
        setIsEditMode={setIsEditing}
        />
      <Stack width="100%" flexDirection="row" alignItems="center" height="8%" justifyContent="space-between">
        <Typography color={theme.palette.primary.main} fontWeight="600" variant="h5">Appointments</Typography>
        <Button onClick={()=>handleOpenAddNewAppointmentModal()} variant='contained'>Add Appointment</Button>
      </Stack>
      <Stack width="100%" height="90%">
        <AppointmentCalender setIsAppointmentAddModalVisible={setIsAppointmentAddModalVisible} setIsEditing={setIsEditing}/>
      </Stack>
    </Stack>
  )
};

export default AppointmentView;
