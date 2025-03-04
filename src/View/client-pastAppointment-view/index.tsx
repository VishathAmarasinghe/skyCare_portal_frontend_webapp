import { FILE_DOWNLOAD_BASE_URL } from '@config/config';
import { Avatar, Chip, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import ClientPastAppointmentTable from './components/ClientPastAppointmentTable';
import dayjs from 'dayjs';
import { Employee, fetchCareGiversAssignToClientID } from '@slices/employeeSlice/employee';
import { useAppDispatch, useAppSelector } from '@slices/store';
import { fetchPastAppointmentsWithClient } from '@slices/appointmentSlice/appointment';
import ClientPendingAppointmentCardList from './components/ClientPastAppointmentCard';

const ClientPastAppointmentView = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const authSlice = useAppSelector((state)=>state?.auth);
    const employeeSlice = useAppSelector((state)=>state?.employees);
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [selectedOption, setSelectedOption] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
    const [employees, setEmployees] = useState<Employee[]>([]);

    useEffect(() => {
        dispatch(
          fetchCareGiversAssignToClientID(authSlice?.userInfo?.userID || "")
        );
      }, []);

    useEffect(() => {
        dispatch(
            fetchPastAppointmentsWithClient({clientID:authSlice?.userInfo?.userID || "",startDate,endDate,careGiver:selectedOption})
          );
    }, [selectedOption, startDate, endDate]);
    
      useEffect(() => {
        if (employeeSlice?.employees?.length>0) {
          setEmployees(employeeSlice?.employees);
        }
      }, [employeeSlice?.employees]);

    const handleOptionChange = (event: SelectChangeEvent<string>) => {
        setSelectedOption(event.target.value as string);
      };
    
      const handleStartDateChange = (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        setStartDate(event.target.value);
      };
    
      const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(event.target.value);
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
          Past Appointments
        </Typography>
      </Stack>
      <Stack width="100%" height="90%" mt={1}>
        <Grid
          container
          width={"100%"}
          height="10%"
          spacing={2}
          alignItems="center"
        >
          {/* Selector */}
          <Grid item xs={12} sm={4} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Care Giver</InputLabel>
              <Select
                value={selectedOption}
                onChange={handleOptionChange}
                displayEmpty
                variant="outlined"
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="all">All</MenuItem>
                {employees?.map((emp) => (
                  <MenuItem key={emp?.employeeID} value={emp?.employeeID}>
                    <Chip
                      avatar={
                        <Avatar
                          src={
                            emp?.profile_photo
                              ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                                  emp?.profile_photo
                                )}`
                              : ""
                          } // Replace with your avatar URL logic
                          alt={emp?.firstName}
                        >
                          {emp.email?.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      label={`${emp?.firstName} ${emp?.lastName}`}
                      variant="outlined"
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Start Date */}
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              name="startDate"
              value={startDate}
              onChange={handleStartDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          {/* End Date */}
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              name="endDate"
              size="small"
              value={endDate}
              onChange={handleEndDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
        <Stack width={"100%"} height={"90%"}>
        {isMobile ? (
            <Stack width={"100%"} sx={{ overflowY: "auto",height:"90%",mt:13 }}>
                <ClientPendingAppointmentCardList/>
            </Stack>
          ) : (
            <ClientPastAppointmentTable/>
          )}
         
        </Stack>
      </Stack>
    </Stack>
  )
}

export default ClientPastAppointmentView
