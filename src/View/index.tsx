import { lazy } from "react";

const dashboardView = lazy(() => import("./dashboard-view"));
const clientView = lazy(() => import("./client-view"));
const appointmentView = lazy(() => import("./appointment-view"));
const carePlanView = lazy(() => import("./careplan-view"));
const EmployeeView = lazy(() => import("./employee-view"));
const reportView = lazy(() => import("./report-view"));
const resourceView = lazy(() => import("./resource-view"));
const incidentView = lazy(() => import("./incident-view"));
const careGiverDashboardView = lazy(() => import("./careGiver-dashboard-view"));

export const View = {
  dashboardView,
  clientView,
  appointmentView,
  carePlanView,
  EmployeeView,
  reportView,
  resourceView,
  incidentView,
  careGiverDashboardView,
};
