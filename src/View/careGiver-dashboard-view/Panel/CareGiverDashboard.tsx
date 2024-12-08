import { Stack, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import HelloCard from '../../dashboard-view/Components/HelloCard';
import BroadcastAppointmentCard from '../components/BroadcastAppointmentCard';
import { useAppDispatch, useAppSelector } from '@slices/store';
import { AppointmentCareGiver, fetchAppointmentsByCareGiverAndStatus, fetchAppointmentTypes } from '@slices/AppointmentSlice/appointment';
import { selectUserInfo } from '@slices/authSlice/Auth';
import AppointmentDetailsModal from '../Modal/AppointmentDetailsModal';
import { State } from '../../../types/types';

const CareGiverDashboard = () => {
    const dispatch = useAppDispatch();
    const [isAppointmentModalVisible, setIsAppointmentModalVisible] = React.useState<boolean>(false);
    const currentUser = useAppSelector(selectUserInfo);
    const [broadcastAppointments, setBroadcastAppointments] = React.useState<AppointmentCareGiver[]>([]);
    const appointmentSlice = useAppSelector((state)=>state?.appointments);

    useEffect(() => {
        if (currentUser?.userID !== null) {
            dispatch(fetchAppointmentsByCareGiverAndStatus({ employeeID: currentUser?.userID ?? '', status: "Allocated" }));
            dispatch(fetchAppointmentTypes());
        }
    }, [currentUser?.userID, dispatch]);

    useEffect(() => {
        console.log("Appointment Slice", appointmentSlice.updateState);
        if (appointmentSlice?.updateState === State.success) {
            dispatch(fetchAppointmentsByCareGiverAndStatus({ employeeID: currentUser?.userID ?? '', status: "Allocated" }));
            dispatch(fetchAppointmentTypes());
        }
    }, [appointmentSlice?.updateState, currentUser?.userID, dispatch]);

    

    useEffect(()=>{
        setBroadcastAppointments(appointmentSlice?.careGvierAppointments);

    },[appointmentSlice?.state,appointmentSlice?.careGvierAppointments])

  return (
    <Stack width="100%" height="100%" border="2px solid pink" flexDirection="column" alignItems="center">
      <Stack width="100%" height="5%">
        <Typography variant="h5">Dashboard</Typography>
      </Stack>
      <HelloCard />
      <AppointmentDetailsModal open={isAppointmentModalVisible} onClose={() => setIsAppointmentModalVisible(false)}/>
      <Stack width="100%" height={"90%"} my={2} flexDirection="column" alignItems="center" justifyContent="space-between">
        <Stack
          width="100%"
          sx={{
            flexDirection: {
              xs: 'column-reverse',
              sm: 'column-reverse',
              md: 'column',
              lg: 'column-reverse',
              xl: 'column',
            },
          }}
        >
          <Stack width="100%" border="2px solid green">
            <p>Card Section</p>
          </Stack>
          <Stack width="100%" border="2px solid blue">
            <p>Upcoming One</p>
          </Stack>
        </Stack>
        <Stack
          width="100%"
          justifyContent={{ xs: 'flex-start', sm: 'flex-start', md: 'space-between', lg: 'space-between', xl: 'space-between' }}
          border="2px solid red"
          height="80%"
          sx={{
            flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row', xl: 'row' },
          }}
        >
          {/* Broadcast Appointments */}
          <Stack
            bgcolor="white"
            justifyContent="flex-start"
            flexDirection="column"
            borderRadius={2}
            sx={{
              width: { xs: '100%', sm: '100%', md: '60%', lg: '60%', xl: '60%' },
              height: { xs: 'auto', md: '80%' }, 
              minHeight: '150px',
            }}
            border="2px solid purple"
          >
            <Stack width={"100%"} sx={{p: 1}} height={"10%"}>
              <Typography variant="h6" fontWeight="bold">
                Broadcast Appointments
              </Typography>
            </Stack>
            {/* Scrollable Stack for the Cards */}
            <Stack
              width={"100%"}
            //   height={"100%"}
              border="2px solid orange"
              flexDirection="column"

              sx={{
                justifyContent:"flex-start",
                alignItems:"flex-start",

                overflowY: "auto", 
                // maxHeight: "calc(100vh - 200px)",
              }}
            >
                {
                    broadcastAppointments.map((appointment) => {
                        return (
                            <BroadcastAppointmentCard setIsAppointmentAddModalVisible={setIsAppointmentModalVisible} jobDetails={appointment} key={appointment.appointmentData?.appointmentID} />
                        )
                })
            }
              {/* Add more cards as needed */}
            </Stack>
          </Stack>

          {/* Pending Appointments */}
          <Stack
            sx={{
              width: { xs: '100%', sm: '100%', md: '35%', lg: '35%', xl: '35%' },
              height: { xs: 'auto', md: '100%' }, // Auto height for mobile, full height for desktop
              minHeight: '150px', // Ensure a minimum height
            }}
            border="2px solid yellow"
          >
            Pending Appointments
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default CareGiverDashboard;
