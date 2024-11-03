import Error from "../layout/pages/404";
import MaintenancePage from "../layout/pages/Maintenance";
import { getActiveRoutesV2, routes } from "../route";
import Layout from "../layout/Layout";
import { RootState, useAppSelector } from "../slices/store";
import PreLoader from "../component/common/PreLoader";
import ErrorHandler from "../component/common/ErrorHandler";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_SUPER_ADMIN,
} from "@config/config";

const AppHandler = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <Error />,
      children: getActiveRoutesV2(routes, [
        APPLICATION_ADMIN,
        APPLICATION_CARE_GIVER,
        APPLICATION_SUPER_ADMIN,
      ]),
    },
  ]);

  return (
    <>
      {/* {auth.status === "loading" && (
        <PreLoader isLoading={true} message={auth.statusMessage}></PreLoader>
      )} */}
      {/* {auth.status === "success" && auth.mode === "active" && ( */}
      <RouterProvider router={router} />
      {/* )} */}
      {/* {auth.status === "success" && auth.mode === "maintenance" && (
        <MaintenancePage />
      )}
      {auth.status === "failed" && (
        <ErrorHandler
          message={"Sometimes went wrong while authenticating the user :("}
        />
      )} */}
    </>
  );
};

export default AppHandler;
