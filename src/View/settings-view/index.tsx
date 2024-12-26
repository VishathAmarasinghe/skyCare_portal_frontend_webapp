import React, { useEffect, useState } from "react";
import { Grid, Stack, Typography, useTheme } from "@mui/material";
import { SETTINGS_CARD_ARRAY } from "../../constants/index";
import SettingsCard from "./components/SettingsCard";
import SettingsDrawer from "./Drawers/SettingsDrawer";
import { SettingsCardTitle } from "../../types/types";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import {
  fetchClassifications,
  fetchClientStatus,
  fetchClientTypes,
  fetchLanguages,
} from "../../slices/selectorSlice/selector";
import { fetchCarePlanStatusList } from "../../slices/carePlanSlice/carePlan";
import { fetchAppointmentTypes } from "../../slices/appointmentSliceName/appointment";
import {
  fetchAllIncidentActionTypeQuestions,
  fetchAllIncidentStatus,
  fetchAllIncidentTypes,
} from "../../slices/incidentSliceName/incident";
import {
  fetchDocumentTypes,
  fetchPaymentTypes,
} from "../../slices/careGiverSliceName/careGiver";

const SettingsView = () => {
  const theme = useTheme();
  const [drawerType, setDrawerType] = useState<SettingsCardTitle | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const selectorSlice = useAppSelector((state) => state?.selector);
  const carePlanSlice = useAppSelector((state) => state?.carePlans);
  const appointmentSlice = useAppSelector((state) => state?.appointments);
  const incidentSlice = useAppSelector((state) => state?.incident);
  const careGiverSlice = useAppSelector((state) => state?.careGivers);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (drawerOpen) {
      dispatch(fetchLanguages());
      dispatch(fetchClientTypes());
      dispatch(fetchClientStatus());
      dispatch(fetchClassifications());
      dispatch(fetchCarePlanStatusList());
      dispatch(fetchAppointmentTypes());
      dispatch(fetchAllIncidentStatus());
      dispatch(fetchAllIncidentTypes());
      dispatch(fetchAllIncidentActionTypeQuestions());
      dispatch(fetchDocumentTypes());
      dispatch(fetchPaymentTypes());
    }
  }, [
    drawerOpen,
    selectorSlice?.submitState,
    selectorSlice?.updateState,
    carePlanSlice?.submitState,
    carePlanSlice?.updateState,
    appointmentSlice?.submitState,
    appointmentSlice?.updateState,
    incidentSlice?.submitState,
    incidentSlice?.updateState,
    careGiverSlice?.submitState,
    careGiverSlice?.updateState,
    appointmentSlice?.updateState,
    appointmentSlice?.submitState,
    incidentSlice?.submitState,
    incidentSlice?.updateState,
  ]);
  return (
    <Stack
      width={"100%"}
      height={"100%"}
      //   border={"2px solid red"}
      sx={{
        // backgroundColor: "white",
        // boxShadow: 1,
        borderRadius: 2,
        padding: 2,
      }}
    >
      <Stack
        width={"100%"}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h6"
        >
          Settings
        </Typography>
      </Stack>
      <Grid container spacing={2}>
        {SETTINGS_CARD_ARRAY.map((item, index) => (
          <Grid item xs={12} mt={2} sm={6} md={4} key={index}>
            <SettingsCard
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
              setDrawerType={setDrawerType}
              title={item.title}
              icon={item.icon}
              subText={item.subText}
            />
          </Grid>
        ))}
      </Grid>
      <SettingsDrawer
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        title={drawerType}
        settingType={drawerType}
        setSettingType={setDrawerType}
      />
    </Stack>
  );
};

export default SettingsView;
