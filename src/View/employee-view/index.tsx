import {
  Button,
  ButtonGroup,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import EmployeeTable from "./components/EmployeeTable";
import AdminModal from "./modal/AdminModal";
import StaffModal from "./modal/StaffModal";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import {
  fetchPaymentTypes,
  fetchDocumentTypes,
  CareGiverDocuments,
  fetchCareGivers,
  fetchSingleCareGiverByEmployeeID,
  resetSelectedCareGiver,
} from "../../slices/careGiverSlice/careGiver";
import {
  fetchEmployeesByRole,
  resetSelectedEmployee,
} from "../../slices/employeeSlice/employee";
import { useLocation, useSearchParams } from "react-router-dom";
import CareGiverTab from "./panel/CareGiverTab";

const EmployeeView = () => {
  const theme = useTheme();
  const [selectedUser, setSelectedUser] = useState<"Admin" | "Staff">("Staff");
  const [isEmployeeAddModalVisible, setIsEmployeeAddModalVisible] =
    useState<boolean>(false);
  const [isStaffAddModalVisible, setIsStaffAddModalVisible] =
    useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const employeeSlice = useAppSelector((state) => state?.employees);
  const careGiverSlice = useAppSelector((state) => state?.careGivers);
  const [] = useState<boolean>(false);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [selectedCUser, setSelectedCUser] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const employeeID = searchParams.get("employeeID");
    setSelectedCUser(employeeID);
  }, [location, searchParams]);

  useEffect(() => {
    const selectedEmployee = employeeSlice?.selectedEmployee;
    if (employeeSlice?.selectedEmployee) {
      if (selectedEmployee?.accessRole === "Admin") {
        setIsEmployeeAddModalVisible(true);
        setIsEditMode(false); 
      } else if (selectedEmployee?.accessRole === "CareGiver") {
        dispatch(
          fetchSingleCareGiverByEmployeeID(selectedEmployee?.employeeID)
        );
        // setIsStaffAddModalVisible(true);
      }
    }
  }, [employeeSlice?.selectedEmployee]);

  useEffect(() => {
    handleUserTypeChange("Staff");
  }, []);

  useEffect(() => {
    handleUserTypeChange("Staff");
  }, [
    employeeSlice?.submitState,
    employeeSlice?.updateState,
    careGiverSlice?.submitState,
    careGiverSlice?.updateState,
  ]);

  const handleUserTypeChange = (userType: "Admin" | "Staff") => {
    setSelectedUser(userType);
    if (userType === "Admin") {
      dispatch(fetchEmployeesByRole("Admin"));
    }
    if (userType === "Staff") {
      dispatch(fetchEmployeesByRole("CareGiver"));
    }
  };

  useEffect(() => {
    dispatch(fetchPaymentTypes());
    dispatch(fetchDocumentTypes());
  }, [isStaffAddModalVisible]);

  useEffect(() => {
    if (!isEmployeeAddModalVisible) {
      dispatch(resetSelectedEmployee());
      dispatch(resetSelectedCareGiver());
    }
  }, [isEmployeeAddModalVisible]);

  return (
    <Stack width="100%" 
    height="100%">
      {location.pathname === "/Employees" ? (
        <Stack
          width="100%"
          data-aos="fade-right"
          data-aos-duration="200"
          sx={{
            backgroundColor: theme.palette.background.paper,
            boxShadow: 1,
            borderRadius: 2,
          }}
          height="100%"
        >
          {/* Header Section */}
          <Stack
            width="100%"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            padding="8px"
            height="9%"
          >
            <Typography
              color={theme.palette.primary.main}
              fontWeight="600"
              variant="h6"
            >
              Employees
            </Typography>
            <Stack flexDirection="row">
              <Button
                variant="contained"
                sx={{ mx: 1 }}
                onClick={() => {
                  setIsEmployeeAddModalVisible(true), setIsEditMode(true);
                  dispatch(resetSelectedEmployee());
                  dispatch(resetSelectedCareGiver());
                }}
              >
                New Admin
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setIsStaffAddModalVisible(true), setIsEditMode(true);
                  dispatch(resetSelectedEmployee());
                  dispatch(resetSelectedCareGiver());
                }}
              >
                New Staff
              </Button>
            </Stack>
          </Stack>

          {/* Button Group Section */}
          <Stack width={"100%"} height={"9%"} padding="8px">
            <ButtonGroup variant="outlined">
              <Button
                sx={{
                  backgroundColor:
                    selectedUser === "Staff"
                      ? theme.palette.primary.main
                      : theme.palette.grey[300],
                  color:
                    selectedUser === "Staff"
                      ? "#fff"
                      : theme.palette.text.primary,
                }}
                onClick={() => handleUserTypeChange("Staff")}
              >
                Staff
              </Button>
              <Button
                sx={{
                  backgroundColor:
                    selectedUser === "Admin"
                      ? theme.palette.primary.main
                      : theme.palette.grey[300],
                  color:
                    selectedUser === "Admin"
                      ? "#fff"
                      : theme.palette.text.primary,
                }}
                onClick={() => handleUserTypeChange("Admin")}
              >
                Admin
              </Button>
            </ButtonGroup>
          </Stack>

          {/* Table Section */}
          <Stack width="100%" height="81%">
            <AdminModal
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              isEmployeeAddModalVisible={isEmployeeAddModalVisible}
              setIsEmployeeAddModalVisible={setIsEmployeeAddModalVisible}
            />
            <StaffModal
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              isCareGiverAddModalVisible={isStaffAddModalVisible}
              setIsCareGiverAddModalVisible={setIsStaffAddModalVisible}
            />
            <EmployeeTable />
          </Stack>
        </Stack>
      ) : location.pathname === "/Employees/employeeInfo" && selectedCUser ? (
        <CareGiverTab />
      ) : null}
    </Stack>
  );
};

export default EmployeeView;
