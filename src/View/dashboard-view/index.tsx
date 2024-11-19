import { Stack } from "@mui/material";
import React from "react";
import AdminDashboard from "./panel/AdminDashboard";

const DashboardView = () => {
  return <Stack
  width="100%"
  height="100%"
  border="2px solid red"
  >
    <AdminDashboard/>
  </Stack>
};

export default DashboardView;
