import { Grid, Grid2, Stack, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import HelloCard from '../Components/HelloCard'
import { DASHBOARD_CARDS } from '../../../constants/index'
import DashboardCard from '../Components/DashboardCard'
import { useAppDispatch, useAppSelector } from '@slices/store'
import { fetchAdminDashboard } from '@slices/DashboardSlice/dashboard'
import { DashboardCardProps } from '../../../types/types';
import AppointmentCard from '../Components/AppointmentCard';

const AdminDashboard = () => {
    const dispatch = useAppDispatch();
    const dashboardSlice = useAppSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchAdminDashboard());
        
    }, [])

    const dashboardCardInfo:DashboardCardProps[] = DASHBOARD_CARDS.map((card) => {
        return {
            ...card,
            value: typeof dashboardSlice.adminDashboard?.[card.name as keyof typeof dashboardSlice.adminDashboard] === 'number' 
                ? dashboardSlice.adminDashboard[card.name as keyof typeof dashboardSlice.adminDashboard] as number 
                : 0
        }
    }); 
  return (
    <Stack width="100%" height="100%"  flexDirection="column" alignItems="center"
    data-aos="fade-right"
    data-aos-duration="200"
    >
        <Stack width="100%" height="5%" >
            <Typography variant='h5'>Dashboard</Typography>
        </Stack>
        <HelloCard/>
        <Stack width={"100%"} my={2} flexDirection="row" alignItems="center" justifyContent="space-between">
            <Grid container  spacing={2} >
                {
                    dashboardCardInfo.map((card) => {
                        return (
                            <Grid item xs={6} sm={3} md={3} key={card.title} >
                                <DashboardCard {...card} />
                            </Grid>
                        )
                    })
                }
            </Grid>

        </Stack>
        <Stack width={"100%"} height={"100%"}>
        <Grid container   height={"100%"}>
      {/* First item */}
      <Grid item xs={12} md={8} >
      </Grid>

      {/* Second item */}
      <Grid item xs={12} md={4}  spacing={2}
      sx={{backgroundColor: "white",borderRadius: 2}}
      >
        <Typography variant="body1" p={1}>Today Appointments</Typography>
        <Stack width={"96%"} flexDirection={"column"} alignItems={"center"}>
          <AppointmentCard todayAppointments={dashboardSlice.adminDashboard?.todayAppointments || []} />
        </Stack>
      </Grid>
    </Grid>
        </Stack>

    </Stack>
  )
}

export default AdminDashboard
