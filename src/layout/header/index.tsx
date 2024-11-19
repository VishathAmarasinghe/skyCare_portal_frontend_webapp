// Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import React, { useState } from "react";
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
import { RootState, useAppSelector } from "../../slices/store";
import { APP_NAME, AppConfig } from "@config/config";
import ProfileDrawer from "../../View/dashboard-view/panel/ProfileDrawer";
import { APIService } from "@utils/apiService";

const Header = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  APIService.initialize(AppConfig.serviceUrls.getUserInfo);

  //drawer open state
  const [open, setOpen] = useState<boolean>(false);

  console.log("APPP name ", APP_NAME);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

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
        {/* <img
          alt="SkyCare Portal"
          style={{
            height: "55px",
            maxWidth: "260px",
          }}
          src={appLogo}
        ></img> */}
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
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Vishath
                </Typography>
                <Typography variant="body2">Admin</Typography>
              </Box>
              <Tooltip title="Open settings">
                <Avatar
                  onClick={handleOpenUserMenu}
                  sx={{ border: 2, borderColor: "primary.main" }}
                  src={""}
                  alt={"Avatar"}
                >
                  {"A"}
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
