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
import {
  CREATE_CARE_GIVER_STEPS,
  CREATE_CLIENT_STEPS,
} from "../../../constants/index";
import { State } from "../../../types/types";
import EmployeeBasicInfoForm from "../components/EmployeeBasicInfoForm";
import CareGiverFileUploader from "../components/CareGiverFileUploader";
import CareGiverPaymentRatioAdder from "../components/CareGiverPaymentRatioAdder";
import {
  CareGiver,
  CareGiverDocuments,
  CareGiverPayments,
  saveCareGiver,
  updateCareGiver,
} from "@slices/careGiverSlice/careGiver";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { Employee, fetchEmployeesByRole } from "@slices/employeeSlice/employee";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";
import { APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN } from "@config/config";

interface AddNewClientModalProps {
  isCareGiverAddModalVisible: boolean;
  setIsCareGiverAddModalVisible: (value: boolean) => void;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const StaffModal = ({
  isEditMode,
  setIsEditMode,
  isCareGiverAddModalVisible: IsCareGiverAddModalVisible,
  setIsCareGiverAddModalVisible: setIsCareGiverAddModalVisible,
}: AddNewClientModalProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [careGiverDocuments, setCareGiverDocuments] = useState<
    CareGiverDocuments[]
  >([]);
  const [careGiverPayments, setCareGiverPayments] = useState<
    CareGiverPayments[]
  >([]);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const careGiverStatus = useAppSelector((state) => state.careGivers);
  const employeeSlice = useAppSelector((state) => state?.employees);
  const [errorState, setErrorState] = useState<"Pending" | "Validated">(
    "Pending"
  );
  const dispatch = useAppDispatch();
  const [employeeState, setEmployeeState] = useState<
    "Activated" | "Deactivated" | "Pending"
  >("Pending");
  const authRole = useAppSelector((state) => state?.auth?.roles);
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

  const resetEmployeeBasicInformation = () => {
    setEmployeeBasicInformation({
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
  };

  useEffect(() => {
    if (employeeSlice?.selectedEmployee) {
      setEmployeeState(
        employeeSlice?.selectedEmployee?.status as
          | "Pending"
          | "Activated"
          | "Deactivated"
      );
    }
  }, [employeeSlice?.selectedEmployee]);

  useEffect(() => {
    if (
      careGiverStatus?.submitState === State?.success ||
      careGiverStatus?.updateState === State?.success
    ) {
      setIsCareGiverAddModalVisible(false);
      setIsEditMode(false);
      dispatch(fetchEmployeesByRole("CareGiver"));
    }
  }, [careGiverStatus?.submitState, careGiverStatus?.updateState]);

  useEffect(() => {
    setActiveStep(0);
    if (!IsCareGiverAddModalVisible) {
      resetEmployeeBasicInformation();
    }
  }, [IsCareGiverAddModalVisible]);

  useEffect(() => {
    if (careGiverStatus.submitState === State.success) {
      setIsCareGiverAddModalVisible(false);
    }
  }, [careGiverStatus.submitState]);

  // Handle next step
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  useEffect(() => {
    if (errorState === "Validated") {
      if (
        uploadFiles?.length === careGiverDocuments?.length &&
        careGiverStatus?.selectedCareGiver == null
      ) {
        const careGiverPayload: CareGiver = {
          careGiverDocuments: careGiverDocuments,
          careGiverPayments: careGiverPayments,
          employee: employeeBasicInformation,
          careGiverID: "",
          status: employeeBasicInformation?.status,
        };
        console.log("uploadFiles", uploadFiles);
        console.log("careGiverDocuments", careGiverDocuments);
        dispatch(
          saveCareGiver({
            careGiverData: careGiverPayload,
            profilePhoto: profilePic,
            uploadFiles: uploadFiles,
          })
        );
        setErrorState("Pending");
      } else if (
        careGiverStatus?.selectedCareGiver != null &&
        careGiverStatus?.careGiverDocumentTypes?.length ===
          careGiverDocuments?.length
      ) {
        const careGiverPayload: CareGiver = {
          careGiverDocuments: careGiverDocuments,
          careGiverPayments: careGiverPayments,
          employee: { ...employeeBasicInformation, status: employeeState },
          careGiverID: careGiverStatus.selectedCareGiver.careGiverID,
          status: employeeState,
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
      } else {
        console.log("errorState", errorState);
        console.log("uploadFiles", uploadFiles);
        console.log("careGiverDocuments", careGiverDocuments);
        dispatch(
          enqueueSnackbarMessage({
            message:
              "Please upload all documents, and fill all the required fields",
            type: "error",
          })
        );
      }
    }
    setErrorState("Pending");
  }, [errorState]);

  // Handle save (final step)
  const handleSave = async () => {
    document.getElementById("employeeMainData")?.click();
    employeeBasicInformation.accessRole = "CareGiver";
  };

  const handleStatusChange = (newStatus: "Activated" | "Deactivated") => {
    if (careGiverStatus.selectedCareGiver) {
      const updatedCareGiver = {
        ...careGiverStatus.selectedCareGiver,
        status: newStatus,
      };
      employeeBasicInformation.status = newStatus;
      setEmployeeState(newStatus);
      dispatch(
        enqueueSnackbarMessage({
          message: `Status updated to ${newStatus}`,
          type: "success",
        })
      );
    }
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
      footer={
        <Box display="flex" justifyContent="end" width="100%">
          {/* Back Button */}
          {careGiverStatus.selectedCareGiver &&
            (authRole?.includes(APPLICATION_ADMIN) ||
              authRole?.includes(APPLICATION_SUPER_ADMIN)) && (
              <Button
                variant="outlined"
                sx={{ mx: 1 }}
                color={employeeState === "Pending" ? "success" : "error"}
                onClick={() =>
                  handleStatusChange(
                    employeeState === "Pending" ? "Activated" : "Deactivated"
                  )
                }
              >
                {employeeState === "Pending" ? "Activate" : "Deactivate"}
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
              activeStep === CREATE_CARE_GIVER_STEPS.length - 1
                ? handleSave
                : handleNext
            }
            disabled={loading} // Disable buttons during loading
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === CREATE_CARE_GIVER_STEPS.length - 1 ? (
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
          {CREATE_CARE_GIVER_STEPS.map((label, index) => (
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
          <CareGiverPaymentRatioAdder
            modalOpenState={IsCareGiverAddModalVisible}
            careGiverPayments={careGiverPayments}
            setCareGiverPayments={setCareGiverPayments}
          />
        </Stack>
      </Box>
    </Modal>
  );
};

export default StaffModal;
