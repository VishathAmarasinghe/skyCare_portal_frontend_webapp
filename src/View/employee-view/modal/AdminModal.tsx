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
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { CREATE_CLIENT_STEPS } from "../../../constants/index";
import { State } from "../../../types/types";
import EmployeeBasicInfoForm from "../components/EmployeeBasicInfoForm";
import {
  Employee,
  fetchEmployeesByRole,
  fetchSingleEmployee,
  resetSelectedEmployee,
  resetSubmitState,
  saveEmployee,
  updateEmployee,
  updateEmployeeState,
} from "../../../slices/employeeSlice/employee";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { set } from "date-fns";
import {
  APPLICATION_ADMIN,
  APPLICATION_SUPER_ADMIN,
} from "../../../config/config";

interface AddNewClientModalProps {
  isEmployeeAddModalVisible: boolean;
  setIsEmployeeAddModalVisible: (value: boolean) => void;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminModal = ({
  isEmployeeAddModalVisible: isEmployeeAddModalVisible,
  setIsEmployeeAddModalVisible: setIsEmployeeAddModalVisible,
  isEditMode,
  setIsEditMode,
}: AddNewClientModalProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const employeeSlice = useAppSelector((state) => state?.employees);
  const [loading, setLoading] = useState<boolean>(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
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
      employeePhoneNo: [""],
      emergencyPhoneNo: "",
      emergencyUser: "",
    });

  useEffect(() => {
    if (
      employeeSlice?.submitState == State.success ||
      employeeSlice?.updateState == State.success
    ) {
      setIsEmployeeAddModalVisible(false);
      dispatch(resetSubmitState());
      dispatch(resetSelectedEmployee());
    }
  }, [employeeSlice]);

  useEffect(() => {
    console.log("selected eom   ployee is", employeeSlice?.selectedEmployee);
  }, [employeeSlice?.selectedEmployee, employeeSlice?.state]);

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

  // Handle next step
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  useEffect(() => {
    employeeBasicInformation.accessRole = "Admin";
    console.log("errorState is", errorState);
    
    // console.log("employeeBasicInformation is", employeeBasicInformation);
    employeeBasicInformation.profile_photo = "";
    if (errorState == "Validated") {
      if (employeeSlice?.selectedEmployee) {
        dispatch(
          updateEmployee({
            employeeData: employeeBasicInformation,
            profilePhoto: profilePic,
          })
        );
      } else {
        dispatch(
          saveEmployee({
            employeeData: employeeBasicInformation,
            profilePhoto: profilePic,
          })
        );
      }
      setErrorState("Pending");
    }
  }, [errorState]);

  // Handle save (final step)
  const handleSave = async () => {
    document.getElementById("employeeMainData")?.click();
    employeeBasicInformation.accessRole = "Admin";
    employeeBasicInformation.profile_photo = "";
  };

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditMode(event.target.checked);
  };

  const handleStatusChange = (newStatus: "Activated" | "Deactivated" | "Pending") => {
    if (employeeSlice?.selectedEmployee) {
      const action = newStatus === "Activated" ? "activate" : "deactivate";
      Modal.confirm({
        title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        content: `Are you sure you want to ${action} this employee?`,
        okText: "Yes",
        cancelText: "No",
        onOk: async () => {
          try {
            await dispatch(
              updateEmployeeState({
                employeeID: employeeSlice.selectedEmployee?.employeeID || "",
                status: newStatus,
              })
            ).unwrap();
            setEmployeeState(newStatus);
            employeeBasicInformation.status = newStatus;
            dispatch(fetchEmployeesByRole("Admin"));
            if (employeeSlice?.selectedEmployee?.employeeID) {
              dispatch(fetchSingleEmployee(employeeSlice.selectedEmployee.employeeID));
            }
          } catch (error) {
            // Error is already handled in the thunk
          }
        },
      });
    }
  };

  return (
    <Modal
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {employeeSlice?.selectedEmployee ? "Update" : "Add"} Employee
          </Typography>
          {employeeSlice?.selectedEmployee != null && (
            <FormControlLabel
              control={
                <Switch
                  checked={isEditMode}
                  onChange={handleToggleChange}
                  color="primary"
                />
              }
              label={isEditMode ? "Edit Mode On" : "Edit Mode Off"}
              labelPlacement="start"
            />
          )}
        </Box>
      }
      width="80%"
      centered
      maskClosable={false}
      closeIcon={false}
      open={isEmployeeAddModalVisible}
      onOk={() => {
        setIsEmployeeAddModalVisible(false), dispatch(resetSelectedEmployee());
      }}
      onCancel={() => {
        setIsEmployeeAddModalVisible(false), dispatch(resetSelectedEmployee());
      }}
      footer={
        <Box display="flex" justifyContent="end" width="100%">
          {/* Activate/Deactivate Button */}
          {employeeSlice?.selectedEmployee &&
            (authRole?.includes(APPLICATION_ADMIN) ||
              authRole?.includes(APPLICATION_SUPER_ADMIN)) && (
              <Button
                variant="outlined"
                sx={{ mx: 1 }}
                color={employeeState === "Pending" ? "success" : employeeState === "Activated" ? "error" : "success"}
                onClick={() =>
                  handleStatusChange(
                    employeeState === "Pending"
                      ? "Activated"
                      : employeeState === "Activated"
                      ? "Deactivated"
                      : employeeState === "Deactivated"
                      ? "Activated"
                      : "Pending"
                  )
                }
              >
                {employeeState === "Pending"
                  ? "Activate"
                  : employeeState === "Activated"
                  ? "Deactivate"
                  : employeeState === "Deactivated"
                  ? "Activate"
                  : "Pending"}
              </Button>
            )}
          <Button
            variant="outlined"
            onClick={() => setIsEmployeeAddModalVisible(false)}
          >
            Cancel
          </Button>

          <Button
            sx={{ mx: 1 }}
            variant="contained"
            onClick={handleSave}
            disabled={loading} // Disable buttons during loading
          >
            {employeeSlice?.submitState === State?.loading ||
            employeeSlice?.updateState === State?.loading ? (
              <CircularProgress sx={{ color: "white" }} size={24} />
            ) : (
              "Save"
            )}
          </Button>
        </Box>
      }
    >
      {/* <Stack width="100%">
        <Stepper activeStep={activeStep}>
          {CREATE_CLIENT_STEPS.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Stack> */}

      <Box sx={{ mt: 2 }} width="100%">
        <EmployeeBasicInfoForm
          profilePic={profilePic}
          setProfilePic={setProfilePic}
          employeeBasicInformation={employeeBasicInformation}
          setEmployeeBasicInformation={setEmployeeBasicInformation}
          errorState={errorState}
          setErrorState={setErrorState}
          modalOpenState={isEmployeeAddModalVisible}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
        />
      </Box>
    </Modal>
  );
};

export default AdminModal;
