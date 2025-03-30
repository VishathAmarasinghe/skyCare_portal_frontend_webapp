import { FILE_DOWNLOAD_BASE_URL } from '@config/config';
import { Avatar, Chip, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import ClientPastAppointmentTable from './components/ClientPendingAppointmentTable';
import dayjs from 'dayjs';
import { Employee, fetchCareGiversAssignToClientID } from '@slices/employeeSlice/employee';
import { useAppDispatch, useAppSelector } from '@slices/store';
import ClientPendingAppointmentTable from './components/ClientPendingAppointmentTable';
import { fetchPendingAppointmentsWithClient } from '@slices/appointmentSlice/appointment';
import ClientPendingAppointmentCardList from './components/ClientPendingAppointmentCard';

const ClientPendingAppointmentView = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const authSlice = useAppSelector((state)=>state?.auth);
    const employeeSlice = useAppSelector((state)=>state?.employees);
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    

    useEffect(() => {
        dispatch(
          fetchPendingAppointmentsWithClient({clientID:authSlice?.userInfo?.userID || ""})
        );
      }, []);
    
    
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
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        height={"9%"}
      >
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h6"
        >
          Pending Appointments
        </Typography>
      </Stack>
      <Stack width="100%" height="90%" mt={1}>
        <Stack width={"100%"} height={"90%"}>
        {isMobile ? (
            <Stack width={"100%"} sx={{ overflowY: "auto",height:"90%",mt:13 }}>
                <ClientPendingAppointmentCardList/>
            </Stack>
          ) : (
            <ClientPendingAppointmentTable/>
          )}
         
        </Stack>
      </Stack>
    </Stack>
  )
}

export default ClientPendingAppointmentView
