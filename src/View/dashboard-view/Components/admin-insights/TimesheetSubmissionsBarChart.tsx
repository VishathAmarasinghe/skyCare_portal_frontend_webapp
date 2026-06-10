import React, { useMemo } from "react";
import { BarChart } from "@mui/x-charts";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import {
  DASHBOARD_CHART_HEIGHT,
  angledAxisTickLabelStyle,
  axisLabelStyle,
  axisTickLabelStyle,
  computeYAxisMax,
  dashboardLegendSlotProps,
  hasChartData,
  verticalChartMargins,
} from "./dashboardChartStyles";

interface TimesheetSubmissionsBarChartProps {
  submissionsByDay: Record<string, number>;
}

const TimesheetSubmissionsBarChart: React.FC<TimesheetSubmissionsBarChartProps> = ({
  submissionsByDay,
}) => {
  const theme = useTheme();

  const chartData = useMemo(
    () =>
      Object.entries(submissionsByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          date,
          label: date.slice(5),
          count,
        })),
    [submissionsByDay]
  );

  const counts = chartData.map((entry) => entry.count);
  const yMax = computeYAxisMax(counts);
  const showEmptyHint = !hasChartData(counts);

  return (
    <Stack spacing={1.5} sx={{ pb: 2 }}>
      <Typography variant="subtitle1" fontWeight={700}>
        Timesheet submissions by day
      </Typography>

      <Box
        sx={{
          width: "100%",
          minHeight: DASHBOARD_CHART_HEIGHT,
          position: "relative",
        }}
      >
        <BarChart
          height={DASHBOARD_CHART_HEIGHT}
          margin={verticalChartMargins}
          grid={{ horizontal: true }}
          xAxis={[
            {
              id: "date-axis",
              scaleType: "band",
              data: chartData.map((entry) => entry.label),
              label: "Date (MM-DD)",
              labelStyle: axisLabelStyle,
              tickLabelStyle: angledAxisTickLabelStyle,
            },
          ]}
          yAxis={[
            {
              id: "count-axis",
              label: "Submissions",
              min: 0,
              max: yMax,
              tickNumber: 6,
              labelStyle: axisLabelStyle,
              tickLabelStyle: axisTickLabelStyle,
            },
          ]}
          series={[
            {
              id: "timesheet-series",
              data: counts,
              label: "Timesheets received",
              color: theme.palette.primary.main,
            },
          ]}
          slotProps={dashboardLegendSlotProps}
          tooltip={{ trigger: "axis" }}
        />

        {showEmptyHint && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -20%)",
              pointerEvents: "none",
              bgcolor: "background.paper",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            No timesheets received in this period
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

export default TimesheetSubmissionsBarChart;
