import Error from "../layout/pages/404";
import MaintenancePage from "../layout/pages/Maintenance";
import { getActiveRoutesV2, routes } from "../route";
import Layout from "../layout/Layout";
import { RootState, useAppSelector } from "../slices/store";
import PreLoader from "../component/common/PreLoader";
import ErrorHandler from "../component/common/ErrorHandler";
import LoginPage from "../layout/pages/LoginPage";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_SUPER_ADMIN,
} from "@config/config";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuthToken } from "@slices/authSlice/auth";
import { State } from "../types/types";
import CareGiverRegistrationPage from "../layout/pages/CareGiverRegistrationPage";
import ForgetPassword from "../layout/pages/ForgetPassword";
import Loader from "@component/common/Loader";

const AppHandler = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { message, type, timestamp } = useAppSelector((state) => state?.common);
  const auth = useAppSelector((state) => state?.auth);

  useEffect(() => {
    console.log("auth toles", auth.roles);
    console.log("system roles ", [
      APPLICATION_ADMIN,
      APPLICATION_SUPER_ADMIN,
      APPLICATION_CARE_GIVER,
    ]);
  }, [auth]);

  const dispatch = useDispatch();

  useEffect(() => {
    checkAuthToken(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (message && timestamp) {
      enqueueSnackbar(message, {
        variant: type,
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });
    }
  }, [message, timestamp]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <Error />,
      children: getActiveRoutesV2(routes, auth?.roles),
    },
  ]);

  const preAuthRoutes = createBrowserRouter([
    {
      path: "/",
      element: <LoginPage />,
      errorElement: <Error />,
    },
    {
      path: "/registration-caregiver",
      element: <CareGiverRegistrationPage />,
    },
    {
      path: "/reset-password",
      element: <ForgetPassword />,
    },
  ]);

  return (
    <>
      {/* <RouterProvider router={registrationRoute} /> */}
      {auth.status === State.idle && <RouterProvider router={preAuthRoutes} />}
      {auth.status === State.loading && (
        <PreLoader isLoading={true} message={auth.statusMessage}></PreLoader>
      )}
      {auth.status === State.success && auth.mode === "active" && (
        <RouterProvider router={router} />
        // <Loader/>
      )}
      {auth.status === State.success && auth.mode === "maintenance" && (
        <MaintenancePage />
      )}
      {auth.status === State.failed && (
        <ErrorHandler
          message={"Sometimes went wrong while authenticating the user :("}
        />
      )}
    </>
  );
};

export default AppHandler;
