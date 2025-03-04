import React, { useEffect, useState } from "react";
import appLogo from "../../assets/images/app_logo.png";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { RootState, useAppDispatch, useAppSelector } from "../../slices/store";
import {
  APP_NAME,
  AppConfig,
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_CLIENT,
  APPLICATION_SUPER_ADMIN,
  FILE_DOWNLOAD_BASE_URL,
} from "../../config/config";
import ProfileDrawer from "../../View/dashboard-view/panel/ProfileDrawer";
import { APIService } from "../../utils/apiService";
import { logout } from "../../slices/authSlice/auth";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Employee,
  fetchCurrnetEmployee,
  fetchLoggedClients,
} from "../../slices/employeeSlice/employee";
import { State } from "../../types/types";
import { useNavigate } from "react-router-dom";
import {
  ChatInfo,
  fetchChatListByUser,
  fetchMessageSeen,
  handleIncommingMessages,
  openMessagingSocket,
} from "@slices/chatSlice/chat";
import { message } from "antd";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  //drawer open state
  const [open, setOpen] = useState<boolean>(false);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const authUser = useAppSelector((state) => state.auth.userInfo);
  const auth = useAppSelector((state) => state.auth);
  const roles = useAppSelector((state) => state.auth.roles);
  const employeeSlice = useAppSelector((state: RootState) => state.employees);
  const [currentUserInfo, setCurrentUserInfo] = useState<Employee | null>(null);
  const [chatList, setChatList] = useState<ChatInfo[]>([]);
  const chatSlice = useAppSelector((state) => state?.chat);
  const [subscriberList, setSubscriberList] = useState<number[]>([]);
  const navigate = useNavigate();
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [unseenMessageCount, setUnseenMessageCount] = useState<number>(0);
  const unseenMessages = chatSlice?.unSeenMessages || {};

  useEffect(() => {
    if (authUser?.userID) {
      dispatch(fetchChatListByUser({ user1: authUser?.userID }));
      dispatch(openMessagingSocket(authUser?.userID || "", subscriberList));
      if (authUser?.userID) {
        dispatch(fetchMessageSeen({ userId: authUser.userID }));
      }
      if (authUser?.userID.substring(0, 2) === "CU") {
        dispatch(fetchLoggedClients(authUser?.userID));
      } else {
        dispatch(fetchCurrnetEmployee(authUser?.userID));
      }
    }
  }, [authUser?.userID]);



  useEffect(() => {
    if (chatSlice?.unSeenMessages) {
      console.log("unseen messgaes ", chatSlice?.unSeenMessages);

      setUnseenMessageCount(
        Object.values(chatSlice.unSeenMessages).reduce(
          (acc, count) => acc + count,
          0
        )
      );
    }
  }, [chatSlice?.unSeenMessages]);

  useEffect(() => {
    if (chatSlice?.chatList.length > 0) {
      setSubscriberList(chatSlice.chatList.map((chat) => chat.chatID));
      setChatList(chatSlice?.chatList);
      dispatch(
        openMessagingSocket(
          authUser?.userID || "",
          chatSlice?.chatList?.map((chat) => chat.chatID)
        )
      );
    }
  }, [chatSlice?.chatList]);

  useEffect(() => {
    if (chatSlice?.socketMessage?.content) {
      if (chatSlice?.socketMessage?.senderID != auth?.userInfo?.userID) {
        messageApi.info(
          "New Message from " + chatSlice?.socketMessage?.senderName
        );
       

      }
    }
  }, [chatSlice?.socketMessage]);

  useEffect(() => {
    if (employeeSlice.logedEMployee) {

      setCurrentUserInfo(employeeSlice.logedEMployee);
    }
  }, [employeeSlice.logedEMployee]);

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
      } else if (auth?.roles?.includes(APPLICATION_CLIENT)) {
        navigate("/dashboard/client");
      }
    }
  }, [auth?.status, auth?.mode, auth?.roles]);

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Open Notification Menu
  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  // Close Notification Menu
  const handleCloseNotifications = () => {
    setNotificationAnchorEl(null);
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
        {contextHolder}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onToggleSidebar}
            sx={{ ml: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
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
              <IconButton onClick={handleOpenNotifications}>
                <Badge badgeContent={unseenMessageCount} color="error">
                  <NotificationsIcon color="primary" />
                </Badge>
              </IconButton>
              <Menu
                anchorEl={notificationAnchorEl}
                open={Boolean(notificationAnchorEl)}
                onClose={handleCloseNotifications}
                // sx={{ mt: "40px" }}
              >
                {unseenMessageCount > 0 ? (
                  <List sx={{ width: 300, maxHeight: 400, overflow: "auto" }}>
                    {Object.entries(unseenMessages).map(([chatId, count]) => (
                      <ListItem
                        key={chatId}
                        component="div"
                        onClick={() => {
                          navigate("/chat");
                          setAnchorElUser(null);
                          setNotificationAnchorEl(null);
                        }}
                      >
                        <ListItemText
                          primary={`${chatList?.find((chat)=>chat?.chatID===Number(chatId))?.chatName}`}
                          secondary={`Unseen messages: ${count}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <MenuItem disabled>
                    <Typography>No new messages</Typography>
                  </MenuItem>
                )}
              </Menu>
              {!isMobile && (
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
                      : roles?.includes(APPLICATION_CLIENT)
                      ? "Client"
                      : "Unknown User"}
                  </Typography>
                </Box>
              )}

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
