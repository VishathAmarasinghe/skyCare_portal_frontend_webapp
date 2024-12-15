import { Button, Stack, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import IncidentTable from "./components/IncidentTable";
import IncidentModal from "./modal/IncidentModal";

const IncidentView = () => {
  const theme = useTheme();
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <Stack
    data-aos="fade-right"
    data-aos-duration="200"
    width="100%" border="2px solid red" height="100%">
      <IncidentModal isEditMode={isEditing} isIncidentModalVisible={isIncidentModalOpen} setIsEditMode={setIsEditing} setIsIncidentModalVisible={setIsIncidentModalOpen}/>
      <Stack width="100%" flexDirection="row" alignItems="center" justifyContent="space-between">
        <Typography color={theme.palette.primary.main} fontWeight="600" variant="h6">Incidents</Typography>
        <Button variant='contained' onClick={()=>{setIsIncidentModalOpen(true),setIsEditing(true)}}>New Incident</Button>
      </Stack>
      <Stack width="100%" height="480px">
        <IncidentTable/>
      </Stack>

    </Stack>
  )
};

export default IncidentView;
