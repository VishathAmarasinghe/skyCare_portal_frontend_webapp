import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Button, Chip, Stack, Grid } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { updateShiftNotesPaymentStatus } from "@slices/shiftNoteSlice/shiftNote";
import { useConfirmationModalContext } from "@context/DialogContext";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";


interface TimeSheetCardProps {
  appointment: any;
}

const ClientPendingAppointmentCard = ({ appointment }: TimeSheetCardProps) => {
  const { showConfirmation } = useConfirmationModalContext();
  const dispatch = useAppDispatch();

  return (
    <Card sx={{ width: "100%", mb: 2, boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            Appointment #{appointment.recurrentAppointmentID}
          </Typography>
        </Stack>
        <Stack spacing={1} mt={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonIcon color="primary" />
            <Typography variant="body1">{appointment.employeeName || "N/A"}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EventIcon color="primary" />
            <Typography variant="body2">
              {appointment.startDate} - {appointment.endDate}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTimeIcon color="primary" />
            <Typography variant="body2">
              {appointment.startTime} - {appointment.endTime}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
};

interface TimeSheetTableProps {
}

const ClientPendingAppointmentCardList = ({ }: TimeSheetTableProps) => {
  const [rows, setRows] = useState<any[]>([]);
  const appointmentSlice = useAppSelector((state) => state?.appointments);
  
    useEffect(() => {
      // Mapping and transforming the data before setting the rows state
      const mappedRows = appointmentSlice?.PendingAppointmentsToClient?.map((appointment) => ({
        employeeName: appointment?.careGiverNames?.map((careGiver) => careGiver).join(", ") || "N/A",
        startDate: appointment.startDate || "",
        startTime: appointment.startTime || "",
        endDate: appointment.endDate || "",
        endTime: appointment?.endTime || "",
        recurrentAppointmentID:
          appointment?.recurrentAppointmentID || "N/A",
      }));
      
      setRows(mappedRows || []);
    }, [appointmentSlice?.PendingAppointmentsToClient,appointmentSlice?.state]);

  return (
    <Stack sx={{ width: "100%", padding: 2 }}>
      {rows.map((appointment, index) => (
        <Box key={index} sx={{ marginBottom: 2 }}>
        <ClientPendingAppointmentCard key={index} appointment={appointment} />
        </Box>
      ))}
      {
        rows.length === 0 && (
          <Typography variant="h6" color="textSecondary">
            No time sheets found
          </Typography>
        )
      }
    </Stack>
  );
};

export default ClientPendingAppointmentCardList;
