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
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { State } from "../../../types/types";
import { resetSubmitSate, updateActivationStatus } from "../../../slices/clientSlice/client";
import { APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN } from "@config/config";

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
  const authRole = useAppSelector((state) => state?.auth?.roles);
  const dispatch = useAppDispatch();
  const [activationStatus, setActivationStatus] = useState<
    "Activated" | "Deactivated"
  >(client?.selectedClient?.status || "Deactivated");

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
    document.getElementById("client-form-next")?.click();
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

  const handleStatusChange = (status: "Activated" | "Deactivated") => {
    setActivationStatus(status);
    if (client?.selectedClient?.clientID) {
      dispatch(updateActivationStatus({ clientID: client.selectedClient.clientID, status: status }));
    }
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

          {client?.selectedClient &&
            (authRole?.includes(APPLICATION_ADMIN) ||
              authRole?.includes(APPLICATION_SUPER_ADMIN)) && (
              <Button
                variant="outlined"
                sx={{ mx: 1 }}
                color={activationStatus === "Activated" ? "success" : "error"}
                onClick={() =>
                  handleStatusChange(
                    activationStatus === "Activated"
                      ? "Deactivated"
                      : activationStatus === "Deactivated"
                      ? "Activated"
                      : "Deactivated"
                  )
                }
              >
                {activationStatus == "Activated"
                  ? "Deactivate"
                  : activationStatus === "Deactivated"
                  ? "Activate"
                  : "Pending"}
              </Button>
            )}

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
        <AddClientForm
          status={activationStatus}
          activeStepper={activeStep}
          setActiveStepper={setActiveStep}
          key="client-form"
        />
      </Box>
    </Modal>
  );
};

export default AddNewClientModal;
