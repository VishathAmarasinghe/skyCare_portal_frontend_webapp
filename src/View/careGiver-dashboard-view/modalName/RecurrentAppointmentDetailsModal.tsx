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
import { Modal } from "antd";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RepeatIcon from "@mui/icons-material/Repeat";
import {
  fetchRecurrentAppointmentDetails,
  PendingAppointments,
} from "../../../slices/appointmentSliceName/appointment";
import { useAppSelector } from "../../../slices/store";
import FileViewerWithModal from "../../../component/common/FileViewerWithModal";
import { FILE_DOWNLOAD_BASE_URL } from "../../../configName/config";

interface RecurrentAppointmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
}

const RecurrentAppointmentDetailsModal = ({
  open,
  onClose,
}: RecurrentAppointmentDetailsModalProps) => {
  const theme = useTheme();
  const appointmentSlice = useAppSelector((state) => state.appointments);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] =
    useState<PendingAppointments | null>(null);

  useEffect(() => {
    if (appointmentSlice?.selectedRecurrentAppointment) {
      setSelectedAppointmentDetails(
        appointmentSlice?.selectedRecurrentAppointment
      );
    }
  }, [appointmentSlice?.selectedRecurrentAppointment]);

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
              {selectedAppointmentDetails?.appointmentData?.title}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Type:{" "}
              {
                appointmentSlice?.appointmentTypes?.find(
                  (type) =>
                    type.appointmentTypeID ===
                    selectedAppointmentDetails?.appointmentData
                      ?.appointmentTypeID
                )?.name
              }
            </Typography>

            {/* Time Details */}
            <Stack direction="row" spacing={2} alignItems="center">
              <AccessTimeIcon color="primary" />
              <Typography>
                {`${selectedAppointmentDetails?.startDate} ${selectedAppointmentDetails?.startTime}`}{" "}
                -{" "}
                {`${selectedAppointmentDetails?.endDate} ${selectedAppointmentDetails?.endTime}`}
              </Typography>
            </Stack>

            {/* Address */}
            <Stack direction="row" spacing={2} alignItems="center">
              <LocationOnIcon color="primary" />
              <Typography>
                {`${selectedAppointmentDetails?.appointmentData?.appointmentAddress}, ${selectedAppointmentDetails?.appointmentData?.appointmentAddress?.city}, ${selectedAppointmentDetails?.appointmentData?.appointmentAddress?.state} - ${selectedAppointmentDetails?.appointmentData?.appointmentAddress?.postalCode}`}
              </Typography>
            </Stack>
            {/* Divider */}
            <Divider />

            {/* Additional Details */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Caregiver Count:
                </Typography>
                <Typography>
                  {selectedAppointmentDetails?.appointmentData?.caregiverCount}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Duration:
                </Typography>
                <Typography>
                  {selectedAppointmentDetails?.appointmentData?.duration} mins
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Comment:
                </Typography>
                <Typography>
                  {selectedAppointmentDetails?.appointmentData?.comment}
                </Typography>
              </Grid>
            </Grid>
          </Stack>

          {/* Attachments */}
          <Stack>
            <Typography variant="h6" fontWeight="bold" mt={3} gutterBottom>
              Attachments
            </Typography>
            <Grid container spacing={2}>
              {selectedAppointmentDetails?.appointmentData?.attachments.map(
                (attachment) => (
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
                      <Stack direction="row" spacing={1}>
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
                          onClick={() =>
                            handleDownloadFile(attachment.document)
                          }
                        >
                          Download
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid>
                )
              )}
            </Grid>
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

export default RecurrentAppointmentDetailsModal;
