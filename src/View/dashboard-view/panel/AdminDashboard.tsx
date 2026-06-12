import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HailIcon from "@mui/icons-material/Hail";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import dayjs from "dayjs";
import HelloCard from "../Components/HelloCard";
import DashboardCard from "../Components/DashboardCard";
import DashboardDateRangeSelector, {
  DateRangeValue,
} from "../Components/admin-insights/DashboardDateRangeSelector";
import TimesheetSubmissionsBarChart from "../Components/admin-insights/TimesheetSubmissionsBarChart";
import DocumentComplianceSection from "../Components/admin-insights/DocumentComplianceSection";
import KpiCard from "../Components/admin-insights/KpiCard";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { fetchAdminInsightsDashboard } from "../../../slices/dashboardSlice/dashboard";
import { State } from "../../../types/types";

const defaultRange = (): DateRangeValue => {
  const to = dayjs();
  const from = to.subtract(13, "day");
  return { from: from.format("YYYY-MM-DD"), to: to.format("YYYY-MM-DD") };
};

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const dashboardSlice = useAppSelector((state) => state.dashboard);
  const [dateRange, setDateRange] = useState<DateRangeValue>(defaultRange);

  useEffect(() => {
    dispatch(fetchAdminInsightsDashboard(dateRange));
  }, [dispatch, dateRange.from, dateRange.to]);

  const insights = dashboardSlice.adminInsights;
  const loading = dashboardSlice.state === State.loading && !insights;

  const documentIssueTotal = useMemo(() => {
    if (!insights?.documents?.summary) {
      return 0;
    }
    const s = insights.documents.summary;
    return (
      s.expired +
      s.expiringIn30Days +
      s.missingRequired +
      s.missingExpiryDate
    );
  }, [insights]);

  const changeLabel = useMemo(() => {
    const change = insights?.timesheet?.changePercent;
    if (change == null) {
      return "New activity vs previous period";
    }
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}% vs previous period`;
  }, [insights]);

  return (
    <>
      <Box
        sx={{
          display: { xs: "flex", lg: "none" },
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Typography variant="h6" color="text.secondary" textAlign="center">
          The admin dashboard is designed for desktop. Please open this page on a
          larger screen.
        </Typography>
      </Box>

      <Stack
        width="100%"
        height="100%"
        gap={2}
        sx={{
          display: { xs: "none", lg: "flex" },
          minWidth: 1100,
          overflow: "auto",
          pb: 3,
        }}
        data-aos="fade-right"
        data-aos-duration="200"
      >
        <HelloCard />

        <Paper sx={{ p: 2, borderRadius: 2 }} elevation={0} variant="outlined">
          <DashboardDateRangeSelector value={dateRange} onChange={setDateRange} />
        </Paper>

        {loading && (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        )}

        {!loading && insights && (
          <>
            <Grid container spacing={2}>
              <Grid item lg={3} md={3} sm={6} xs={12}>
                <DashboardCard
                  title="Clients"
                  name="clientCount"
                  value={insights.clientCount}
                  icon={PeopleIcon}
                  urlLink="/Clients"
                />
              </Grid>
              <Grid item lg={3} md={3} sm={6} xs={12}>
                <DashboardCard
                  title="Staff"
                  name="staffCount"
                  value={insights.staffCount}
                  icon={HailIcon}
                  urlLink="/Employees"
                />
              </Grid>
              <Grid item lg={3} md={3} sm={6} xs={12}>
                <DashboardCard
                  title="Timesheets received"
                  name="timesheetReceived"
                  value={insights.timesheet.totalReceived}
                  icon={AssignmentTurnedInIcon}
                  urlLink="/Reports"
                />
              </Grid>
              <Grid item lg={3} md={3} sm={6} xs={12}>
                <DashboardCard
                  title="Document issues"
                  name="documentIssues"
                  value={documentIssueTotal}
                  icon={WarningAmberIcon}
                  urlLink="/Employees"
                />
              </Grid>
            </Grid>

            <Stack gap={2}>
              <Typography variant="h6" fontWeight={700}>
                Timesheet intake
              </Typography>
              <Stack direction="row" gap={2} flexWrap="wrap">
                <KpiCard
                  label="Received this period"
                  value={insights.timesheet.totalReceived}
                  helper={`${insights.timesheet.fromDate} to ${insights.timesheet.toDate}`}
                />
                <KpiCard
                  label="Previous period"
                  value={insights.timesheet.previousPeriodTotal}
                  helper={`${insights.timesheet.previousFromDate} to ${insights.timesheet.previousToDate}`}
                />
                <KpiCard label="Change" value={changeLabel} />
                <KpiCard
                  label="Average per day"
                  value={insights.timesheet.averagePerDay.toFixed(1)}
                />
                <KpiCard
                  label="Peak day"
                  value={insights.timesheet.peakDayCount}
                  helper={insights.timesheet.peakDay}
                />
              </Stack>
            </Stack>

            <Paper sx={{ p: 2.5, borderRadius: 2 }} elevation={0} variant="outlined">
              <TimesheetSubmissionsBarChart
                submissionsByDay={insights.timesheet.submissionsByDay}
              />
            </Paper>

            <DocumentComplianceSection documents={insights.documents} />

            {(insights.agreements.awaitingSignature > 0 ||
              insights.agreements.expired > 0) && (
              <Paper sx={{ p: 0, borderRadius: 2, backgroundColor:"transparent" }} elevation={0} >
                <Typography variant="h6" fontWeight={700} mb={1}>
                  Service agreements
                </Typography>
                <Stack direction="row" gap={2} flexWrap="wrap">
                  <KpiCard
                    label="Awaiting signature"
                    value={insights.agreements.awaitingSignature}
                  />
                  <KpiCard label="Sent" value={insights.agreements.sent} />
                  <KpiCard label="Viewed" value={insights.agreements.viewed} />
                  <KpiCard
                    label="Expired"
                    value={insights.agreements.expired}
                    accent="error.main"
                  />
                </Stack>
              </Paper>
            )}
          </>
        )}
      </Stack>
    </>
  );
};

export default AdminDashboard;
