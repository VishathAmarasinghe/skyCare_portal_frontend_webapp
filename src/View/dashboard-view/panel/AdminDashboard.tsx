import { Grid, Paper, Stack, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { AccessAlarm } from "@mui/icons-material"; // Importing MUI icon
import HelloCard from "../Components/HelloCard";
import { DASHBOARD_CARDS } from "../../../constants/index";
import DashboardCard from "../Components/DashboardCard";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { fetchAdminDashboard } from "../../../slices/dashboardSlice/dashboard";
import { DashboardCardProps } from "../../../types/types";
import AppointmentCard from "../Components/AppointmentCard";
import AppointmentBarChart from "../Components/AppointmentBarChart";
import AppointmentTypePieChart from "../Components/AppointmentTypePieChart";
import AppointmentProgressChart from "../Components/AppointmentProgressChart";
import { theme } from "antd";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const dashboardSlice = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

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
      <Stack
        width={"100%"}
        my={2}
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
      </Stack>
      <Stack width={"100%"} height={"100%"}>
        <Grid container spacing={2} height={"100%"}>
          {/* First item */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {/* Top Section: Two Grid Items */}
              <Grid item xs={12} sm={6}>
                <Paper elevation={3} style={{ padding: "10px" }}>
                  <AppointmentProgressChart
                    todayCompletedCount={
                      dashboardSlice?.adminDashboard?.todayCompletedCount ?? 0
                    }
                    todayTotalCount={
                      dashboardSlice?.adminDashboard?.todayTotalCount ?? 0
                    }
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={3} style={{ padding: "16px" }}>
                  <AppointmentTypePieChart
                    appointmentCountByType={
                      dashboardSlice?.adminDashboard?.appointmentCountByType ||
                      {}
                    }
                  />
                </Paper>
              </Grid>
              {/* Bottom Section: One Grid Item */}
              <Grid item xs={12} height={"100%"}>
                <Paper
                  elevation={3}
                  style={{ padding: "10px", height: "100%" }}
                >
                  <AppointmentBarChart
                    twoWeekAppointmentCount={
                      dashboardSlice?.adminDashboard?.twoWeekAppointmentCount ||
                      {}
                    }
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Second item */}
          <Grid item xs={12} md={4} style={{ height: "104%" }}>
            <Paper elevation={3} style={{ padding: "10px", height: "100%" }}>
              <Typography
                variant="h6"
                align="center"
                style={{ fontSize: "12px" }}
              >
                Today Appointments
              </Typography>
              <Stack
                width="100%"
                // border="2px solid green"
                flexGrow={1}
                // height="100%"
                flexDirection="column"
                alignItems="center"
                sx={{ overflowY: "auto", maxHeight: "100%" }}
              >
                {(dashboardSlice.adminDashboard?.todayAppointments?.length ??
                  0) > 0 ? (
                  <AppointmentCard
                    todayAppointments={
                      dashboardSlice.adminDashboard?.todayAppointments || []
                    }
                  />
                ) : (
                  <Stack
                    width="100%"
                    height="100%"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      textAlign: "center",
                      mt: 10,
                    }}
                  >
                    <AccessAlarm style={{ fontSize: 30 }} color="primary" />{" "}
                    {/* MUI icon */}
                    <Typography
                      variant="h6"
                      color="textSecondary"
                      sx={{ marginTop: 2 }}
                    >
                      No Appointments
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
};

export default AdminDashboard;
