import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
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

  const Item = ({ children }: { children: React.ReactNode }) => (
    <Paper
      sx={{
        p: 2,
        width: "100%",
        height: "100%",
        color: "text.secondary",
        backgroundColor: "white",
        boxShadow: 1,
        borderRadius: 2,
      }}
    >
      <Typography>{children}</Typography>
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
      <Box
        sx={{
          display: "grid",
          // border: "2px solid red",
          height: "100%",
          width: "100%",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)", // 1 column for mobile
            sm: "repeat(1, 1fr)", // 1 column for small screens
            md: "repeat(12, 1fr)", // 12-column grid for medium+ screens
          },
          gap: 2,
        }}
      >
        {/* Left Top Item */}
        <Box
          sx={{
            gridColumn: { md: "span 4", xs: "span 12" },
            // border: "2px solid green",
            height: "100%",
          }}
        >
          <Item>
            <AppointmentProgressChart
              todayCompletedCount={
                dashboardSlice?.adminDashboard?.todayCompletedCount ?? 0
              }
              todayTotalCount={
                dashboardSlice?.adminDashboard?.todayTotalCount ?? 0
              }
            />
          </Item>
        </Box>

        <Box
          sx={{
            gridColumn: { md: "span 4", xs: "span 12" },
            // border: "2px solid green",
            height: "100%",
          }}
        >
          <Item>
            <AppointmentTypePieChart
              appointmentCountByType={
                dashboardSlice?.adminDashboard?.appointmentCountByType || {}
              }
            />
          </Item>
        </Box>

        {/* Right Item */}
        <Box
          sx={{
            gridColumn: { md: "span 4", xs: "span 12" },
            // border: "2px solid green",
            height: "100%",
            gridRow: "span 2",
          }}
        >
          <Item>
            <Stack height={"100%"}>
              <Typography variant="h6" fontWeight={"bold"}>
                Today Appointments
              </Typography>
              <Stack
                width="100%"
                // border="2px solid blue"
                flexGrow={1}
                height="100%"
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
            </Stack>
          </Item>
        </Box>

        {/* Left Bottom Item */}
        <Box
          sx={{
            gridColumn: { md: "span 8", xs: "span 12" },
            // border: "2px solid pink",
            height: "100%",
          }}
        >
          <Item>
            <AppointmentBarChart
              twoWeekAppointmentCount={
                dashboardSlice?.adminDashboard?.twoWeekAppointmentCount || {}
              }
            />
          </Item>
        </Box>
      </Box>
    </Stack>
  );
};

export default AdminDashboard;
