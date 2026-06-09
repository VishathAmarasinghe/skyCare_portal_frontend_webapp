import React, { useMemo } from "react";
import { BarChart } from "@mui/x-charts";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import {
  DASHBOARD_CHART_HEIGHT,
  axisLabelStyle,
  axisTickLabelStyle,
  computeYAxisMax,
  dashboardLegendSlotProps,
  horizontalChartMargins,
} from "./dashboardChartStyles";

interface ExpiringByTypeChartProps {
  expiringByDocumentType: Record<string, number>;
}

const ExpiringByTypeChart: React.FC<ExpiringByTypeChartProps> = ({
  expiringByDocumentType,
}) => {
  const theme = useTheme();

  const chartData = useMemo(
    () =>
      Object.entries(expiringByDocumentType)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([type, count]) => ({ type, count })),
    [expiringByDocumentType]
  );

  const counts = chartData.map((entry) => entry.count);
  const xMax = computeYAxisMax(counts);
  const chartHeight = Math.max(DASHBOARD_CHART_HEIGHT, chartData.length * 44 + 120);

  if (chartData.length === 0) {
    return (
      <Stack
        height="100%"
        minHeight={DASHBOARD_CHART_HEIGHT}
        justifyContent="center"
        spacing={1}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Expiring within 30 days by document type
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No documents expiring in the next 30 days.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={700}>
        Expiring within 30 days by document type
      </Typography>

      <Box sx={{ width: "100%", minHeight: chartHeight }}>
        <BarChart
          height={chartHeight}
          layout="horizontal"
          margin={horizontalChartMargins}
          grid={{ vertical: true }}
          yAxis={[
            {
              id: "type-axis",
              scaleType: "band",
              data: chartData.map((entry) => entry.type),
              tickLabelStyle: {
                ...axisTickLabelStyle,
                fontSize: 11,
              },
            },
          ]}
          xAxis={[
            {
              id: "count-axis",
              label: "Documents",
              min: 0,
              max: xMax,
              tickNumber: 6,
              labelStyle: axisLabelStyle,
              tickLabelStyle: axisTickLabelStyle,
            },
          ]}
          series={[
            {
              id: "type-series",
              data: counts,
              label: "Expiring",
              color: theme.palette.error.light,
            },
          ]}
          slotProps={dashboardLegendSlotProps}
          tooltip={{ trigger: "axis" }}
        />
      </Box>
    </Stack>
  );
};

export default ExpiringByTypeChart;
