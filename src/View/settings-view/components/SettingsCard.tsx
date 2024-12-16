import React from "react";
import { Card, CardContent, Typography, Avatar, Box } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import { set } from "date-fns";
import { SettingsCardTitle } from "../../../types/types";

interface SettingsCardProps {
  title: SettingsCardTitle;
  icon: React.ElementType;
  subText: string;
  setDrawerType?: React.Dispatch<React.SetStateAction<SettingsCardTitle | null>>;
  setDrawerOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  drawerOpen?: boolean;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, icon: Icon, subText,setDrawerOpen,setDrawerType,drawerOpen }) => {
  return (
    <Card
     onClick={() => {
       if (setDrawerOpen && !drawerOpen) {
         setDrawerOpen(true);
         if (setDrawerType) {
           setDrawerType(title);
         }
       }
     }}
      elevation={3}
      sx={{
        display: "flex",
        // backgroundColor: theme => theme.palette.background.default,
        alignItems: "center",
        padding: 2,
        gap: 2,
        borderRadius: 2,
        "&:hover": {
          boxShadow: 6,
        },
      }}
    >
      {/* Left Side: Icon */}
      <Avatar
        sx={{
          backgroundColor: (theme) => theme.palette.primary.main,
          color: (theme) => "white",
          width: 46,
          height: 46,
        }}
      >
        <Icon/>
      </Avatar>

      {/* Right Side: Title and Subtext */}
      <CardContent sx={{ padding: 0, flex: 1 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", marginBottom: 0.5 }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subText}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SettingsCard;
