import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
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
} from "../../slices/careGiverSlice/careGiver";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import {
  Employee,
  fetchSingleEmployee,
} from "../../slices/employeeSlice/employee";
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
      if (
        careGiverStatus?.selectedCareGiver != null
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
        dispatch(
          updateCareGiver({
            careGiverData: careGiverPayload,
            profilePhoto: profilePic,
            uploadFiles: uploadFiles,
          })
        );
      }
    }
    setErrorState("Pending");
  }, [errorState]);

  const handleSave = async () => {
    document.getElementById("employeeMainData")?.click();
    console.log("employeeBasicInformation", employeeBasicInformation);
  };

  return (
    <Stack
      width="100%"
      height="100%"
      flexDirection="column"
      alignItems={"center"}
      justifyContent="center"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h6"
        >
          User Info
        </Typography>
      </Stack>
      <Stack
        width="100%"
        sx={{
          backgroundColor: "white",
          padding: 2,
          borderRadius: 2,
          boxShadow: 1,
          overflowY: "auto", // Enable vertical scrolling
          maxHeight: "80vh",
        }}
      >
        <Box sx={{ mt: 2 }} width="100%">
          <Stack>
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
          <Stack sx={{ display:"none" }}>
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
          <Button
            sx={{ mx: 1 }}
            variant="contained"
            onClick={() => {
                handleSave();
            }}
          >
           Save
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
};

export default CareGiverInfoView;
