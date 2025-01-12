import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Typography } from "@mui/material";
import { AppointmentType } from "@slices/appointmentSlice/appointment";
import { useAppSelector } from "@slices/store";

interface AppointmentTypePieChartProps {
  appointmentCountByType: Record<string, number>;
}

const AppointmentTypePieChart: React.FC<AppointmentTypePieChartProps> = ({
  appointmentCountByType,
}) => {
  // Prepare data for the appointment type pie chart
  const appointmentSlice = useAppSelector((state) => state.appointments);
  const [appointmentTypes,setAppointmentTypes] = useState<AppointmentType[]>([]);
  const appointmentTypeData = Object.keys(appointmentCountByType).map(
    (type) => ({
      name: type,
      value: appointmentCountByType[type],
    })
  );

  useEffect(() => {
    setAppointmentTypes(appointmentSlice.appointmentTypes);
  }, [appointmentSlice?.appointmentTypes]);

  return (
    <div
      style={{
        width: "100%",
        height: "110px",
        padding: "0px",
        marginBottom: "0px",
      }}
    >
      <Typography variant="h6" fontWeight={"bold"}>
        Appointment Count(By Type)
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
                fill={appointmentTypes?.find((app)=>app?.name==entry.name)?.color} // Alternate colors
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend align="left" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AppointmentTypePieChart;
