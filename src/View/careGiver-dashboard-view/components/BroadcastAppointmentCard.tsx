import React, { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  IconButton,
  Button,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  useTheme,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { useAppDispatch } from "@slices/store";
import {
  AppointmentCareGiver,
  fetchSingleAppointment,
  updateCareGiverAcceptanceState,
} from "@slices/AppointmentSlice/appointment";
import dayjs from "dayjs";

interface BroadcastAppointmentCardProps {
  jobDetails: AppointmentCareGiver;
  setIsAppointmentAddModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const BroadcastAppointmentCard = ({
  jobDetails,
  setIsAppointmentAddModalVisible
}: BroadcastAppointmentCardProps) => {
  const [selectedAction, setSelectedAction] = useState("");
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const dispatch = useAppDispatch();
  const [assignID, setAssignID] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // Menu anchor element

  // Handle selector change
  const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    console.log("Selected:", event.target.value);
    setSelectedAction(event.target.value as string);
    setOpenDialog(true); // Open confirmation popup
    setAnchorEl(null); // Close the menu after selection
  };

  // Handle menu open and close
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // Open menu
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close menu
  };

  // Handle dialog close
  const handleCloseDialog = (confirm: boolean) => {
    if (confirm) {
      console.log(`Action confirmed: ${selectedAction}`);
    }
    setOpenDialog(false);
    setSelectedAction("");
  };

  const handleUpdateJobState = (state: string) => {
    console.log(`Updating job state to: ${state}  ${jobDetails}`);
    dispatch(updateCareGiverAcceptanceState({status: state,assignID:jobDetails?.jobAssignData?.assignID}));
    handleCloseDialog(false);
  };

  return (
    <Stack
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
        <EventIcon color="primary" sx={{ fontSize: { xs: 30, sm: 40 } }} />
        <Stack width={"90%"} border="2px solid green">
          <Typography
            variant="body1"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1rem", sm: "1.2rem", md: "15px" } }}
          >
            {jobDetails?.appointmentData?.title}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "13px" } }}
          >
            {`${dayjs(jobDetails?.appointmentData?.startDate).format(
              "MMM D, YYYY"
            )} at ${dayjs(
              jobDetails?.appointmentData?.startTime,
              "HH:mm"
            ).format("h:mm A")}`}
            -
            {`${dayjs(jobDetails?.appointmentData?.endDate).format(
              "MMM D, YYYY"
            )} at ${dayjs(jobDetails?.appointmentData?.endTime, "HH:mm").format(
              "h:mm A"
            )}`}
          </Typography>
        </Stack>
      </Stack>

      {/* Right Section: Buttons */}
      <Stack
        direction="row"
        border="2px solid pink"
        spacing={2}
        width={{ xs: "100%", sm: "100%", md: "20%", lg: "20%" }}
        justifyContent="space-between"
      >
        {/* View Button */}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {setIsAppointmentAddModalVisible(true),dispatch(fetchSingleAppointment(jobDetails?.appointmentData?.appointmentID))}}
          sx={{
            width: { xs: "100%", sm: "auto" },
            height: { xs: "40px", sm: "50px", md: "30px" },
            padding: { xs: "6px 12px", sm: "8px 16px" },
            fontSize: { xs: "0.8rem", sm: "0.9rem", md: "12px" },
          }}
        >
          View
        </Button>

        {/* Selector Button (initially showing as button) */}
        <Button
          variant="outlined"
          onClick={handleMenuClick}
          sx={{
            color: "white",
            height: { xs: "40px", sm: "50px", md: "30px" },
            backgroundColor: theme.palette.primary.main,
            width: { xs: "100%", sm: "auto" },
            padding: { xs: "6px 12px", sm: "8px 16px" },
            fontSize: { xs: "0.8rem", sm: "0.9rem", md: "12px" },
          }}
        >
          {selectedAction || "Actions"}
        </Button>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)} // Menu open state based on anchor element
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() =>
              handleSelectChange({ target: { value: "Accepted" } } as any)
            }
          >
            Accept
          </MenuItem>
          <MenuItem
            onClick={() =>
              handleSelectChange({ target: { value: "Rejected" } } as any)
            }
          >
            Reject
          </MenuItem>
        </Menu>
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => handleCloseDialog(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to <strong>{selectedAction}</strong> this
            appointment?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => handleUpdateJobState(selectedAction)}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default BroadcastAppointmentCard;
