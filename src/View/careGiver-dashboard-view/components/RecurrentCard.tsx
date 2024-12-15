import React, { useState } from "react";
import {
  Stack,
  Typography,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Chip,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import dayjs from "dayjs";
import { useAppDispatch } from "../../../slices/store";
import {
  JobAssigner,
  updateCareGiverAcceptanceState,
} from "../../../slices/AppointmentSlice/appointment";

const RecurrentCard = ({
  jobAssignData,
  pendingRequired,
  recurrentAppointmentData,
  totalRequired,
}: JobAssigner) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [selectedAction, setSelectedAction] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Handle menu open and close
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // Open menu
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close menu
  };

  // Handle selection change
  const handleSelectChange = (action: string) => {
    setSelectedAction(action);
    setOpenDialog(true); // Open confirmation dialog
    setAnchorEl(null); // Close menu
  };

  // Handle dialog close
  const handleCloseDialog = (confirm: boolean) => {
    if (confirm) {
      console.log(`Action confirmed: ${selectedAction}`);
      dispatch(
        updateCareGiverAcceptanceState({
          status: selectedAction,
          assignID: jobAssignData?.assignID,
        })
      );
    }
    setOpenDialog(false);
    setSelectedAction("");
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
      {/* Left Section: Icon and Details */}
      <Stack direction="row" alignItems="center" spacing={2} width="100%">
        <EventIcon color="primary" sx={{ fontSize: { xs: 20, sm: 30 } }} />
        <Stack width={"90%"}>
          <Typography
            variant="body1"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1rem", sm: "1.2rem", md: "13px" } }}
          >
            ID: {recurrentAppointmentData?.recurrentWorkID}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "13px" } }}
          >
            Start: {`${dayjs(recurrentAppointmentData?.startDate).format("MMM D, YYYY")} at ${dayjs(
              recurrentAppointmentData?.startTime,
              "HH:mm"
            ).format("h:mm A")}`}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "13px" } }}
          >
            End: {`${dayjs(recurrentAppointmentData?.endDate).format("MMM D, YYYY")} at ${dayjs(
              recurrentAppointmentData?.endTime,
              "HH:mm"
            ).format("h:mm A")}`}
          </Typography>

          {/* Status and Chips */}
          <Stack direction="row" spacing={1} marginTop={1}>
            <Chip
            size="small"
              label={`Status: ${recurrentAppointmentData?.status}`}
              color={recurrentAppointmentData?.status === "cancelled" ? "error" : "success"}
            />
            <Chip size="small" label={`Total Required: ${totalRequired}`} color="primary" />
            <Chip size="small" label={`Pending: ${pendingRequired}`} color="secondary" />
          </Stack>
        </Stack>
      </Stack>

      {/* Right Section: Actions */}
      <Stack direction="row" spacing={2} width={{ xs: "100%", sm: "auto" }}>
        <Button
          variant="outlined"
          onClick={handleMenuClick}
          disabled={recurrentAppointmentData?.status === "cancelled"}
          sx={{
            color: "white",
            backgroundColor: theme.palette.primary.main,
            width: { xs: "100%", sm: "auto" },
            padding: { xs: "6px 12px", sm: "8px 15px" },
            fontSize: { xs: "0.8rem", sm: "0.9rem", md: "11px" },
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
          <MenuItem onClick={() => handleSelectChange("Accepted")}>
            Accept
          </MenuItem>
          <MenuItem onClick={() => handleSelectChange("Rejected")}>
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
            onClick={() => handleCloseDialog(true)}
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

export default RecurrentCard;
