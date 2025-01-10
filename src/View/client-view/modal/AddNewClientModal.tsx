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
} from "@mui/material";
import { CREATE_CLIENT_STEPS } from "../../../constants/index";
import AddClientForm from "../component/AddClientForm";
import { useAppSelector } from "../../../slices/store";
import { State } from "../../../types/types";
import { resetSubmitSate } from "../../../slices/clientSlice/client";

interface AddNewClientModalProps {
  isClientAddModalVisible: boolean;
  setIsClientAddModalVisible: (value: boolean) => void;
}

const AddNewClientModal = ({
  isClientAddModalVisible,
  setIsClientAddModalVisible,
}: AddNewClientModalProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const client = useAppSelector((state) => state.clients);

  useEffect(() => {
    if (client.submitState === State.success) {
      setIsClientAddModalVisible(false);
      resetSubmitSate();
      setLoading(false);
    }
    if (client.submitState === State.loading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [client.submitState]);

  // Handle next step
  const handleNext = () => {
    document.getElementById('client-form-next')?.click();
    // setActiveStep((prevStep) => prevStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle save (final step)
  const handleSave = async () => {
    document.getElementById("submit-btn")?.click();
  };

  return (
    <Modal
      title="Add New Client"
      width="80%"
      centered
      maskClosable={false}
      open={isClientAddModalVisible}
      onOk={() => setIsClientAddModalVisible(false)}
      onCancel={() => setIsClientAddModalVisible(false)}
      footer={
        <Box display="flex" justifyContent="end" width="100%">
          {/* Back Button */}
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>

          {/* Next or Save Button */}
          <Button
            sx={{ mx: 1 }}
            variant="contained"
            onClick={
              activeStep === CREATE_CLIENT_STEPS.length - 1
                ? handleSave
                : handleNext
            }
            disabled={loading} // Disable buttons during loading
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === CREATE_CLIENT_STEPS.length - 1 ? (
              "Save"
            ) : (
              "Next"
            )}
          </Button>
        </Box>
      }
    >
      <Stack width="100%">
        {/* Stepper */}
        <Stepper activeStep={activeStep}>
          {CREATE_CLIENT_STEPS.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Stack>

      <Box sx={{ mt: 2 }} width="100%">
        <AddClientForm activeStepper={activeStep} setActiveStepper={setActiveStep} key="client-form" />
      </Box>
    </Modal>
  );
};

export default AddNewClientModal;
