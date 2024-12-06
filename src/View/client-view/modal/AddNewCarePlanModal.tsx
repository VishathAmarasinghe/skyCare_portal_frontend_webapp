import React, { useEffect, useState } from 'react'
import { Modal } from 'antd';
import { Box, Button, Stack, Step, StepLabel, Stepper, CircularProgress, Typography, FormControlLabel, Switch } from "@mui/material";
import {CREATE_CARE_PLAN_STEPS} from '../../../constants/index';
import AddCarePlanForm from '../component/AddCarePlanForm';
import { useAppDispatch, useAppSelector } from '@slices/store';
import { resetSelectedCarePlan } from '@slices/carePlanSlice/carePlan';

interface AddNewCarePlanModalProps {
    isCarePlanAddModalVisible: boolean;
    setIsCarePlanAddModalVisible: (value: boolean) => void;
    isEditMode:boolean; 
    setIsEditMode:React.Dispatch<React.SetStateAction<boolean>>;
  }

const AddNewCarePlanModal = ({isCarePlanAddModalVisible,setIsCarePlanAddModalVisible,isEditMode,setIsEditMode}:AddNewCarePlanModalProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const carePlanSlice = useAppSelector(state => state.carePlans);
  const dispatch = useAppDispatch();

  useEffect(()=>{
    if (!isCarePlanAddModalVisible) {
      dispatch(resetSelectedCarePlan());
      setActiveStep(0);
    }
  },[isCarePlanAddModalVisible])

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
        <Typography variant="h6">{carePlanSlice?.selectedCarePlan?"Update Care Plan":"Add New Care Plan"}</Typography>
        {
          carePlanSlice?.selectedCarePlan!=null &&
          
          <FormControlLabel
            control={
              <Switch
                checked={isEditMode}
                onChange={handleToggleChange}
                color="primary"
              />
            }
            label={isEditMode ? 'Edit Mode On' : 'Edit Mode Off'}
            labelPlacement="start"
          />
        }
      </Box>
    }
      width="80%"
      centered
      maskClosable={false}
      closable={false}
      open={isCarePlanAddModalVisible}
      onOk={() => setIsCarePlanAddModalVisible(false)}
      onCancel={() => setIsCarePlanAddModalVisible(false)}
      footer={(
        <Box display="flex" justifyContent="end" width="100%">
          {/* Back Button */}
          <Button variant="outlined" sx={{mr:1}} onClick={()=>setIsCarePlanAddModalVisible(false)}>Cancel</Button>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{display: activeStep === 0 ? 'none' : 'block'}}
          >
            Back
          </Button>

          {/* Next or Save Button */}
          <Button
          sx={{mx: 1}}
            variant="contained"
            
            onClick={activeStep === CREATE_CARE_PLAN_STEPS.length - 1 ? handleSave : handleNext}
            disabled={loading || (activeStep === CREATE_CARE_PLAN_STEPS.length - 1 && !isEditMode)? true:false} // Disable buttons during loading
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
          <AddCarePlanForm isEditMode={isEditMode} setIsEditMode={setIsEditMode} activeStepper={activeStep} key="care-plan"/>
      </Box>
    </Modal>
  );
}

export default AddNewCarePlanModal
