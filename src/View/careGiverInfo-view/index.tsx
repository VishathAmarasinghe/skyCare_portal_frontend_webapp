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
import React, { useEffect, useState } from "react";
import {
  CareGiver,
  CareGiverDocuments,
  fetchDocumentTypes,
  fetchSingleCareGiverByEmployeeID,
  saveCareGiver,
  updateCareGiver,
} from "../../slices/careGiverSliceName/careGiver";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import {
  Employee,
  fetchSingleEmployee,
} from "../../slices/employeeSliceName/employee";
import { enqueueSnackbarMessage } from "../../slices/commonSlice/common";
import {
  CREATE_CARE_GIVER_INTERNAL_UPDATE,
  CREATE_CARE_GIVER_OUTSIDE_REGISTRATION,
} from "../../constants/index";
import EmployeeBasicInfoForm from "../employee-view/components/EmployeeBasicInfoForm";
import CareGiverFileUploader from "../employee-view/components/CareGiverFileUploader";

const CareGiverInfoView = () => {
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
  const authUserInfo = useAppSelector((state) => state?.auth?.userInfo);
  const employeeSlice = useAppSelector((state) => state?.employees);
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
    if (authUserInfo?.userID) {
      dispatch(fetchSingleEmployee(authUserInfo.userID));
      dispatch(fetchSingleCareGiverByEmployeeID(authUserInfo.userID));
    }
  }, []);

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

  useEffect(() => {
    if (errorState === "Validated") {
      if (
        careGiverStatus?.selectedCareGiver != null &&
        careGiverStatus?.careGiverDocumentTypes?.length ===
          careGiverDocuments?.length
      ) {
        const careGiverPayload: CareGiver = {
          careGiverDocuments: careGiverDocuments,
          careGiverPayments: [],
          employee: {
            ...employeeBasicInformation,
            status: employeeSlice?.selectedEmployee?.status || "",
          },
          careGiverID: careGiverStatus.selectedCareGiver.careGiverID,
          status: employeeSlice?.selectedEmployee?.status || "",
        };
        console.log("careGiverPayload", careGiverPayload);
        console.log("uploadFiles", uploadFiles);
        dispatch(
          updateCareGiver({
            careGiverData: careGiverPayload,
            profilePhoto: profilePic,
            uploadFiles: uploadFiles,
          })
        );
      }
    }
  }, [errorState]);

  const handleSave = async () => {
    document.getElementById("employeeMainData")?.click();
    if (
      employeeBasicInformation.firstName &&
      employeeBasicInformation.lastName
    ) {
      employeeBasicInformation.accessRole = "CareGiver";
    } else {
      dispatch(
        enqueueSnackbarMessage({
          message: "Please fill in the required fields",
          type: "error",
        })
      );
    }
  };

  return (
    <Stack
      width="100%"
      // height="100vh"
      flexDirection="column"
      alignItems={"center"}
      justifyContent="center"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <Stack
        width="80%"
        sx={{
          backgroundColor: "white",
          padding: 2,
          borderRadius: 2,
          boxShadow: 1,
          overflowY: "auto", // Enable vertical scrolling
          maxHeight: "80vh",
        }}
      >
        <Stack width="100%">
          <Stepper activeStep={activeStep}>
            {CREATE_CARE_GIVER_INTERNAL_UPDATE.map((label, index) => (
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
              if (activeStep === CREATE_CARE_GIVER_INTERNAL_UPDATE.length - 1) {
                handleSave();
              } else {
                handleNext();
              }
            }}
            disabled={
              loading ||
              activeStep === CREATE_CARE_GIVER_INTERNAL_UPDATE.length - 1 // Disable if on the last step and not agreed
            }
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === CREATE_CARE_GIVER_INTERNAL_UPDATE.length - 1 ? (
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

export default CareGiverInfoView;
