import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Button,
  Menu,
  MenuItem,
  Box,
  useTheme,
  Chip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  fetchRecurrentAppointmentDetails,
  JobAssignCareGiverView,
  updateCareGiverAcceptanceState,
} from "../../../slices/appointmentSlice/appointment";
import { useAppDispatch } from "../../../slices/store";
import { useConfirmationModalContext } from "../../../context/DialogContext";
import { ConfirmationType } from "../../../types/types";

interface AllocationCardProps {
  jobAssignData: JobAssignCareGiverView;
  setIsRecurrentModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isRecurrentModalVisible: boolean;
  isShiftNoteModalVisible: boolean;
  setShiftNoteModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedRecurrentShiftModalForignValues: React.Dispatch<
    React.SetStateAction<{
      recurrentID: string | null;
      careGiverID: string | null;
    }>
  >;
}

const AllocationCard = ({
  jobAssignData,
  isRecurrentModalVisible,
  isShiftNoteModalVisible,
  setShiftNoteModalVisible,
  setIsRecurrentModalVisible,
  setSelectedRecurrentShiftModalForignValues,
  isEditMode,
  setIsEditMode,
}: AllocationCardProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { showConfirmation } = useConfirmationModalContext();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelectChange = (action: string) => {
    setAnchorEl(null);
  };

  const handleAcceptReject = (state: string) => {
    {
      dispatch(
        updateCareGiverAcceptanceState({
          status: state,
          assignID: jobAssignData?.assignJob.assignID,
        })
      );
    }
  };

  const {
    assignJob: { acceptanceType },
    recurrentAppointment: {
      recurrentAppointmentID,
      startDate,
      endDate,
      startTime,
      endTime,
      isCancelled
    },
    appointment: { appointmentID, title, appointmentAddress },
  } = jobAssignData;

  return (
    <Card
      sx={{
        marginX: 1,
        padding: 1,
        boxShadow: 2,
        backgroundColor: theme?.palette?.background?.default,
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          {/* Title Section */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {title}
            </Typography>
          </Grid>

          {/* Left Section: Appointment ID, Recurrent ID, and Address */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Appointment ID:</strong> {appointmentID}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <EventIcon
                    fontSize="small"
                    sx={{ verticalAlign: "middle", marginRight: 0.5 }}
                  />
                  <strong>Recurrent ID:</strong> {recurrentAppointmentID}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <LocationOnIcon
                    fontSize="small"
                    sx={{ verticalAlign: "middle", marginRight: 0.5 }}
                  />
                  <strong>Address:</strong> {appointmentAddress?.address},{" "}
                  {appointmentAddress?.city}
                </Typography>
              </Grid>
              {
                isCancelled && (
                  <Grid item xs={12}>
                    <Chip color="error" label="Appointment Cancelled"/>
                  </Grid>
                )
              }
            </Grid>
          </Grid>

          {/* Middle Section: Start and End Date with Time */}
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <AccessTimeIcon
                fontSize="small"
                sx={{ verticalAlign: "middle", marginRight: 0.5 }}
              />
              <strong>Start:</strong> {startDate} {startTime}
            </Typography>
            <Typography variant="body1">
              <AccessTimeIcon
                fontSize="small"
                sx={{ verticalAlign: "middle", marginRight: 0.5 }}
              />
              <strong>End:</strong> {endDate} {endTime}
            </Typography>
          </Grid>

          {/* Right Section: Actions */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-start",
            }}
          >
            <CardActions
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              {acceptanceType === "Allocated" && !isCancelled && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleMenuOpen}
                >
                  Update Acceptance
                </Button>
              )}
              {acceptanceType === "Accepted" && !isCancelled && (
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={() => {
                    setShiftNoteModalVisible(true);
                    setIsEditMode(true);
                    setSelectedRecurrentShiftModalForignValues({
                      recurrentID: recurrentAppointmentID,
                      careGiverID: jobAssignData?.assignJob?.careGiverID,
                    });
                  }}
                >
                  Submit Time Sheet
                </Button>
              )}

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() =>
                    showConfirmation(
                      "Accept Appointment",
                      "Are you sure you want to Accept this Appointment? This action cannot be undone.",
                      "accept" as ConfirmationType,
                      () => handleAcceptReject("Accepted"),
                      "Accept Now",
                      "Cancel"
                    )
                  }
                >
                  Accept
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    showConfirmation(
                      "Reject Appointment",
                      "Are you sure you want to Reject this Appointment? This action cannot be undone.",
                      "accept" as ConfirmationType,
                      () => handleAcceptReject("Rejected"),
                      "Reject Now",
                      "Cancel"
                    )
                  }
                >
                  Reject
                </MenuItem>
              </Menu>

              <Button
                variant="contained"
                fullWidth
                size="small"
                color="secondary"
                onClick={() => {
                  dispatch(
                    fetchRecurrentAppointmentDetails({
                      recurrentAppointmentID: recurrentAppointmentID,
                    })
                  );
                  setIsRecurrentModalVisible(true);
                }}
              >
                View Details
              </Button>
            </CardActions>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AllocationCard;
