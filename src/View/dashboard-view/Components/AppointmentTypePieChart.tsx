import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Typography } from "@mui/material";

interface AppointmentTypePieChartProps {
  appointmentCountByType: Record<string, number>;
}

const AppointmentTypePieChart: React.FC<AppointmentTypePieChartProps> = ({
  appointmentCountByType,
}) => {
  // Prepare data for the appointment type pie chart
  const appointmentTypeData = Object.keys(appointmentCountByType).map(
    (type) => ({
      name: type,
      value: appointmentCountByType[type],
    })
  );

  return (
    <div
      style={{
        width: "100%",
        height: "120px",
        padding: "0px",
        marginBottom: "0px",
      }}
    >
      <Typography variant="h6" fontWeight={"bold"}>
        Appointment Types
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={appointmentTypeData}
            dataKey="value"
            nameKey="name"
            innerRadius="50%"
            outerRadius="80%"
            fill="#8884d8"
            label
          >
            {appointmentTypeData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index % 2 === 0 ? "#4CAF50" : "#FFC107"} // Alternate colors
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AppointmentTypePieChart;
