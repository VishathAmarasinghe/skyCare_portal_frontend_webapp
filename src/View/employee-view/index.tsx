import { Button, ButtonGroup, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import EmployeeTable from "./components/EmployeeTable";
import AdminModal from "./modal/AdminModal";
import StaffModal from "./modal/StaffModal";
import { useAppDispatch, useAppSelector } from "@slices/store";
import {fetchPaymentTypes,fetchDocumentTypes, CareGiverDocuments, fetchCareGivers, fetchSingleCareGiverByEmployeeID } from '../../slices/CareGiverSlice/careGiver'
import { fetchEmployeesByRole, resetSelectedEmployee } from "@slices/EmployeeSlice/employee";



const EmployeeView = () => {
  const theme = useTheme();
  const [selectedUser, setSelectedUser] = useState<"Admin"| "Staff">("Staff");
  const [isEmployeeAddModalVisible, setIsEmployeeAddModalVisible] = useState<boolean>(false);
  const [isStaffAddModalVisible, setIsStaffAddModalVisible] = useState<boolean>(false);
  const employeeSlice = useAppSelector((state)=>state?.employees);
  const careGiverSlice = useAppSelector((state)=>state?.careGivers);
  
  const dispatch = useAppDispatch();

  useEffect(()=>{
    const selectedEmployee = employeeSlice?.selectedEmployee;
    if (employeeSlice?.selectedEmployee) {
      if (selectedEmployee?.accessRole ==="Admin") {
        setIsEmployeeAddModalVisible(true);
      }else if(selectedEmployee?.accessRole ==="CareGiver"){
        dispatch(fetchSingleCareGiverByEmployeeID(selectedEmployee?.employeeID));
        setIsStaffAddModalVisible(true);
    }}
  },[employeeSlice?.selectedEmployee])

  useEffect(() => {
    handleUserTypeChange("Staff");
  }, []);

  useEffect(()=>{
      handleUserTypeChange("Staff");
  },[employeeSlice?.submitState,employeeSlice?.updateState,careGiverSlice?.submitState,careGiverSlice?.updateState])

  const handleUserTypeChange = (userType: "Admin" | "Staff") => {
    setSelectedUser(userType);
    if (userType === "Admin") {
      dispatch(fetchEmployeesByRole("Admin"));
    }
    if (userType === "Staff") {
      dispatch(fetchEmployeesByRole("CareGiver"));
  };}

  useEffect(()=>{
      dispatch(fetchPaymentTypes());
      dispatch(fetchDocumentTypes());
  },[isStaffAddModalVisible])

  return (
    <Stack width="100%" border="2px solid red" height="100%">
      {/* Header Section */}
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        padding="8px"
      >
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h6"
        >
          Employees
        </Typography>
        <Stack flexDirection="row">
          <Button variant="contained" sx={{mx:1}} onClick={()=>setIsEmployeeAddModalVisible(true)}>New Admin</Button>
          <Button variant="contained" onClick={()=>setIsStaffAddModalVisible(true)}>New Staff</Button>
        </Stack>
      </Stack>

      {/* Button Group Section */}
      <Stack padding="8px">
        <ButtonGroup variant="outlined">
          <Button
            sx={{
              backgroundColor:
                selectedUser === "Staff"
                  ? theme.palette.primary.main
                  : theme.palette.grey[300],
              color: selectedUser === "Staff" ? "#fff" : theme.palette.text.primary,
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
              color: selectedUser === "Admin" ? "#fff" : theme.palette.text.primary,
            }}
            onClick={() => handleUserTypeChange("Admin")}
          >
            Admin
          </Button>
        </ButtonGroup>
      </Stack>

      {/* Table Section */}
      <Stack width="100%" height="480px">
        <AdminModal isEmployeeAddModalVisible={isEmployeeAddModalVisible} setIsEmployeeAddModalVisible={setIsEmployeeAddModalVisible}/>
        <StaffModal isCareGiverAddModalVisible={isStaffAddModalVisible} setIsCareGiverAddModalVisible={setIsStaffAddModalVisible}/>
        <EmployeeTable  />
      </Stack>
    </Stack>
  );
};

export default EmployeeView;
