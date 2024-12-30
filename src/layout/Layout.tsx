import { Suspense, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, alpha, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Loader from "../component/common/Loader";

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
import { selectRoles } from "../slices/authSlice/auth";
import { APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN } from "../config/config";
import MobileViewPage from "./pages/MobileViewPage";

export default function Layout() {
  // Snackbar configuration
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const userRoles = useAppSelector(selectRoles);

  useEffect(() => {
    if (localStorage.getItem("hris-app-redirect-url")) {
      navigate(localStorage.getItem("hris-app-redirect-url") as string);
      localStorage.removeItem("hris-app-redirect-url");
    }
  }, [navigate]);

  const location = useLocation();
  const matches = matchRoutes(routes, location.pathname);
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  // Check if the screen size is mobile (you can adjust the breakpoint as needed)
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ConfirmationModalContextProvider>
      {
        // If user is an admin or super admin and screen size is mobile, show MobileViewPage
        // (userRoles?.includes(APPLICATION_ADMIN) ||
        //   userRoles?.includes(APPLICATION_SUPER_ADMIN)) &&
        isMobile ? (
          <MobileViewPage />
        ) : (
          <Box
            sx={{ display: "flex" }}
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
              <Suspense fallback={<Loader />}>
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
        )
      }
    </ConfirmationModalContextProvider>
  );
}
