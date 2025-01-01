import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Button, Stack, Tab, Typography, useTheme } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { State } from "../../../types/types";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CareGiverbasicInfo from "../components/tabs/CareGiverbasicInfo";
import CareGiverDocumentInfo from "../components/tabs/careGiverDocumentInfo";
import CareGiverPaymentInfo from "../components/tabs/CareGiverPaymentInfo";
import { fetchSingleClients } from "@slices/clientSlice/client";
import { fetchSingleCareGiverByEmployeeID } from "@slices/careGiverSlice/careGiver";
import StaffModal from "../modal/StaffModal";
import { fetchSingleEmployee } from "@slices/employeeSlice/employee";

const CareGiverTab = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState("1");
  const [searchParams] = useSearchParams();
  const employeeID = searchParams.get("employeeID");
  const dispatch = useAppDispatch();
  const careGiverInfo = useAppSelector((state) => state.careGivers);
  const careGiver = careGiverInfo?.selectedCareGiver;
  const [isClientModalVisible, setIsClientModalVisible] =
    useState<boolean>(false);

  useEffect(() => {
    fetchCareGiverDetails();
  }, [employeeID]);

  const fetchCareGiverDetails = async () => {
    if (employeeID && employeeID !== "") {
      dispatch(fetchSingleCareGiverByEmployeeID(employeeID));
      dispatch(fetchSingleEmployee(employeeID));
    }
  };

  useEffect(() => {
    if (
      careGiverInfo?.submitState === State?.success ||
      careGiverInfo?.updateState === State?.success
    ) {
      fetchCareGiverDetails();
      setIsClientModalVisible(false);
      setTabValue("1");
    }
  }, [careGiverInfo.updateState, careGiverInfo?.submitState]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <Stack
      width="100%"
      height="100%"
      data-aos="fade-right"
      data-aos-duration="200"
      flexDirection="column"
      borderRadius={3}
      sx={{ backgroundColor: "white" }}
    >
      <Stack
        width="100%"
        height="10%"
        p={2}
        flexDirection="row"
        justifyContent="space-between"
      >
        <Typography
          variant="h5"
          fontWeight={600}
          color={theme.palette.primary.main}
        >
          Care Giver Record: {careGiver?.employee?.firstName}{" "}
          {careGiver?.employee?.lastName}
        </Typography>
        <Stack flexDirection="row">
          {/* <Button sx={{ mx: 2 }} variant="outlined">
            Deactivate
          </Button> */}
          <Button
            variant="contained"
            onClick={() => {
              setIsClientModalVisible(true);
              if (employeeID) {
                dispatch(fetchSingleEmployee(employeeID));
              }
            }}
          >
            Edit
          </Button>
        </Stack>
      </Stack>
      <Stack width="100%" height="80%">
        <StaffModal
          isCareGiverAddModalVisible={isClientModalVisible}
          isEditMode={true}
          setIsCareGiverAddModalVisible={setIsClientModalVisible}
          setIsEditMode={() => {}}
        />
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="client tabs">
              <Tab label="General Infomation" value="1" />
              <Tab label="Documents" value="2" />
              <Tab label="Payments" value="3" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <CareGiverbasicInfo />
          </TabPanel>
          <TabPanel value="2">
            <CareGiverDocumentInfo />
          </TabPanel>
          <TabPanel value="3">
            <CareGiverPaymentInfo />
          </TabPanel>
        </TabContext>
      </Stack>
    </Stack>
  );
};

export default CareGiverTab;
