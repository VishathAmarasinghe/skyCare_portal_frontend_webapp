import React from 'react';
import { Grid, Card, CardContent, Typography, Stack, useTheme, Box } from '@mui/material';
import dayjs from 'dayjs'; // Import dayjs
import { AppointmentCalenderType } from '@slices/AppointmentSlice/appointment';

const AppointmentCard = ({ todayAppointments }: { todayAppointments: AppointmentCalenderType[] }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        width: '95%',
        // border:"2px solid red",
        flexDirection: 'column',
        maxHeight: 347, 
        overflowY: 'auto', // Enable vertical scrolling
      }}
    >
      <Grid container spacing={1} direction="column">
        {todayAppointments?.map((appointment) => {
          const formattedStartTime = dayjs(appointment.startDateAndTime).format('HH:mm'); // Format to time only
          const formattedEndTime = dayjs(appointment.endDateAndTime).format('HH:mm'); // Format to time only

          return (
            <Grid item xs={12} key={appointment.appointmentID}>
              <Card
                sx={{
                  boxShadow: 1,
                  borderRadius: 2,
                  padding: 0.5,
                  backgroundColor: theme.palette.background.default,
                }}
              >
                <CardContent sx={{ padding: '8px !important' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="column">
                      <Typography variant="body1" fontWeight={600}>
                        {appointment.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {appointment.appointmentID}
                      </Typography>
                    </Stack>
                    <Stack direction="column" alignItems="flex-end">
                      <Typography variant="body2" color="textSecondary">
                        {formattedStartTime} - {formattedEndTime}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default AppointmentCard;
