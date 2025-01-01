import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  useTheme,
} from "@mui/material";
import {
  CareGiver,
  CareGiverDocuments,
  fetchDocumentTypes,
  saveCareGiver,
} from "../../slices/careGiverSlice/careGiver";
import { enqueueSnackbarMessage } from "../../slices/commonSlice/common";
import { Employee } from "../../slices/employeeSlice/employee";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import React, { useEffect, useState } from "react";
import { CREATE_CARE_GIVER_OUTSIDE_REGISTRATION } from "../../constants/index";
import AgreementComponent from "../../component/common/AgreementComponent";
import EmployeeBasicInfoForm from "../../View/employee-view/components/EmployeeBasicInfoForm";
import CareGiverFileUploader from "../../View/employee-view/components/CareGiverFileUploader";

const CareGiverRegistrationPage = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [careGiverDocuments, setCareGiverDocuments] = useState<
    CareGiverDocuments[]
  >([]);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const careGiverStatus = useAppSelector((state) => state.careGivers);
  const [errorState, setErrorState] = useState<"Pending" | "Validated">(
    "Pending"
  );
  const [IsCareGiverAddModalVisible, setIsCareGiverAddModalVisible] =
    useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const dispatch = useAppDispatch();
  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const [employeeBasicInformation, setEmployeeBasicInformation] =
    useState<Employee>({
      employeeID: "",
      password: "",
      status: "",
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

  useEffect(() => {
    setActiveStep(0);
  }, [IsCareGiverAddModalVisible]);

  useEffect(() => {
    dispatch(fetchDocumentTypes());
  }, []);

  useEffect(() => {
    if (careGiverStatus.submitState === "success") {
      setIsCareGiverAddModalVisible(false);
    }
  }, [careGiverStatus.submitState]);

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const checkIsRequiredFilesUploaded = () => {
    const requiredFiles = careGiverStatus?.careGiverDocumentTypes?.filter(
      (doc) => doc?.status === "Active" && doc?.required === true
    );
    const allRequiredFilesUploaded = requiredFiles?.every((doc) =>
      careGiverDocuments.some(
        (file) =>
          file.documentTypeID === doc?.documentName &&
          file?.document != null &&
          file?.document != ""
      )
    );
    if (careGiverStatus?.selectedCareGiver) {
      if (allRequiredFilesUploaded) {
        return true;
      } else {
        return false;
      }
    } else {
      if (
        allRequiredFilesUploaded &&
        requiredFiles.length <= uploadFiles.length
      ) {
        return true;
      } else {
        return false;
      }
    }
  };

  useEffect(() => {
    if (errorState === "Validated") {
      if (checkIsRequiredFilesUploaded()) {
        const careGiverPayload: CareGiver = {
          careGiverDocuments: careGiverDocuments,
          careGiverPayments: [],
          employee: employeeBasicInformation,
          careGiverID: "",
          status: "Active",
        };
        dispatch(
          saveCareGiver({
            careGiverData: careGiverPayload,
            profilePhoto: profilePic,
            uploadFiles: uploadFiles,
          })
        );
        setErrorState("Pending");
      } else {
        dispatch(
          enqueueSnackbarMessage({
            message:
              "Please upload atleast all required documents, and fill all the required fields",
            type: "error",
          })
        );
      }
    }
  }, [errorState]);

  const handleSave = async () => {
    document.getElementById("employeeMainData")?.click();
  };

  return (
    <Stack
      width="100%"
      height="100vh"
      flexDirection="column"
      alignItems={"center"}
      justifyContent="center"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <Stack
        width="70%"
        sx={{
          backgroundColor: "white",
          padding: 2,
          borderRadius: 2,
          boxShadow: 1,
          overflowY: "auto", // Enable vertical scrolling
          maxHeight: "90vh", // Set a max height to allow scrolling if needed
        }}
      >
        <Stack width="100%">
          <Stepper activeStep={activeStep}>
            {CREATE_CARE_GIVER_OUTSIDE_REGISTRATION.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Stack>

        <Box sx={{ mt: 2 }} width="100%">
          <Stack sx={{ display: activeStep === 0 ? "flex" : "none" }}>
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
          <Stack sx={{ display: activeStep === 1 ? "flex" : "none" }}>
            <CareGiverFileUploader
              modalOpenState={IsCareGiverAddModalVisible}
              uploadFiles={uploadFiles}
              setUploadFiles={setUploadFiles}
              careGiverDocuments={careGiverDocuments}
              setCareGiverDocuments={setCareGiverDocuments}
            />
          </Stack>
          <Stack sx={{ display: activeStep === 2 ? "flex" : "none" }}>
            <AgreementComponent isAgreed={isAgreed} setIsAgreed={setIsAgreed} />
          </Stack>
        </Box>
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
            onClick={() => {
              if (
                activeStep ===
                CREATE_CARE_GIVER_OUTSIDE_REGISTRATION.length - 1
              ) {
                handleSave();
              } else {
                handleNext();
              }
            }}
            disabled={
              loading ||
              (activeStep ===
                CREATE_CARE_GIVER_OUTSIDE_REGISTRATION.length - 1 &&
                !isAgreed) // Disable if on the last step and not agreed
            }
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep ===
              CREATE_CARE_GIVER_OUTSIDE_REGISTRATION.length - 1 ? (
              "Save"
            ) : (
              "Next"
            )}
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
};

export default CareGiverRegistrationPage;
