import { Button, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import IncidentTable from "./components/IncidentTable";

const IncidentView = () => {
  const theme = useTheme();
  return (
    <Stack width="100%" border="2px solid red" height="100%">
      <Stack width="100%" flexDirection="row" alignItems="center" justifyContent="space-between">
        <Typography color={theme.palette.primary.main} fontWeight="600" variant="h6">Incidents</Typography>
        <Button variant='contained'>New Incident</Button>
      </Stack>
      <Stack width="100%" height="480px">
        <IncidentTable/>
      </Stack>

    </Stack>
  )
};

export default IncidentView;
