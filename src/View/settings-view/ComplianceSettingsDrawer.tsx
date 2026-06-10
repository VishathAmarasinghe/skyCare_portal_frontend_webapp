import React, { useEffect } from "react";
import { Drawer, Tabs } from "antd";
import { Box } from "@mui/material";
import { SettingsCardTitle } from "../../types/types";
import ComplianceLookupPanel from "./components/ComplianceLookupPanel";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import {
  fetchAuthBodies,
  fetchAuthStatuses,
  fetchIntensities,
  fetchRpTypes,
  fetchTrainingCourses,
  fetchTrainingProviders,
} from "../../slices/complianceLookupSlice/complianceLookup";
import { AppConfig } from "../../config/config";

interface ComplianceSettingsDrawerProps {
  open: boolean;
  title: SettingsCardTitle | null;
  onClose: () => void;
}

const COMPLIANCE_SETTINGS: SettingsCardTitle[] = [
  "Staff Training Settings",
  "Behavior Support Settings",
];

export const isComplianceSetting = (title: SettingsCardTitle | null): boolean =>
  title != null && COMPLIANCE_SETTINGS.includes(title);

const ComplianceSettingsDrawer: React.FC<ComplianceSettingsDrawerProps> = ({
  open,
  title,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const lookup = useAppSelector((state) => state.complianceLookup);

  useEffect(() => {
    if (open && isComplianceSetting(title)) {
      if (title === "Staff Training Settings") {
        dispatch(fetchTrainingCourses());
        dispatch(fetchTrainingProviders());
      } else {
        dispatch(fetchRpTypes());
        dispatch(fetchAuthStatuses());
        dispatch(fetchAuthBodies());
        dispatch(fetchIntensities());
      }
    }
  }, [open, title, dispatch, lookup.submitState]);

  const staffTabs = [
    {
      key: "courses",
      label: "Training Courses",
      children: (
        <ComplianceLookupPanel
          title="Training Courses"
          items={lookup.trainingCourses}
          apiUrl={AppConfig.serviceUrls.trainingCourseTypes}
          onRefresh={() => dispatch(fetchTrainingCourses())}
          submitState={lookup.submitState}
        />
      ),
    },
    {
      key: "providers",
      label: "Training Providers",
      children: (
        <ComplianceLookupPanel
          title="Training Providers"
          items={lookup.trainingProviders}
          apiUrl={AppConfig.serviceUrls.trainingProviders}
          onRefresh={() => dispatch(fetchTrainingProviders())}
          submitState={lookup.submitState}
        />
      ),
    },
  ];

  const behaviorTabs = [
    {
      key: "rpTypes",
      label: "RP Types",
      children: (
        <ComplianceLookupPanel
          title="Restrictive Practice Types"
          items={lookup.rpTypes}
          apiUrl={AppConfig.serviceUrls.restrictivePracticeTypes}
          onRefresh={() => dispatch(fetchRpTypes())}
          submitState={lookup.submitState}
        />
      ),
    },
    {
      key: "authStatus",
      label: "Authorisation Status",
      children: (
        <ComplianceLookupPanel
          title="Authorisation Statuses"
          items={lookup.authStatuses}
          apiUrl={AppConfig.serviceUrls.authorisationStatuses}
          onRefresh={() => dispatch(fetchAuthStatuses())}
          submitState={lookup.submitState}
        />
      ),
    },
    {
      key: "authBody",
      label: "Authorising Bodies",
      children: (
        <ComplianceLookupPanel
          title="Authorising Bodies"
          items={lookup.authBodies}
          apiUrl={AppConfig.serviceUrls.authorisingBodies}
          onRefresh={() => dispatch(fetchAuthBodies())}
          submitState={lookup.submitState}
        />
      ),
    },
    {
      key: "intensity",
      label: "Behaviour Intensity",
      children: (
        <ComplianceLookupPanel
          title="Behaviour Intensity"
          items={lookup.intensities}
          apiUrl={AppConfig.serviceUrls.behaviourIntensities}
          onRefresh={() => dispatch(fetchIntensities())}
          submitState={lookup.submitState}
        />
      ),
    },
  ];

  return (
    <Drawer
      title={title || "Settings"}
      placement="right"
      width={Math.min(1100, window.innerWidth * 0.92)}
      onClose={onClose}
      open={open && isComplianceSetting(title)}
      destroyOnClose
      styles={{
        body: {
          height: "calc(100vh - 55px)",
          display: "flex",
          flexDirection: "column",
          paddingBottom: 16,
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          pt: 1,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          "& .ant-tabs": {
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          },
          "& .ant-tabs-content-holder": {
            flex: 1,
            minHeight: 0,
          },
          "& .ant-tabs-tabpane-active": {
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {title === "Staff Training Settings" && <Tabs items={staffTabs} />}
        {title === "Behavior Support Settings" && <Tabs items={behaviorTabs} />}
      </Box>
    </Drawer>
  );
};

export default ComplianceSettingsDrawer;
