import React, { useEffect, useState } from 'react'
import { Modal } from 'antd';
import { Box, Button, Stack, Step, StepLabel, Stepper, CircularProgress, Typography, FormControlLabel, Switch } from "@mui/material";
import {CREATE_APPOINTMENT_STEPS, CREATE_CARE_PLAN_STEPS} from '../../../constants/index';
import AppointmentForm from '../component/AppointmentForm';
import { useAppDispatch, useAppSelector } from '../../../slices/store';
import { fetchAppointmentTypes, resetSelectedAppointment } from '@slices/AppointmentSlice/appointment';
import { fetchClients } from '@slices/clientSlice/client';
import { fetchAllCarePlans } from '@slices/carePlanSlice/carePlan';
import { fetchCareGivers } from '@slices/CareGiverSlice/careGiver';


interface AddNewAppointmentModalProps {
    isAppointmentAddModalVisible: boolean;
    setIsAppointmentAddModalVisible: (value: boolean) => void;
    isEditMode:boolean; 
    setIsEditMode:React.Dispatch<React.SetStateAction<boolean>>;
  }

const AddNewAppointmentModal = ({isAppointmentAddModalVisible: isAddAppointmentModalVisible,setIsAppointmentAddModalVisible: setIsAppointmentModalVisible,isEditMode,setIsEditMode}:AddNewAppointmentModalProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const appointmentSlice = useAppSelector(state => state.appointments);
  const clientSlice = useAppSelector(state => state.clients);
  const dispatch = useAppDispatch();

  useEffect(()=>{
    if (!isAddAppointmentModalVisible) {
    //   dispatch(resetSelectedAppointment());
      setActiveStep(0);
    }else{
        dispatch(fetchAppointmentTypes());
        dispatch(fetchClients());
        dispatch(fetchAllCarePlans());
        dispatch(fetchCareGivers());
    }
  },[isAddAppointmentModalVisible])

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
        <Typography variant="h6">{appointmentSlice?.selectedAppointment?"Update Appointment":"Add New Appointment"}</Typography>
        {
          appointmentSlice?.selectedAppointment!=null &&
          
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
      open={isAddAppointmentModalVisible}
      onOk={() => {setIsAppointmentModalVisible(false)}}
      onCancel={() => {setIsAppointmentModalVisible(false),resetSelectedAppointment()}}
      footer={(
        <Box display="flex" justifyContent="end" width="100%">
          {/* Back Button */}
          <Button variant="outlined" sx={{mr:1}} onClick={()=>{setIsAppointmentModalVisible(false),resetSelectedAppointment()}}>Cancel</Button>
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
            
            onClick={activeStep === CREATE_APPOINTMENT_STEPS.length - 1 ? handleSave : handleNext}
            disabled={loading || (activeStep === CREATE_APPOINTMENT_STEPS.length - 1 && !isEditMode)? true:false} // Disable buttons during loading
          >
            {loading ? <CircularProgress size={24} /> : activeStep === CREATE_APPOINTMENT_STEPS.length - 1 ? 'Save' : 'Next'}
          </Button>
        </Box>
      )}
    >
        <Stack width="100%">
        {/* Stepper */}
        <Stepper activeStep={activeStep}>
          {CREATE_APPOINTMENT_STEPS.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Stack>
      <Box sx={{ mt: 2 }}  width="100%" minHeight={"50vh"}>
          <AppointmentForm activeStep={activeStep}  isEditMode={isEditMode} key="Appointment"/>
      </Box>
    </Modal>
  );
}

export default AddNewAppointmentModal
