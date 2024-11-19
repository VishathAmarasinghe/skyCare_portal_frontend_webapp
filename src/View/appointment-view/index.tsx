import { Button, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import AppointmentCalender from "./components/AppointmentCalender";


const AppointmentView = () => {
  const theme = useTheme();
  return (
    <Stack width="100%" border="2px solid red" height="100%">
      <Stack width="100%" flexDirection="row" alignItems="center" height="8%" justifyContent="space-between">
        <Typography color={theme.palette.primary.main} fontWeight="600" variant="h6">Appointments</Typography>
        <Button variant='contained'>Add Appointment</Button>
      </Stack>
      <Stack width="100%" height="90%" border="2px solid green">
        <AppointmentCalender/>
      </Stack>

    </Stack>
  )
};

export default AppointmentView;
