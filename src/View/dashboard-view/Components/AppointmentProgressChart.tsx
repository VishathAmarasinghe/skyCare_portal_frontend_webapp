import { Typography, useTheme } from "@mui/material";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AppointmentProgressChartProps {
  todayTotalCount: number;
  todayCompletedCount: number;
}

const AppointmentProgressChart: React.FC<AppointmentProgressChartProps> = ({ todayTotalCount, todayCompletedCount }) => {
    const theme = useTheme();
  const completedPercentage = (todayCompletedCount / todayTotalCount) * 100;
  const pendingPercentage = 100 - completedPercentage;

  const data = [
    { name: "Completed", value: todayCompletedCount },
    { name: "Pending", value: todayTotalCount - todayCompletedCount },
  ];

  return (
    <div style={{ width: "100%",height:"120px", padding: "0px",marginBottom: "10px"  }}> {/* Reduced size */}
      <Typography variant="h6" align="center" style={{ fontSize: "12px" }}>
        Appointment Completion Progress
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="50%"
            outerRadius="80%"  // Adjust radius for smaller chart
            fill="#8884d8"
            label
          >
            <Cell key="cell1" fill="#4CAF50" />  {/* Completed */}
            <Cell key="cell2" fill={theme?.palette?.primary?.main} />  {/* Pending */}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
     
    </div>
  );
};

export default AppointmentProgressChart;
