// Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import React, { useEffect, useState } from "react";
import appLogo from "../../assets/images/app_logo.png";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import {
  AppBar,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";
import { RootState, useAppDispatch, useAppSelector } from "../../slices/store";
import {
  APP_NAME,
  AppConfig,
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_SUPER_ADMIN,
  FILE_DOWNLOAD_BASE_URL,
} from "@config/config";
import ProfileDrawer from "../../View/dashboard-view/panel/ProfileDrawer";
import { APIService } from "@utils/apiService";
import { logout } from "@slices/authSlice/auth";
import { Employee, fetchCurrnetEmployee } from "@slices/employeeSlice/employee";
import { State } from "../../types/types";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  //drawer open state
  const [open, setOpen] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.userInfo);
  const auth = useAppSelector((state) => state.auth);
  const roles = useAppSelector((state) => state.auth.roles);
  const employeeSlice = useAppSelector((state: RootState) => state.employees);
  const [currentUserInfo, setCurrentUserInfo] = useState<Employee | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser?.userID) {
      dispatch(fetchCurrnetEmployee(authUser?.userID));
    }
  }, [authUser?.userID]);

  useEffect(() => {
    if (employeeSlice.logedEMployee) {
      setCurrentUserInfo(employeeSlice.logedEMployee);
    }
  }, [employeeSlice.logedEMployee]);

  console.log("APPP name ", APP_NAME);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  useEffect(() => {
    if (auth?.status === State.success && auth?.mode === "active") {
      if (
        auth?.roles.includes(APPLICATION_ADMIN) ||
        auth?.roles.includes(APPLICATION_SUPER_ADMIN)
      ) {
        navigate("/dashboard");
      } else if (
        auth?.roles.includes(APPLICATION_CARE_GIVER) &&
        auth?.roles.length === 1
      ) {
        navigate("/dashboard/cg");
      }
    }
  }, [auth?.status, auth?.mode, auth?.roles]);

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 10,
        color: "black",

        background: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.common.white
            : "#0d0d0d",
        boxShadow: 1,
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          paddingY: 0.3,
          "&.MuiToolbar-root": {
            pl: 0.3,
          },
        }}
      >
        <img
          alt="SkyCare Portal"
          style={{
            height: "50px",
            maxWidth: "260px",
          }}
          src={appLogo}
        ></img>
        <Typography
          variant="h5"
          sx={{
            ml: 1,
            flexGrow: 1,
            fontWeight: 600,
          }}
        ></Typography>

        <Box sx={{ flexGrow: 0 }}>
          <>
            <Stack flexDirection={"row"} alignItems={"center"} gap={2}>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="flex-end"
                alignItems="end"
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {currentUserInfo?.firstName} {currentUserInfo?.lastName}
                </Typography>
                <Typography variant="body2">
                  {roles.includes(APPLICATION_ADMIN) ||
                  roles.includes(APPLICATION_SUPER_ADMIN)
                    ? "Admin"
                    : roles?.includes(APPLICATION_CARE_GIVER)
                    ? "Care Giver"
                    : "Unknown User"}
                </Typography>
              </Box>
              <Tooltip title="Open settings">
                <Avatar
                  onClick={handleOpenUserMenu}
                  sx={{ border: 2, borderColor: "primary.main" }}
                  src={
                    currentUserInfo?.profile_photo
                      ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                          currentUserInfo?.profile_photo
                        )}`
                      : ""
                  }
                  alt={"Avatar"}
                >
                  {currentUserInfo?.firstName?.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            </Stack>

            <ProfileDrawer
              open={open}
              setOpen={setOpen}
              key={"profile-drawer"}
            />

            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem
                key={"Profile"}
                onClick={() => {
                  setOpen(true), handleCloseUserMenu();
                }}
              >
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem
                key={"logout"}
                onClick={() => {
                  handleCloseUserMenu();
                  dispatch(logout());
                  window.location.href = "/";
                }}
              >
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
