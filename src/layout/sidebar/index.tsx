import React, { useEffect } from "react";
import {
  styled,
  Theme,
  CSSObject,
  alpha,
  useTheme,
} from "@mui/material/styles";
import { MUIStyledCommonProps } from "@mui/system";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import ListLinkItem from "../../component/layout/LinkItem";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { getActiveRouteDetails } from "./../../route";
import { SIDEBAR_WIDTH } from "../../config/ui";
import { useLocation, matchPath, useMatches } from "react-router-dom";
import { ColorModeContext } from "../../App";
import { Stack, Typography } from "@mui/material";
import {
  fetchMetaEmployees,
  fetchMetaEmployeesMapping,
} from "../../slices/employeeSlice/employee";
import { useAppDispatch } from "../../slices/store";

interface SidebarProps {
  open: boolean;
  theme: Theme;
  handleDrawer: () => void;
  roles: string[];
  currentPath: string;
}

function useRouteMatch(patterns: readonly string[]) {
  const { pathname } = useLocation();

  let matches = useMatches();

  for (let i = 0; i < patterns.length; i += 1) {
    const pattern = patterns[i];
    const possibleMatch = matchPath(pattern, pathname);
    if (possibleMatch !== null) {
      return patterns.indexOf(possibleMatch.pattern.path);
    }
  }
  for (let i = 0; i < matches.length; i += 1) {
    if (patterns.indexOf(matches[i].pathname) !== -1) {
      return patterns.indexOf(matches[i].pathname);
    }
  }

  return null;
}

const Sidebar = (props: SidebarProps) => {
  const dispatch = useAppDispatch();
  const currentIndex = useRouteMatch([
    ...getActiveRouteDetails(props.roles).map((r) => r.path),
  ]);
  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchMetaEmployees());
    dispatch(fetchMetaEmployeesMapping());
  }, []);

  return (
    <ColorModeContext.Consumer>
      {(colorMode) => (
        <Drawer
          variant="permanent"
          open={props.open}
          sx={{
            zIndex: 5,
            "& .MuiDrawer-paper": {
              background: alpha(theme.palette.grey[100], 1),
            },
          }}
        >
          <List
            sx={{
              display: "flex",
              flexDirection: "column",
              pt: 7.0,
            }}
          >
            {getActiveRouteDetails(props.roles).map((r, idx) => (
              <div style={{ border: 2, borderColor: "red" }} key={idx}>
                {!r.bottomNav && (
                  <ListLinkItem
                    key={idx}
                    theme={props.theme}
                    to={r.path}
                    primary={r.text}
                    icon={r.icon}
                    open={props.open}
                    isActive={currentIndex === idx}
                  />
                )}
              </div>
            ))}
          </List>
          <DrawerSpace />
          <DrawerFooter>
            <Stack flexDirection={"column"} gap={1}>
              {/* <IconButton
                onClick={colorMode.toggleColorMode}
                color="inherit"
                sx={{
                  color: "white",
                  "&:hover": {
                    background: alpha(props.theme.palette.common.white, 0.05),
                    ...(!props.open && {
                      "& .menu-tooltip": {
                        opacity: 1,
                        visibility: "visible",
                      },
                    }),
                  },
                }}
              >
                {props.theme.palette.mode === "dark" ? (
                  <LightModeOutlinedIcon />
                ) : (
                  <DarkModeOutlinedIcon />
                )}
                <span className="menu-tooltip">
                  <Typography variant="h6">
                    {"Switch to " +
                      (props.theme.palette.mode === "dark" ? "light" : "dark") +
                      " mode"}
                  </Typography>
                </span>
              </IconButton> */}
              <IconButton
                onClick={props.handleDrawer}
                sx={{
                  "&:hover": {
                    background: alpha(props.theme.palette.grey[500], 1),
                    color: "white",
                  },
                }}
              >
                {!props.open ? (
                  <ChevronRightIcon
                    sx={{ color: props.theme.palette.primary.main }}
                  />
                ) : (
                  <ChevronLeftIcon
                    sx={{ color: props.theme.palette.primary.main }}
                  />
                )}
              </IconButton>
            </Stack>
          </DrawerFooter>
        </Drawer>
      )}
    </ColorModeContext.Consumer>
  );
};

export default Sidebar;

interface DrawerHeaderInterface extends MUIStyledCommonProps {
  open: boolean;
}

const DrawerSpace = styled("div")(({ theme }) => ({
  flex: 1,
  ...theme.mixins.toolbar,
}));

export const DrawerFooter = styled("div")(({ theme }) => ({
  position: "relative",
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: SIDEBAR_WIDTH,
  flexShrink: 0,
  display: "flex",
  whiteSpace: "nowrap",
  overflow: "hidden", // Prevent scrolling
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      overflow: "hidden", // Prevent scrolling
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      overflow: "hidden", // Prevent scrolling
    },
  }),
}));

// When sideBar opens
const openedMixin = (theme: Theme): CSSObject => ({
  width: SIDEBAR_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  overflowY: "hidden",
  padding: theme.spacing(0.5),
});

// When sideBar closes
const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: theme.spacing(7),
  padding: theme.spacing(0.5),
});

export const DrawerHeader = styled("div")<DrawerHeaderInterface>(
  ({ theme, open }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0.5),
    transition: theme.transitions.create(["display"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...theme.mixins.toolbar,
    ...(open && {
      justifyContent: "flex-start",
    }),
  })
);
