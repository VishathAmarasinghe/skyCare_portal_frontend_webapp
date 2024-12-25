import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import {
  Box,
  Button,
  Stack,
  Step,
  StepLabel,
  Stepper,
  CircularProgress,
  Typography,
  FormControlLabel,
  Switch,
  Grid,
  CardContent,
  IconButton,
  Card,
} from "@mui/material";
import {
  CREATE_APPOINTMENT_STEPS,
  CREATE_CARE_PLAN_STEPS,
} from "../../../constants/index";
import AppointmentForm from "../component/AppointmentForm";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  fetchAppointmentTypes,
  fetchJobAssignmentTable,
  RecurrentAppointmentValues,
  resetSelectedAppointment,
} from "@slices/appointmentSlice/appointment";
import { fetchClients } from "@slices/clientSlice/client";
import { fetchAllCarePlans } from "@slices/carePlanSlice/carePlan";
import { fetchCareGivers } from "@slices/careGiverSlice/careGiver";
import JobAssignerTable from "../component/JobAssignerTable";
import InfoIcon from "@mui/icons-material/Info";
import InfoCard from "../component/InfoCard";

interface AddNewAppointmentModalProps {
  isAppointmentAddModalVisible: boolean;
  setIsAppointmentAddModalVisible: (value: boolean) => void;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddNewAppointmentModal = ({
  isAppointmentAddModalVisible: isAddAppointmentModalVisible,
  setIsAppointmentAddModalVisible: setIsAppointmentModalVisible,
  isEditMode,
  setIsEditMode,
}: AddNewAppointmentModalProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const appointmentSlice = useAppSelector((state) => state.appointments);
  const clientSlice = useAppSelector((state) => state.clients);
  const [selectedRecurrentAppointment, setSelectedRecurrentAppointment] =
    useState<RecurrentAppointmentValues | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAddAppointmentModalVisible) {
      dispatch(resetSelectedAppointment());
      setActiveStep(0);
    } else {
      dispatch(fetchAppointmentTypes());
      dispatch(fetchClients());
      dispatch(fetchAllCarePlans());
      dispatch(fetchCareGivers());
    }
  }, [isAddAppointmentModalVisible]);

  useEffect(() => {
    if (appointmentSlice?.selectedAppointment) {
      dispatch(
        fetchJobAssignmentTable({
          appointmentID: appointmentSlice.selectedAppointment.appointmentID,
        })
      );
    }
  }, [
    appointmentSlice?.selectedAppointment,
    appointmentSlice?.deleteState,
    appointmentSlice?.updateState,
    appointmentSlice?.submitState,
  ]);

  // Handle next step
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle save (final step)
  const handleSave = async () => {
    document.getElementById("carePlan-submit-btn")?.click();
  };

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditMode(event.target.checked);
  };

  return (
    <Modal
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {appointmentSlice?.selectedAppointment
              ? "Update Appointment"
              : "Add New Appointment"}
          </Typography>
          {appointmentSlice?.selectedAppointment != null && (
            <FormControlLabel
              control={
                <Switch
                  checked={isEditMode}
                  onChange={handleToggleChange}
                  color="primary"
                />
              }
              label={isEditMode ? "Edit Mode On" : "Edit Mode Off"}
              labelPlacement="start"
            />
          )}
        </Box>
      }
      width={appointmentSlice?.selectedAppointment != null ? "100%" : "80%"}
      centered
      maskClosable={false}
      closable={false}
      open={isAddAppointmentModalVisible}
      onOk={() => {
        setIsAppointmentModalVisible(false);
      }}
      onCancel={() => {
        setIsAppointmentModalVisible(false),
          dispatch(resetSelectedAppointment());
      }}
      footer={
        <Box display="flex" justifyContent="end" width="100%">
          {/* Back Button */}
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => {
              setIsAppointmentModalVisible(false),
                dispatch(resetSelectedAppointment());
            }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || selectedRecurrentAppointment !== null}
            sx={{
              display:
                activeStep === 0 ||
                appointmentSlice?.selectedAppointment != null
                  ? "none"
                  : "block",
            }}
          >
            Back
          </Button>

          {/* Next or Save Button */}
          <Button
            sx={{
              mx: 1,
              display:
                appointmentSlice?.selectedAppointment == null
                  ? "block"
                  : "none",
            }}
            variant="contained"
            onClick={
              activeStep === CREATE_APPOINTMENT_STEPS.length - 1
                ? handleSave
                : handleNext
            }
            disabled={
              loading ||
              selectedRecurrentAppointment !== null ||
              (activeStep === CREATE_APPOINTMENT_STEPS.length - 1 &&
                !isEditMode)
                ? true
                : false
            }
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === CREATE_APPOINTMENT_STEPS.length - 1 ? (
              "Save"
            ) : (
              "Next"
            )}
          </Button>
        </Box>
      }
    >
      <Grid container spacing={2} sx={{ height: "80vh" }}>
        {/* Left side: AppointmentForm */}
        <Grid
          item
          xs={appointmentSlice?.selectedAppointment ? 6 : 12}
          sx={{ overflowY: "auto", padding: 2 }}
        >
          <Stack width="100%" mb={4}>
            {/* Stepper */}
            <Stepper activeStep={activeStep}>
              {CREATE_APPOINTMENT_STEPS.map((label, index) => (
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Stack>
          <Stack width={"100%"}>
            <AppointmentForm
              selectedRecurrentAppointment={selectedRecurrentAppointment}
              activeStep={activeStep}
              isEditMode={isEditMode}
            />
            <Stack width={"100%"} justifyContent="flex-end" flexDirection="row">
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={
                  activeStep === 0 || selectedRecurrentAppointment !== null
                }
                sx={{
                  display:
                    activeStep === 0 ||
                    appointmentSlice?.selectedAppointment == null
                      ? "none"
                      : "block",
                }}
              >
                Back
              </Button>

              {/* Next or Save Button */}
              <Button
                sx={{
                  mx: 1,
                  display:
                    selectedRecurrentAppointment == null &&
                    appointmentSlice?.selectedAppointment != null
                      ? "block"
                      : "none",
                }}
                variant="contained"
                onClick={
                  activeStep === CREATE_APPOINTMENT_STEPS.length - 1
                    ? handleSave
                    : handleNext
                }
                disabled={
                  loading ||
                  selectedRecurrentAppointment !== null ||
                  (activeStep === CREATE_APPOINTMENT_STEPS.length - 1 &&
                    !isEditMode)
                    ? true
                    : false
                }
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : activeStep === CREATE_APPOINTMENT_STEPS.length - 1 ? (
                  "Save"
                ) : (
                  "Next"
                )}
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  display:
                    selectedRecurrentAppointment == null ? "none" : "block",
                }}
              >
                Update Appointment
              </Button>
            </Stack>
            <Stack>
              {appointmentSlice?.selectedAppointment && <InfoCard />}
            </Stack>
          </Stack>
        </Grid>

        {/* Right side: JobAssignerTable */}
        {appointmentSlice?.selectedAppointment && (
          <Grid item xs={6}>
            <JobAssignerTable
              setSelectedRecurrentAppointment={setSelectedRecurrentAppointment}
            />
          </Grid>
        )}
      </Grid>
    </Modal>
  );
};

export default AddNewAppointmentModal;
