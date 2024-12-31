import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Stack,
  Grid,
  Divider,
  IconButton,
  Paper,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RepeatIcon from "@mui/icons-material/Repeat";
import { Modal } from "antd"; // Ant Design Modal
import { useAppSelector } from "../../../slices/store";
import {
  Appointment,
  AppointmentCareGiver,
} from "../../../slices/appointmentSlice/appointment";
import FileViewerWithModal from "../../../component/common/FileViewerWithModal";
import { FILE_DOWNLOAD_BASE_URL } from "../../../config/config";
import RecurrenceCard from "../components/RecurrentCard";

export interface AppointmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const appointmentSlice = useAppSelector((state) => state.appointments);
  const [
    selectedCareGiverRecurrentDetails,
    setSelectedCareGiverRecurrentDetails,
  ] = useState<AppointmentCareGiver | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment>({
    appointmentID: "",
    title: "",
    appointmentTypeID: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    appointmentAddress: {
      appointmentAddressID: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
    },
    caregiverCount: 0,
    duration: 0,
    comment: "",
    broadcastType: "",
    carePlanID: "",
    clientID: "",
    jobAssigns: {
      careGiverIDs: [],
      taskID: "",
      appointmentID: "",
      assignType: "",
      assigner: "",
    },
    taskID: "",
    attachments: [],
    recurrentWork: {
      recurrentWorkID: "",
      appointmentID: "",
      taskID: "",
      frequencyCount: 0,
      startDate: "",
      endDate: "",
      recurrenceType: "",
      day: "",
      occurrenceLimit: 0,
    },
    recurrenceState: false,
  });
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  useEffect(() => {
    if (appointmentSlice.selectedAppointment !== null) {
      setSelectedAppointment(appointmentSlice.selectedAppointment);
      const data = appointmentSlice?.careGvierAppointments?.find(
        (item) =>
          item.appointmentData?.appointmentID ===
          appointmentSlice.selectedAppointment?.appointmentID
      );
      if (data) {
        setSelectedCareGiverRecurrentDetails(data);
      }
    }
  }, [appointmentSlice.state, appointmentSlice.selectedAppointment]);

  const handleViewFile = (file: string) => {
    setCurrentFile(file);
    setFileViewerOpen(true);
  };

  const handleDownloadFile = (file: string) => {
    const encodedFilePath = encodeURIComponent(file);
    const fileUrl = `${FILE_DOWNLOAD_BASE_URL}${encodedFilePath}`;
    window.open(fileUrl, "_blank");
  };

  const handleCloseFileViewer = () => {
    setFileViewerOpen(false);
    setCurrentFile(null);
  };

  return (
    <>
      {/* Ant Design Modal */}
      <Modal
        title={
          <Typography variant="h6" component="div">
            Appointment Details
          </Typography>
        }
        open={open}
        onCancel={onClose}
        footer={
          // <Button onClick={onClose} variant="contained" color="primary">
          //   Close
          // </Button>
          <></>
        }
        closeIcon={<CloseIcon />}
        width="800px"
      >
        {/* Modal Content */}
        <Stack spacing={2}>
          {/* Title and Appointment Type */}
          <Stack
            spacing={2}
            sx={{
              backgroundColor: theme.palette.background.default,
              padding: 2,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {selectedAppointment.title}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Type:{" "}
              {
                appointmentSlice?.appointmentTypes?.find(
                  (type) =>
                    type.appointmentTypeID ===
                    selectedAppointment.appointmentTypeID
                )?.name
              }
            </Typography>

            {/* Time Details */}
            <Stack direction="row" spacing={2} alignItems="center">
              <AccessTimeIcon color="primary" />
              <Typography>
                {`${selectedAppointment.startDate} ${selectedAppointment.startTime}`}{" "}
                -{" "}
                {`${selectedAppointment.endDate} ${selectedAppointment.endTime}`}
              </Typography>
            </Stack>

            {/* Address */}
            <Stack direction="row" spacing={2} alignItems="center">
              <LocationOnIcon color="primary" />
              <Typography>
                {`${selectedAppointment.appointmentAddress.address}, ${selectedAppointment.appointmentAddress.city}, ${selectedAppointment.appointmentAddress.state} - ${selectedAppointment.appointmentAddress.postalCode}`}
              </Typography>
            </Stack>

            {/* Recurrence Info */}
            {selectedAppointment.recurrenceState && (
              <Stack direction="row" spacing={2} alignItems="center">
                <RepeatIcon color="primary" />
                <Typography>
                  Recurring from {selectedAppointment.recurrentWork.startDate}{" "}
                  to {selectedAppointment.recurrentWork.endDate} (
                  {selectedAppointment.recurrentWork.recurrenceType})
                </Typography>
              </Stack>
            )}

            {/* Divider */}
            <Divider />

            {/* Additional Details */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Caregiver Count:
                </Typography>
                <Typography>{selectedAppointment.caregiverCount}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Duration:
                </Typography>
                <Typography>{selectedAppointment.duration} mins</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Comment:
                </Typography>
                <Typography>{selectedAppointment.comment}</Typography>
              </Grid>
            </Grid>
          </Stack>

          {/* Attachments */}
          <Stack>
            <Typography variant="h6" fontWeight="bold" mt={3} gutterBottom>
              Attachments
            </Typography>
            <Grid container spacing={2}>
              {selectedAppointment.attachments.map((attachment) => (
                <Grid item xs={12} sm={6} key={attachment.documentID}>
                  <Paper
                    elevation={2}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 2,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <DescriptionIcon color="primary" />
                      <Typography
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "150px",
                          display: "inline-block",
                        }}
                        title={attachment.documentID} // Tooltip to show the full document ID on hover
                      >
                        {attachment.documentID}
                      </Typography>
                    </Stack>
                    <Stack direction="column" spacing={1}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleViewFile(attachment.document)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleDownloadFile(attachment.document)}
                      >
                        Download
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Stack>
          <Stack width="100%">
            {selectedCareGiverRecurrentDetails?.allocations?.map(
              (allocation) => (
                <RecurrenceCard {...allocation} />
              )
            )}
          </Stack>
        </Stack>
      </Modal>

      {/* File Viewer Modal */}
      {currentFile && (
        <FileViewerWithModal
          file={currentFile}
          isVisible={fileViewerOpen}
          onClose={handleCloseFileViewer}
        />
      )}
    </>
  );
};

export default AppointmentDetailsModal;
