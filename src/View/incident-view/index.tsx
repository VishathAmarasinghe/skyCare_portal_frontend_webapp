import { Button, Stack, Typography, useTheme, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import IncidentTable from "./components/IncidentTable";
import IncidentModal from "./modal/IncidentModal";
import IncidentReport from "./components/IncidentReport";
import { Close } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import { APPLICATION_CARE_GIVER } from "../../config/config";
import {
  fetchAllIncidents,
  fetchAllIncidentsByEmployeeId,
  fetchAllIncidentStatus,
  fetchAllIncidentTypes,
  fetchAllIncidentActionTypeQuestions,
  Incidents,
  fetchSingleIncident,
} from "../../slices/incidentSlice/incident";
import { fetchClients } from "../../slices/clientSlice/client";
import { fetchMetaEmployees } from "../../slices/employeeSlice/employee";

const IncidentView = () => {
  const theme = useTheme();
  const [isIncidentModalOpen, setIsIncidentModalOpen] =
    useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<Incidents | null>(null);
  const incidentSlice = useAppSelector((state) => state?.incident);
  const authRoles = useAppSelector((State) => State?.auth?.roles);
  const authUserInfo = useAppSelector((state) => state?.auth?.userInfo);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAllIncidentTypes());
    dispatch(fetchAllIncidentStatus());
    dispatch(fetchAllIncidentActionTypeQuestions());
    dispatch(fetchClients()); // Fetch all clients to populate client data
    dispatch(fetchMetaEmployees()); // Fetch all employees to populate employee data
  }, [dispatch]);

  useEffect(() => {
    if (authRoles?.includes(APPLICATION_CARE_GIVER)) {
      if (authUserInfo?.userID) {
        dispatch(fetchAllIncidentsByEmployeeId(authUserInfo.userID));
      }
    } else {
      dispatch(fetchAllIncidents());
    }
  }, [authRoles, incidentSlice?.submitState, incidentSlice?.updateState, dispatch, authUserInfo?.userID]);

  const handleViewReport = (incident: Incidents) => {
    setSelectedIncident(incident);
    setShowReport(true);
    dispatch(fetchSingleIncident(incident?.incidentID));
  };

  const handleCloseReport = () => {
    setShowReport(false);
    setSelectedIncident(null);
  };

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
        height="9%"
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
            setIsIncidentModalOpen(true);
            setIsEditing(true);
          }}
        >
          New Incident
        </Button>
      </Stack>
      <Stack width="100%" height="100%">
        <IncidentTable
          setIsIncidentModalOpen={setIsIncidentModalOpen}
          onViewReport={handleViewReport}
        />
      </Stack>

      {/* Report Modal */}
      <Dialog
        open={showReport}
        onClose={handleCloseReport}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <IconButton
            onClick={handleCloseReport}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedIncident && incidentSlice?.selectedIncident && (
            <IncidentReport 
              incident={incidentSlice?.selectedIncident} 
              onClose={handleCloseReport}
            />
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default IncidentView;
