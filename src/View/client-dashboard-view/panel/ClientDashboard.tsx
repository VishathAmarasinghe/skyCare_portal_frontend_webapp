import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { AccessAlarm } from "@mui/icons-material"; // Importing MUI icon
import HelloCard from "../../dashboard-view/Components/HelloCard";
import { DASHBOARD_CARDS } from "../../../constants/index";
import DashboardCard from "../../dashboard-view/Components/DashboardCard";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { fetchAdminDashboard } from "../../../slices/dashboardSlice/dashboard";
import { DashboardCardProps } from "../../../types/types";
import AppointmentBarChart from "../../dashboard-view/Components/AppointmentBarChart";
import AppointmentTypePieChart from "../../dashboard-view/Components/AppointmentTypePieChart";
import AppointmentProgressChart from "../../dashboard-view/Components/AppointmentProgressChart";
import { theme } from "antd";
import { fetchAppointmentTypes } from "@slices/appointmentSlice/appointment";
import AppointmentCard from "../../dashboard-view/Components/AppointmentCard";
import ClientPendingAppointmentView from "../../client-pendingAppointment-view/index";

const ClientDashboard = () => {
  const dispatch = useAppDispatch();
  const dashboardSlice = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
    dispatch(fetchAppointmentTypes());
  }, [dispatch]);

  const Item = ({ children }: { children: React.ReactNode }) => (
    <Paper
      sx={{
        padding: 2,
        width: "100%",
        height: "100%",
        color: "text.secondary",
        backgroundColor: "white",
        boxShadow: 1,
        borderRadius: 2,
      }}
    >
      {children}
    </Paper>
  );

  const dashboardCardInfo: DashboardCardProps[] = DASHBOARD_CARDS.map(
    (card) => {
      return {
        ...card,
        value:
          typeof dashboardSlice.adminDashboard?.[
            card.name as keyof typeof dashboardSlice.adminDashboard
          ] === "number"
            ? (dashboardSlice.adminDashboard[
                card.name as keyof typeof dashboardSlice.adminDashboard
              ] as number)
            : 0,
      };
    }
  );

  return (
    <Stack
      width="100%"
      height="100%"
      flexDirection="column"
      alignItems="center"
      data-aos="fade-right"
      data-aos-duration="200"
    >
      <Stack width="100%" height="5%">
        <Typography variant="h6">Dashboard</Typography>
      </Stack>
      <HelloCard />
      {/* <Stack
        width={"100%"}
        my={2}
        height={"10%"}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid container spacing={2}>
          {dashboardCardInfo.map((card) => (
            <Grid item xs={6} sm={3} md={3} key={card.title}>
              <DashboardCard {...card} />
            </Grid>
          ))}
        </Grid>
      </Stack> */}
      <Stack
      flexDirection="row"
      alignItems="center"
      mt={2}
      justifyContent="space-between"
        sx={{
          height: "90%",
          width: "100%",
        }}
      >
        <ClientPendingAppointmentView/>
      </Stack>
    </Stack>
  );
};

export default ClientDashboard;
