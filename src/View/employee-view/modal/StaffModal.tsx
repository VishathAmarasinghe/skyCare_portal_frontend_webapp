import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { Box, Button, Stack, Step, StepLabel, Stepper, CircularProgress } from "@mui/material";
import { CREATE_CARE_GIVER_STEPS, CREATE_CLIENT_STEPS } from '../../../constants/index';
import { State } from "../../../types/types";
import EmployeeBasicInfoForm from '../components/EmployeeBasicInfoForm';
import CareGiverFileUploader from '../components/CareGiverFileUploader';
import CareGiverPaymentRatioAdder from '../components/CareGiverPaymentRatioAdder';
import { CareGiver, CareGiverDocuments, CareGiverPayments, saveCareGiver } from '@slices/CareGiverSlice/careGiver';
import { useAppDispatch, useAppSelector } from '@slices/store';
import { Employee } from '@slices/EmployeeSlice/employee';
import { enqueueSnackbarMessage } from '@slices/commonSlice/common';

interface AddNewClientModalProps {
  isCareGiverAddModalVisible: boolean;
  setIsCareGiverAddModalVisible: (value: boolean) => void;
  isEditMode:boolean;
  setIsEditMode:React.Dispatch<React.SetStateAction<boolean>>;
}

const StaffModal = ({isEditMode,setIsEditMode,isCareGiverAddModalVisible: IsCareGiverAddModalVisible, setIsCareGiverAddModalVisible: setIsCareGiverAddModalVisible }: AddNewClientModalProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [careGiverDocuments, setCareGiverDocuments] = useState<CareGiverDocuments[]>([]);
  const [careGiverPayments,setCareGiverPayments]= useState<CareGiverPayments[]>([]);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const careGiverStatus =useAppSelector((state)=>state.careGivers);
  const [errorState,setErrorState] = useState<"Pending"|"Validated">("Pending");
  const dispatch = useAppDispatch();
  const [employeeBasicInformation, setEmployeeBasicInformation] = useState<
    Employee
  >({
    employeeID: "",
    password: "",
    status:"",
    firstName: "",
    lastName: "",
    email: "",
    accessRole: "",
    joinDate: "",
    profile_photo: "",
    employeeAddresses: [
      {
        longitude: "",
        latitude: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
      },
    ],
    employeeJobRoles: [],
    employeePhoneNo: ["", ""],
  });

  useEffect(()=>{
    setActiveStep(0);
  },[IsCareGiverAddModalVisible])

  useEffect(()=>{
      if(careGiverStatus.submitState===State.success){
        setIsCareGiverAddModalVisible(false);
      }
  },[careGiverStatus.submitState])

  // Handle next step
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  useEffect(()=>{
    if (errorState==="Validated") {
      if (uploadFiles?.length===careGiverDocuments?.length) {
        const careGiverPayload:CareGiver ={
          careGiverDocuments:careGiverDocuments,
          careGiverPayments:careGiverPayments,
          employee:employeeBasicInformation,
          careGiverID:"",
          status:"Active"
        } 
        console.log("uploadFiles",uploadFiles);
        console.log("careGiverDocuments",careGiverDocuments);
        
        dispatch(saveCareGiver({careGiverData:careGiverPayload,profilePhoto:profilePic,uploadFiles:uploadFiles}));
        setErrorState("Pending");
    }else{
      console.log("errorState",errorState);
      console.log("uploadFiles",uploadFiles);
      console.log("careGiverDocuments",careGiverDocuments);
      dispatch(enqueueSnackbarMessage({message:"Please upload all documents, and fill all the required fields",type:"error"}));
    }    
    }
  },[errorState])

  // Handle save (final step)
  const handleSave = async () => {
    document.getElementById("employeeMainData")?.click();
    employeeBasicInformation.accessRole = "CareGiver";
  };

  return (
    <Modal
      key={IsCareGiverAddModalVisible.toString()}
      title="Add New Care Giver"
      width="80%"
      centered
      maskClosable={false}
      open={IsCareGiverAddModalVisible}
      onOk={() => setIsCareGiverAddModalVisible(false)}
      onCancel={() => setIsCareGiverAddModalVisible(false)}
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
            onClick={activeStep === CREATE_CARE_GIVER_STEPS.length - 1 ? handleSave : handleNext}
            disabled={loading} // Disable buttons during loading
          >
            {loading ? <CircularProgress size={24} /> : activeStep === CREATE_CARE_GIVER_STEPS.length - 1 ? 'Save' : 'Next'}
          </Button>
        </Box>
      )}
    >
      <Stack width="100%">
        {/* Stepper */}
        <Stepper activeStep={activeStep}>
          {CREATE_CARE_GIVER_STEPS.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Stack>

      <Box sx={{ mt: 2 }}  width="100%">
        <Stack sx={{display:activeStep===0?"flex":"none"}}>
        <EmployeeBasicInfoForm 
            profilePic={profilePic} 
            setProfilePic={setProfilePic}  
            employeeBasicInformation={employeeBasicInformation} 
            setEmployeeBasicInformation={setEmployeeBasicInformation} 
            errorState={errorState}
            setErrorState={setErrorState}
            modalOpenState={IsCareGiverAddModalVisible}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            /> 
        </Stack>
        <Stack sx={{display:activeStep===1?"flex":"none"}}>
        <CareGiverFileUploader modalOpenState={IsCareGiverAddModalVisible} uploadFiles={uploadFiles} setUploadFiles={setUploadFiles} careGiverDocuments={careGiverDocuments} setCareGiverDocuments={setCareGiverDocuments}/>
        </Stack>
        <Stack sx={{display:activeStep===2?"flex":"none"}}>
        <CareGiverPaymentRatioAdder modalOpenState={IsCareGiverAddModalVisible} careGiverPayments={careGiverPayments} setCareGiverPayments={setCareGiverPayments}/>
        </Stack>
      </Box>
    </Modal>
  );
};

export default StaffModal
