import React, { useEffect, useState } from "react";
import { Grid, Stack, Typography, useTheme } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { SETTINGS_CARD_ARRAY } from "../../constants/index";
import SettingsCard from "./components/SettingsCard";
import SettingsDrawer from "./Drawers/SettingsDrawer";
import AgreementSettingsDrawer, {
  isAgreementSetting,
} from "./AgreementSettingsDrawer";
import ComplianceSettingsDrawer, {
  isComplianceSetting,
} from "./ComplianceSettingsDrawer";
import GeneralSettingsDrawer, {
  isGeneralSetting,
} from "./GeneralSettingsDrawer";
import { SettingsCardTitle } from "../../types/types";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import {
  fetchClassifications,
  fetchClientStatus,
  fetchClientTypes,
  fetchLanguages,
} from "../../slices/selectorSlice/selector";
import { fetchCarePlanStatusList } from "../../slices/carePlanSlice/carePlan";
import { fetchAppointmentTypes } from "../../slices/appointmentSlice/appointment";
import {
  fetchAllIncidentActionTypeQuestions,
  fetchAllIncidentStatus,
  fetchAllIncidentTypes,
} from "../../slices/incidentSlice/incident";
import {
  fetchDocumentTypes,
  fetchPaymentTypes,
} from "../../slices/careGiverSlice/careGiver";
import { fetchHomeMessageSetting } from "../../slices/appSettingsSlice/appSettings";

const SettingsView = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerType, setDrawerType] = useState<SettingsCardTitle | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const agreementTemplateId = searchParams.get("templateId");
  const agreementVersionId = searchParams.get("versionId");

  const selectorSlice = useAppSelector((state) => state?.selector);
  const carePlanSlice = useAppSelector((state) => state?.carePlans);
  const appointmentSlice = useAppSelector((state) => state?.appointments);
  const incidentSlice = useAppSelector((state) => state?.incident);
  const careGiverSlice = useAppSelector((state) => state?.careGivers);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (searchParams.get("agreementTemplates")) {
      setDrawerType("Agreement Templates");
      setDrawerOpen(true);
    }
  }, [searchParams]);

  const handleAgreementDrawerClose = () => {
    setDrawerOpen(false);
    if (searchParams.get("agreementTemplates")) {
      searchParams.delete("agreementTemplates");
      searchParams.delete("templateId");
      searchParams.delete("versionId");
      setSearchParams(searchParams, { replace: true });
    }
  };

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
      dispatch(fetchHomeMessageSetting());
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
        // border={"2px solid red"}
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
        height="9%"
      >
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h6"
        >
          Settings
        </Typography>
      </Stack>
      <Grid width={"100%"} height={"100%"} container spacing={2}>
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
        open={drawerOpen && !isAgreementSetting(drawerType) && !isComplianceSetting(drawerType) && !isGeneralSetting(drawerType)}
        title={drawerType}
        settingType={drawerType}
        setSettingType={setDrawerType}
      />
      <GeneralSettingsDrawer
        open={drawerOpen && isGeneralSetting(drawerType)}
        title={drawerType}
        onClose={() => setDrawerOpen(false)}
      />
      <ComplianceSettingsDrawer
        open={drawerOpen && isComplianceSetting(drawerType)}
        title={drawerType}
        onClose={() => setDrawerOpen(false)}
      />
      <AgreementSettingsDrawer
        open={drawerOpen && isAgreementSetting(drawerType)}
        title={drawerType}
        onClose={handleAgreementDrawerClose}
        templateId={agreementTemplateId}
        versionId={agreementVersionId}
      />
    </Stack>
  );
};

export default SettingsView;
