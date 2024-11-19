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

// APP imports
import { View } from "./view/index";
import { isIncludedRole } from "./utils/utils";
import {
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_SUPER_ADMIN,
} from "./config/config";

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
    path: "/Dashboard",
    text: "Dashboard",
    icon: React.createElement(DashboardIcon),
    element: React.createElement(View.dashboardView),
    allowRoles: [
      APPLICATION_ADMIN,
      APPLICATION_SUPER_ADMIN,
      APPLICATION_CARE_GIVER,
    ],
  },
  {
    path: "/Clients",
    text: "Clients",
    icon: React.createElement(PeopleAltIcon),
    element: React.createElement(View.clientView),
    allowRoles: [
      APPLICATION_ADMIN,
      APPLICATION_SUPER_ADMIN,
      APPLICATION_CARE_GIVER,
    ],
    children: [
      {
        path:"clientInfo",
        text:"Client Information",
        icon:undefined,
        element:React.createElement(View.clientView),
        allowRoles:[APPLICATION_ADMIN,APPLICATION_SUPER_ADMIN,APPLICATION_CARE_GIVER]
      }
    ]
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
    path: "/CarePlans",
    text: "Care Plans",
    icon: React.createElement(AssignmentIcon),
    element: React.createElement(View.carePlanView),
    allowRoles: [
      APPLICATION_ADMIN,
      APPLICATION_SUPER_ADMIN,
      APPLICATION_CARE_GIVER,
    ],
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
    allowRoles: [
      APPLICATION_ADMIN,
      APPLICATION_SUPER_ADMIN,
      APPLICATION_CARE_GIVER,
    ],
  },
  {
    path: "/Reports",
    text: "Reports",
    icon: React.createElement(AssessmentIcon),
    element: React.createElement(View.reportView),
    allowRoles: [
      APPLICATION_ADMIN,
      APPLICATION_SUPER_ADMIN,
      APPLICATION_CARE_GIVER,
    ],
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
