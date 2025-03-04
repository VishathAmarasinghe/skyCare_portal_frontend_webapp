import React from "react";
import { RouteObject, NonIndexRouteObject } from "react-router-dom";
// MUI imports
import AttachEmailIcon from "@mui/icons-material/AttachEmail";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import AssessmentIcon from "@mui/icons-material/Assessment";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import SpeakerNotesIcon from "@mui/icons-material/SpeakerNotes";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import SettingsIcon from "@mui/icons-material/Settings";
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SendIcon from '@mui/icons-material/Send';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

// APP imports
import { View } from "./View/index";
import { isIncludedRole } from "./utils/utils";
import {
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_CLIENT,
  APPLICATION_SUPER_ADMIN,
} from "@config/config";

export interface RouteObjectWithRole extends NonIndexRouteObject {
  allowRoles: string[];
  icon:
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | undefined;
  text: string;
  children?: RouteObjectWithRole[];
  bottomNav?: boolean;
}

interface RouteDetail {
  path: string;
  allowRoles: string[];
  icon:
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | undefined;
  text: string;
  bottomNav?: boolean;
}

export const routes: RouteObjectWithRole[] = [
  {
    path: "/dashboard",
    text: "Dashboard",
    icon: React.createElement(DashboardIcon),
    element: React.createElement(View.dashboardView),
    allowRoles: [APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN],
  },
  {
    path: "/dashboard/cg",
    text: "Dashboard",
    icon: React.createElement(DashboardIcon),
    element: React.createElement(View.careGiverDashboardView),
    allowRoles: [APPLICATION_CARE_GIVER],
  },
  {
    path: "/dashboard/client",
    text: "Dashboard",
    icon: React.createElement(DashboardIcon),
    element: React.createElement(View.clientDashboardView),
    allowRoles: [APPLICATION_CLIENT],
  },
  {
    path: "/time-sheets/client",
    text: "Time Sheets",
    icon: React.createElement(AssessmentIcon),
    element: React.createElement(View.clientTimeSheetView),
    allowRoles: [APPLICATION_CLIENT],
  },
  {
    path: "/Clients",
    text: "Clients",
    icon: React.createElement(PeopleAltIcon),
    element: React.createElement(View.clientView),
    allowRoles: [APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN],
    children: [
      {
        path: "clientInfo",
        text: "Client Information",
        icon: undefined,
        element: React.createElement(View.clientView),
        allowRoles: [APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN],
      },
    ],
  },
  {
    path: "/Appointments",
    text: "Apointments",
    icon: React.createElement(CalendarMonthIcon),
    element: React.createElement(View.appointmentView),
    allowRoles: [
      APPLICATION_ADMIN,
      APPLICATION_SUPER_ADMIN,
      APPLICATION_CARE_GIVER,
    ],
  },
  {
    path: "/Allocations",
    text: "Allocations",
    icon: React.createElement(WorkHistoryIcon),
    element: React.createElement(View.CareGiverAllocationsView),
    allowRoles: [APPLICATION_CARE_GIVER],
  },
  {
    path: "/CarePlans",
    text: "Care Plans",
    icon: React.createElement(AssignmentIcon),
    element: React.createElement(View.carePlanView),
    allowRoles: [APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN],
  },
  {
    path: "/Incidents",
    text: "Incidents",
    icon: React.createElement(ListAltIcon),
    element: React.createElement(View.incidentView),
    allowRoles: [
      APPLICATION_ADMIN,
      APPLICATION_SUPER_ADMIN,
      APPLICATION_CARE_GIVER,
    ],
  },
  {
    path: "/Employees",
    text: "Employees",
    icon: React.createElement(EmojiPeopleIcon),
    element: React.createElement(View.EmployeeView),
    allowRoles: [APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN],
    children: [
      {
        path: "employeeInfo",
        text: "Employee Information",
        icon: undefined,
        element: React.createElement(View.EmployeeView),
        allowRoles: [APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN],
      },
    ],
  },
  {
    path: "/time-sheet-Reports",
    text: "Time-Sheet",
    icon: React.createElement(AssessmentIcon),
    element: React.createElement(View.reportView),
    allowRoles: [APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN],
  },
  {
    path: "/Resources",
    text: "Resources",
    icon: React.createElement(StickyNote2Icon),
    element: React.createElement(View.resourceView),
    allowRoles: [
      APPLICATION_ADMIN,
      APPLICATION_SUPER_ADMIN,
      APPLICATION_CARE_GIVER,
    ],
  },
  {
    path: "/time-sheets",
    text: "Time Sheets",
    icon: React.createElement(SpeakerNotesIcon),
    element: React.createElement(View.shiftNoteView),
    allowRoles: [APPLICATION_CARE_GIVER],
  },
  // {
  //   path: "/pending-appointments",
  //   text: "Pending Appointments",
  //   icon: React.createElement(PendingActionsIcon),
  //   element: React.createElement(View.clientPendingAppointments),
  //   allowRoles: [APPLICATION_CLIENT],
  // },
  {
    path: "/past-appointments",
    text: "Past Appointments",
    icon: React.createElement(TaskOutlinedIcon),
    element: React.createElement(View.clientPastAppointmentView),
    allowRoles: [APPLICATION_CLIENT],
  },
  {
    path: "/chat",
    text: "SkyChat",
    icon: React.createElement(SendIcon),
    element: React.createElement(View.skyChatView),
    allowRoles: [APPLICATION_CARE_GIVER,APPLICATION_ADMIN,APPLICATION_SUPER_ADMIN,APPLICATION_CLIENT],
  },
  {
    path: "/settings",
    text: "Settings",
    icon: React.createElement(SettingsIcon),
    element: React.createElement(View.SettingsView),
    allowRoles: [APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN],
  },
  {
    path: "/file-upload",
    text: "File Uploadings",
    icon: React.createElement(DriveFolderUploadIcon),
    element: React.createElement(View.careGiverFileUploadView),
    allowRoles: [APPLICATION_CARE_GIVER],
  },
  {
    path: "/userInfo",
    text: "User Infomation",
    icon: React.createElement(AdminPanelSettingsOutlinedIcon),
    element: React.createElement(View.CareGiverInforView),
    allowRoles: [APPLICATION_CARE_GIVER],
  },
  
];
export const getActiveRoutesV2 = (
  routes: RouteObjectWithRole[] | undefined,
  roles: string[]
): RouteObjectWithRole[] => {
  if (!routes) return [];
  var routesObj: RouteObjectWithRole[] = [];
  routes.forEach((routeObj) => {
    if (isIncludedRole(roles, routeObj.allowRoles)) {
      routesObj.push({
        ...routeObj,
        children: getActiveRoutesV2(routeObj.children, roles),
      });
    }
  });

  return routesObj;
};

export const getActiveRoutes = (roles: string[]): RouteObject[] => {
  var routesObj: RouteObject[] = [];
  routes.forEach((routeObj) => {
    if (isIncludedRole(roles, routeObj.allowRoles)) {
      routesObj.push({
        ...routeObj,
      });
    }
  });
  return routesObj;
};

export const getActiveRouteDetails = (roles: string[]): RouteDetail[] => {
  var routesObj: RouteDetail[] = [];
  routes.forEach((routeObj) => {
    if (isIncludedRole(roles, routeObj.allowRoles)) {
      routesObj.push({
        path: routeObj.path ? routeObj.path : "",
        ...routeObj,
      });
    }
  });
  return routesObj;
};
