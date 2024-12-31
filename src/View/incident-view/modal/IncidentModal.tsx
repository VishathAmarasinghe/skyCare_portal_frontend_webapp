import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Typography,
  FormControlLabel,
  Switch,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  fetchAllIncidentActionTypeQuestions,
  fetchAllIncidentStatus,
  fetchAllIncidentTypes,
  resetSelectedIncident,
} from "../../../slices/incidentSlice/incident";
import { CREATE_INCIDENT_STEPS } from "../../../constants/index";
import { Modal } from "antd";
import IncidentForm from "../components/IncidentForm";
import { State } from "../../../types/types";
import { APPLICATION_CARE_GIVER } from "@config/config";
import { fetchClients, fetchClientsAssociatedToCareGiver } from "@slices/clientSlice/client";

interface IncidentModalProps {
  isIncidentModalVisible: boolean;
  setIsIncidentModalVisible: (value: boolean) => void;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const IncidentModal = ({
  isIncidentModalVisible,
  setIsIncidentModalVisible,
  isEditMode,
  setIsEditMode,
}: IncidentModalProps) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const incidentSlice = useAppSelector((state) => state.incident);
  const [selectedIncidentDetails, setSelectedIncidentDetails] = useState<
    any | null
  >(null);
  const dispatch = useAppDispatch();
  const authDate = useAppSelector((state)=>state?.auth);


  useEffect(()=>{
    if (isIncidentModalVisible) {
      if (authDate?.roles?.includes(APPLICATION_CARE_GIVER)) {
        if (authDate?.userInfo?.userID) {
          dispatch(fetchClientsAssociatedToCareGiver(authDate.userInfo.userID));
        }else{
          dispatch(fetchClients());
        }
      }
    }
  },[authDate,isIncidentModalVisible])



  useEffect(() => {
    if (!isIncidentModalVisible) {
      dispatch(resetSelectedIncident());
      setActiveStep(0);
    } else {
      dispatch(fetchAllIncidentTypes());
      dispatch(fetchAllIncidentActionTypeQuestions());
      dispatch(fetchAllIncidentStatus());
    }
  }, [isIncidentModalVisible]);

  useEffect(() => {
    if (incidentSlice?.submitState === State?.success) {
      setIsIncidentModalVisible(false);
      dispatch(resetSelectedIncident());
    }
  }, [incidentSlice?.submitState, incidentSlice?.updateState]);

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
    document.getElementById("incident-submit-btn")?.click();
  };

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditMode(event.target.checked);
  };

  return (
    <Modal
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {incidentSlice?.selectedIncident
              ? "Update Incident"
              : "Add New Incident"}
          </Typography>
          {incidentSlice?.selectedIncident != null && (
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
      width={isMobile ? "100%" : "80%"}
      centered
      maskClosable={false}
      closable={false}
      open={isIncidentModalVisible}
      onOk={() => setIsIncidentModalVisible(false)}
      onCancel={() => {
        setIsIncidentModalVisible(false);
        dispatch(resetSelectedIncident());
      }}
      footer={
        <Box display="flex" justifyContent="end" width="100%">
          {/* Cancel Button */}
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => {
              setIsIncidentModalVisible(false);
              dispatch(resetSelectedIncident());
            }}
          >
            Cancel
          </Button>

          {/* Back Button */}
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{ display: activeStep === 0 ? "none" : "block", mr: 1 }}
          >
            Back
          </Button>

          {/* Next or Save Button */}
          <Button
            variant="contained"
            onClick={
              activeStep === CREATE_INCIDENT_STEPS.length - 1
                ? handleSave
                : handleNext
            }
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === CREATE_INCIDENT_STEPS.length - 1 ? (
              "Save"
            ) : (
              "Next"
            )}
          </Button>
        </Box>
      }
    >
      <Stack>
        {!isMobile && (
          <Stack width="100%">
            {/* Stepper */}
            <Stepper activeStep={activeStep}>
              {CREATE_INCIDENT_STEPS.map((label, index) => (
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Stack>
        )}

        <Box sx={{ mt: 2 }} width="100%">
          <IncidentForm
            activeStep={activeStep}
            isEditMode={isEditMode}
            key={"incident form"}
          />
        </Box>
      </Stack>
    </Modal>
  );
};

export default IncidentModal;
