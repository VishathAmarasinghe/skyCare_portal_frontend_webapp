import React from "react";
import EventIcon from "@mui/icons-material/Event";
import {
  fetchRecurrentAppointmentDetails,
  PendingAppointments,
} from "../../../slices/appointmentSlice/appointment";
import { Stack, Typography, Button, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { useAppDispatch } from "@slices/store";

interface pendingCardProps {
  jobDetails: PendingAppointments;
  isModalVisible: boolean;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
const PendingCard = ({
  jobDetails,
  isModalVisible,
  setIsModalVisible,
}: pendingCardProps) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  return (
    <Stack
      onClick={() => {
        dispatch(
          fetchRecurrentAppointmentDetails({
            recurrentAppointmentID: jobDetails?.recurrentAppointmentID,
          })
        );
        setIsModalVisible(true);
      }}
      direction={{ xs: "column", sm: "row" }}
      alignItems="center"
      justifyContent="space-between"
      padding={1}
      border="1px solid #ddd"
      borderRadius={2}
      bgcolor="white"
      spacing={2}
      sx={{
        backgroundColor: theme.palette.background.default,
        width: "98%",
        margin: "auto",
        marginY: 0.5,
      }}
    >
      {/* Left Section: Icon and Appointment Details */}
      <Stack direction="row" alignItems="center" spacing={2} width="100%">
        <EventIcon
          color="primary"
          sx={{ fontSize: { xs: 30, sm: 30, md: 20 } }}
        />
        <Stack width={"90%"}>
          <Typography
            variant="body1"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1rem", sm: "1.2rem", md: "12px" } }}
          >
            {jobDetails?.appointmentData?.title}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "11px" } }}
          >
            {`${dayjs(jobDetails?.startDate).format("MMM D, YYYY")} at ${dayjs(
              jobDetails?.startTime,
              "HH:mm"
            ).format("h:mm A")}`}
            -
            {`${dayjs(jobDetails?.endDate).format("MMM D, YYYY")} at ${dayjs(
              jobDetails?.endTime,
              "HH:mm"
            ).format("h:mm A")}`}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default PendingCard;
