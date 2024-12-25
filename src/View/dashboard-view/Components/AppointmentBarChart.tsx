import React from "react";
import { BarChart } from "@mui/x-charts";
import { Typography, useTheme } from "@mui/material";

interface AppointmentChartProps {
  twoWeekAppointmentCount: Record<string, number>;
}

const AppointmentBarChart: React.FC<AppointmentChartProps> = ({ twoWeekAppointmentCount }) => {
  // Transform the data into a format suitable for the BarChart
  const theme = useTheme();
  const chartData = Object.entries(twoWeekAppointmentCount)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()) // Sort by date
    .map(([date, count]) => ({ date, count }));

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Typography variant="h6" align="center" style={{ fontSize: "12px" }}>
        Appointment Counts for Next 2 Weeks
      </Typography>
      <BarChart
        height={180}
        xAxis={[
          {
            id: "date-axis",
            scaleType: "band", // Set the x-axis type to "band" for bar chart compatibility
            data: chartData.map((entry) => entry.date), // Provide the x-axis categories
            label: "Dates",
          },
        ]}
        yAxis={[
          {
            id: "count-axis",
            label: "Appointments",
          },
        ]}
        series={[
          {
            id: "appointment-series",
            data: chartData.map((entry) => entry.count), // Map counts for the series
            label: "Appointments",
            color: theme?.palette?.primary?.main
          },
        ]}
        tooltip={{
          trigger: "item", // Tooltip to show detailed info
        }}
      />
    </div>
  );
};

export default AppointmentBarChart;
