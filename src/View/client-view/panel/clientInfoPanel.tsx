import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Button, Stack, Tab, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import BasicInfoTab from '../component/tabs/BasicInfo-tab';
import InterestTab from '../component/tabs/Interest-tab';
import NotesTab from '../component/tabs/Notes-tab';
import AppointmentTab from '../component/tabs/Appointments-tab';
import CarePlanTab from '../component/tabs/carePlans-tab';
import { useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@slices/store";
import { fetchSingleClients } from "@slices/clientSlice/client";

const ClientInfoPanel = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState("1");
  const [searchParams] = useSearchParams();
  const clientID = searchParams.get("clientID");
  const dispatch = useAppDispatch();

  useEffect(()=>{
    fetchClientDetails();
  },[clientID])

  const fetchClientDetails = async () => {
    if (clientID && clientID !== "") {
      dispatch(fetchSingleClients(clientID));
    }
  }

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <Stack
      width="100%"
      height="100%"
      flexDirection="column"
      sx={{ backgroundColor: "white", border: "2px solid red" }}
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
          Client Record: {"Pathum Fernando"}
        </Typography>
        <Stack flexDirection="row">
          <Button sx={{ mx: 2 }} variant="outlined">
            Deactivate
          </Button>
          <Button variant="contained">Edit</Button>
        </Stack>
      </Stack>
      <Stack width="100%" height="80%">
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="client tabs">
              <Tab label="General Infomation" value="1" />
              <Tab label="Interest" value="2" />
              <Tab label="Notes" value="3" />
              <Tab label="Care Plans" value="4" />
              <Tab label="Appointments" value="5" />
              <Tab label="Tasks" value="6" />
              <Tab label="Documents" value="7" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <BasicInfoTab/>
          </TabPanel>
          <TabPanel value="2">
            <InterestTab/>
          </TabPanel>
          <TabPanel value="3">
            <NotesTab/>
          </TabPanel>
          <TabPanel value="4">
            <CarePlanTab/>
          </TabPanel>
          <TabPanel value="5">
            <AppointmentTab/>
          </TabPanel>
        </TabContext>
      </Stack>
    </Stack>
  );
};

export default ClientInfoPanel;
