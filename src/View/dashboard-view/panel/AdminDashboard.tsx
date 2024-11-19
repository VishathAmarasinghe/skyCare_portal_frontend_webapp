import { Grid, Grid2, Stack, Typography } from '@mui/material'
import React from 'react'
import HelloCard from '../Components/HelloCard'
import { DASHBOARD_CARDS } from '../../../constants/index'
import DashboardCard from '../Components/DashboardCard'

const AdminDashboard = () => {
  return (
    <Stack width="100%" height="100%" border="2px solid pink" flexDirection="column" alignItems="center">
        <Stack width="100%" height="5%" >
            <Typography variant='h5'>Dashboard</Typography>
        </Stack>
        <HelloCard/>
        <Stack width={"100%"} my={2} flexDirection="row" alignItems="center" justifyContent="space-between">
            <Grid container  spacing={2} >
                {
                    DASHBOARD_CARDS.map((card) => {
                        return (
                            <Grid item xs={6} sm={3} md={3} key={card.title} >
                                <DashboardCard {...card} />
                            </Grid>
                        )
                    })
                }
            </Grid>

        </Stack>
    </Stack>
  )
}

export default AdminDashboard
