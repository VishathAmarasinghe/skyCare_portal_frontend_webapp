import { Button, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import IncidentTable from "./components/IncidentTable";
import IncidentModal from "./modal/IncidentModal";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import { APPLICATION_CARE_GIVER } from "../../config/config";
import {
  fetchAllIncidents,
  fetchAllIncidentsByEmployeeId,
  fetchAllIncidentStatus,
  fetchAllIncidentTypes,
} from "../../slices/incidentSlice/incident";

const IncidentView = () => {
  const theme = useTheme();
  const [isIncidentModalOpen, setIsIncidentModalOpen] =
    useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const incidentSlice = useAppSelector((state) => state?.incident);
  const authRoles = useAppSelector((State) => State?.auth?.roles);
  const authUserInfo = useAppSelector((state) => state?.auth?.userInfo);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAllIncidentTypes());
    dispatch(fetchAllIncidentStatus());
  }, []);

  useEffect(() => {
    if (authRoles?.includes(APPLICATION_CARE_GIVER)) {
      if (authUserInfo?.userID) {
        dispatch(fetchAllIncidentsByEmployeeId(authUserInfo.userID));
      }
    } else {
      dispatch(fetchAllIncidents());
    }
  }, [authRoles, incidentSlice?.submitState, incidentSlice?.updateState]);

  return (
    <Stack
      data-aos="fade-right"
      data-aos-duration="200"
      sx={{
        backgroundColor: theme.palette.background.paper,
        padding: 2,
        borderRadius: 2,
        boxShadow: 1,
      }}
      width="100%"
      height="100%"
    >
      <IncidentModal
        isEditMode={isEditing}
        isIncidentModalVisible={isIncidentModalOpen}
        setIsEditMode={setIsEditing}
        setIsIncidentModalVisible={setIsIncidentModalOpen}
      />
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h6"
        >
          Incidents
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setIsIncidentModalOpen(true), setIsEditing(true);
          }}
        >
          New Incident
        </Button>
      </Stack>
      <Stack width="100%" height="480px">
        <IncidentTable
          isIncidentModalVisible={isIncidentModalOpen}
          setIsIncidentModalOpen={setIsIncidentModalOpen}
        />
      </Stack>
    </Stack>
  );
};

export default IncidentView;
