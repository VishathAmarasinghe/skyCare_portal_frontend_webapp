import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Button, Stack, Tab, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import BasicInfoTab from "../component/tabs/BasicInfo-tab";
import InterestTab from "../component/tabs/Interest-tab";
import NotesTab from "../component/tabs/notes-tab";
import AppointmentTab from "../component/tabs/Appointments-tab";
import CarePlanTab from "../component/tabs/carePlans-tab";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { fetchSingleClients } from "../../../slices/clientSlice/client";
import AddNewClientModal from "../modal/AddNewClientModal";
import { State } from "../../../types/types";
import DocumentsTab from "../component/tabs/documents-tab";
import CarePlanBillings from "../component/tabs/carePlanBillings-tab";
import ClientTimeSheetTab from "../component/tabs/ClientTimeSheetTab";

const ClientInfoPanel = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState("1");
  const [searchParams] = useSearchParams();
  const clientID = searchParams.get("clientID");
  const dispatch = useAppDispatch();
  const clientInfo = useAppSelector((state) => state.clients);
  const client = clientInfo?.selectedClient;
  const [isClientModalVisible, setIsClientModalVisible] =
    useState<boolean>(false);

  useEffect(() => {
    fetchClientDetails();
  }, [clientID]);

  const fetchClientDetails = async () => {
    if (clientID && clientID !== "") {
      dispatch(fetchSingleClients(clientID));
    }
  };

  useEffect(() => {
    if (
      clientInfo?.submitState === State?.success ||
      clientInfo?.updateState === State?.success
    ) {
      fetchClientDetails();
      setIsClientModalVisible(false);
    }
  }, [clientInfo.updateState, clientInfo?.submitState]);

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
          Client Record: {client?.firstName} {client?.lastName}
        </Typography>
        <Stack flexDirection="row">
          {/* <Button sx={{ mx: 2 }} variant="outlined">
            Deactivate
          </Button> */}
          <Button
            variant="contained"
            onClick={() => {
              setIsClientModalVisible(true);
            }}
          >
            Edit
          </Button>
          <AddNewClientModal
            isClientAddModalVisible={isClientModalVisible}
            setIsClientAddModalVisible={setIsClientModalVisible}
            key={"clientModal"}
          />
        </Stack>
      </Stack>
      <Stack width="100%" height="100%">
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="client tabs">
              <Tab label="General Infomation" value="1" />
              <Tab label="Interest" value="2" />
              <Tab label="Notes" value="3" />
              <Tab label="Care Plans" value="4" />
              <Tab label="Appointments" value="5" />
              <Tab label="Care Plan Billings" value="8" />
              <Tab label="Documents" value="7" />
              <Tab label="Time Sheets" value="9" />
            </TabList>
          </Box>
          <TabPanel sx={{height:"100%"}} value="1">
            <BasicInfoTab />
          </TabPanel >
          <TabPanel sx={{height:"100%"}} value="2">
            <InterestTab />
          </TabPanel>
          <TabPanel sx={{height:"100%"}} value="3">
            <NotesTab />
          </TabPanel>
          <TabPanel sx={{height:"100%"}} value="4">
            <CarePlanTab />
          </TabPanel>
          <TabPanel sx={{height:"100%"}} value="5">
            <AppointmentTab />
          </TabPanel>
          <TabPanel sx={{height:"100%"}} value="7">
            <DocumentsTab />
          </TabPanel>
          <TabPanel sx={{height:"100%"}} value="8">
            <CarePlanBillings/>
          </TabPanel>
          <TabPanel sx={{height:"100%"}} value="9">
            <ClientTimeSheetTab/>
          </TabPanel>
        </TabContext>
      </Stack>
    </Stack>
  );
};

export default ClientInfoPanel;
