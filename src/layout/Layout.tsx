import { Suspense, useEffect, useState } from "react";
import {
  Box,
  CssBaseline,
  Typography,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Outlet,
  useLocation,
  useNavigate,
  matchRoutes,
} from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAppSelector } from "../slices/store";
import { selectRoles } from "../slices/authSlice/auth";
import Loader from "../component/common/Loader";
import Sidebar from "./sidebar";
import Header from "./header";
import MobileViewPage from "./pages/MobileViewPage";
import ConfirmationModalContextProvider from "../context/DialogContext";
import { APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN } from "../config/config";
import { routes } from "../route";
import pJson from "../../package.json";

export default function Layout() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const userRoles = useAppSelector(selectRoles);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const toggleSidebar = () => setSidebarOpen(isMobile ? !sidebarOpen : true);

  useEffect(() => {
    const redirectUrl = localStorage.getItem("hris-app-redirect-url");
    if (redirectUrl) {
      navigate(redirectUrl);
      localStorage.removeItem("hris-app-redirect-url");
    }
  }, [navigate]);

  useEffect(() => {
    // Update sidebar visibility when screen size changes
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  if (
    (userRoles?.includes(APPLICATION_ADMIN) ||
      userRoles?.includes(APPLICATION_SUPER_ADMIN)) &&
    isMobile
  ) {
    return <MobileViewPage />;
  }

  return (
    <ConfirmationModalContextProvider>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <CssBaseline />
        <Header onToggleSidebar={toggleSidebar} />
        <Box
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: isMobile ? "column" : "row",
            overflow: "hidden",
          }}
        >
          {sidebarOpen ? (
            <Sidebar
              roles={userRoles}
              currentPath={location.pathname}
              open={open}
              handleDrawer={() => setOpen(!open)}
              theme={theme}
              toggle={toggleSidebar}
            />
          ) : (
            <></>
          )}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              height: "100%",
              overflowY: "auto",
              p: isMobile ? 2 : 3,
              pt: isMobile ? 8 : 9,
              pb: isMobile ? 3 : 6,
            }}
          >
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
            {!isMobile && (
              <Box
                className="layout-note"
                sx={{
                  background:
                    theme.palette.mode === "light"
                      ? alpha(
                          theme.palette.secondary.main,
                          theme.palette.action.activatedOpacity
                        )
                      : "#0d0d0d",
                  py: 1,
                  width: "100%",

                  // textAlign: "center",
                }}
              >
                <Typography variant="caption" sx={{ color: "#919090" }}>
                  v {pJson.version} | © {new Date().getFullYear()} Sky Care
                  Solutions
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ConfirmationModalContextProvider>
  );
}
