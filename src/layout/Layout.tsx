// Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import { Suspense, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Header from "./header";
import Sidebar from "./sidebar";
import {
  Outlet,
  useLocation,
  useNavigate,
  matchRoutes,
} from "react-router-dom";
import { routes } from "../route";

import ConfirmationModalContextProvider from "../context/DialogContext";
import { useSnackbar } from "notistack";
import pJson from "../../package.json";
import { RootState, useAppSelector } from "../slices/store";
import { Typography } from "@mui/material";
import {
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_SUPER_ADMIN,
} from "@config/config";
import PreLoader from "@component/common/PreLoader";
import { selectRoles } from "@slices/authSlice/Auth";

export default function Layout() {
  //snackbar configuration
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const userRoles = useAppSelector(selectRoles);

  useEffect(() => {
    if (localStorage.getItem("hris-app-redirect-url")) {
      navigate(localStorage.getItem("hris-app-redirect-url") as string);
      localStorage.removeItem("hris-app-redirect-url");
    }
  }, []);

  const location = useLocation();
  const matches = matchRoutes(routes, location.pathname);
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  return (
    <ConfirmationModalContextProvider>
      <Box sx={{ display: "flex" }}
      data-aos="fade-up"
      data-aos-duration="200"
      >
        <CssBaseline />

        <Sidebar
          roles={userRoles}
          currentPath={location.pathname}
          open={open}
          handleDrawer={() => setOpen(!open)}
          theme={theme}
        />
        <Header />

        <Box
          component="main"
          className="Hello"
          sx={{
            flexGrow: 1,
            height: "100vh",
            p: 3,
            pt: 9,
            pb: 6,
          }}
        >
          <Suspense fallback={<PreLoader isLoading={true} message={"Loading"} />}>
            <Outlet />
          </Suspense>
          <Box
            className="layout-note"
            sx={{
              background:
                theme.palette.mode === "light"
                  ? (theme) =>
                      alpha(
                        theme.palette.secondary.main,
                        theme.palette.action.activatedOpacity
                      )
                  : "#0d0d0d",
            }}
          >
            <Typography variant="h6" sx={{ color: "#919090" }}>
              v {pJson.version} | © {new Date().getFullYear()} Sky Care
              Solutions
            </Typography>
          </Box>
        </Box>
      </Box>
    </ConfirmationModalContextProvider>
  );
}
