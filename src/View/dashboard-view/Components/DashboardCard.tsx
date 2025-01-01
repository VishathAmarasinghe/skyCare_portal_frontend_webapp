import { Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { DashboardCardProps } from "../../../types/types";
import { useNavigate } from "react-router-dom";

// Dashboard Card Component
const DashboardCard = ({
  title,
  value,
  icon: Icon,
  urlLink,
}: DashboardCardProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Stack
      onClick={() => navigate(urlLink)}
      flexDirection="row"
      alignItems="center"
      // width=""
      justifyContent="space-between"
      sx={{
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
        },
        bgcolor: theme.palette.background.paper,
        boxShadow: 1,
        borderRadius: 2,
        borderLeft: 5,
        borderLeftColor: theme.palette.primary.main,
        padding: 1,
      }}
    >
      <Stack
        flexDirection="column"
        alignItems="flex-start"
        justifyContent="space-between"
        ml={1}
      >
        <Typography variant="h5" fontSize={24} fontWeight={600}>
          {value >= 1000 ? value / 1000 + "K" : value}
        </Typography>
        <Typography variant="h6" fontSize={12}>
          {title}
        </Typography>
      </Stack>

      <Stack>
        <Icon
          color="primary"
          sx={{
            fontSize: 30,
          }}
        />
      </Stack>
    </Stack>
  );
};

export default DashboardCard;
