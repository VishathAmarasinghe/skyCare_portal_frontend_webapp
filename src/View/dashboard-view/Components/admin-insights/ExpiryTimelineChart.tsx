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

interface ExpiryTimelineChartProps {
  expiryTimelineByWeek: Record<string, number>;
}

const ExpiryTimelineChart: React.FC<ExpiryTimelineChartProps> = ({
  expiryTimelineByWeek,
}) => {
  const theme = useTheme();

  const chartData = useMemo(
    () =>
      Object.entries(expiryTimelineByWeek)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekStart, count]) => ({
          label: weekStart.slice(5),
          count,
        })),
    [expiryTimelineByWeek]
  );

  const counts = chartData.map((entry) => entry.count);
  const yMax = computeYAxisMax(counts);
  const showEmptyHint = !hasChartData(counts);

  return (
    <Stack spacing={1.5} sx={{ height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={700}>
        Document expiries — next 90 days (by week)
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
              id: "week-axis",
              scaleType: "band",
              data: chartData.map((entry) => entry.label),
              label: "Week starting (MM-DD)",
              labelStyle: axisLabelStyle,
              tickLabelStyle: angledAxisTickLabelStyle,
            },
          ]}
          yAxis={[
            {
              id: "count-axis",
              label: "Documents",
              min: 0,
              max: yMax,
              tickNumber: 6,
              labelStyle: axisLabelStyle,
              tickLabelStyle: axisTickLabelStyle,
            },
          ]}
          series={[
            {
              id: "expiry-series",
              data: counts,
              label: "Expiring",
              color: theme.palette.warning.main,
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
            No upcoming expiries in the next 90 days
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

export default ExpiryTimelineChart;
