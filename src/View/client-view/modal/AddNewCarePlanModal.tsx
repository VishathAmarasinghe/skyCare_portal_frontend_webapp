import React, { useState } from 'react'
import { Modal } from 'antd';
import { Box, Button, Stack, Step, StepLabel, Stepper, CircularProgress } from "@mui/material";
import {CREATE_CARE_PLAN_STEPS} from '../../../constants/index';
import AddCarePlanForm from '../component/AddCarePlanForm';

interface AddNewCarePlanModalProps {
    isCarePlanAddModalVisible: boolean;
    setIsCarePlanAddModalVisible: (value: boolean) => void;
  }

const AddNewCarePlanModal = ({isCarePlanAddModalVisible,setIsCarePlanAddModalVisible}:AddNewCarePlanModalProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

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
    document.getElementById("submit-btn")?.click();
    
  };

  return (
    <Modal
      title="Add New Client"
      width="80%"
      centered
      maskClosable={false}
      open={isCarePlanAddModalVisible}
      onOk={() => setIsCarePlanAddModalVisible(false)}
      onCancel={() => setIsCarePlanAddModalVisible(false)}
      footer={(
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
          sx={{mx: 1}}
            variant="contained"
            onClick={activeStep === CREATE_CARE_PLAN_STEPS.length - 1 ? handleSave : handleNext}
            disabled={loading} // Disable buttons during loading
          >
            {loading ? <CircularProgress size={24} /> : activeStep === CREATE_CARE_PLAN_STEPS.length - 1 ? 'Save' : 'Next'}
          </Button>
        </Box>
      )}
    >
      <Stack width="100%">
        {/* Stepper */}
        <Stepper activeStep={activeStep}>
          {CREATE_CARE_PLAN_STEPS.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Stack>

      <Box sx={{ mt: 2 }}  width="100%" minHeight={"50vh"}>
          <AddCarePlanForm activeStepper={activeStep} key="care-plan"/>
      </Box>
    </Modal>
  );
}

export default AddNewCarePlanModal
