import { Button, ButtonGroup, Stack, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import EmployeeTable from "./components/EmployeeTable";

const EmployeeView = () => {
  const theme = useTheme();
  const [selectedUser, setSelectedUser] = useState('staff');
  return (
    <Stack width="100%" border="2px solid red" height="100%">
      <Stack width="100%" flexDirection="row" alignItems="center" justifyContent="space-between">
        <Typography color={theme.palette.primary.main} fontWeight="600" variant="h6">Employees</Typography>
        <Button variant='contained'>New Employee</Button>
      </Stack>
      <Stack width="100%">
        <Stack>
          <ButtonGroup   variant="contained">
            <Button sx={{backgroundColor: selectedUser=="staff"?theme.palette.primary.main:"secondary"}} >Staff</Button>
            <Button sx={{backgroundColor: selectedUser=="admin"?theme.palette.primary.main:"secondary"}} >Admin</Button>
          </ButtonGroup>
        </Stack>
      </Stack>
      <Stack width="100%" height="480px">
        <EmployeeTable/>
      </Stack>

    </Stack>
  )
};

export default EmployeeView;
