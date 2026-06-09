import React from "react";
import { Paper, Stack, Typography } from "@mui/material";

interface KpiCardProps {
  label: string;
  value: number | string;
  helper?: string;
  accent?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, helper, accent }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      borderLeft: 4,
      borderLeftColor: accent || "primary.main",
      minWidth: 140,
      flex: 1,
    }}
  >
    <Typography variant="h5" fontWeight={700}>
      {value}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {label}
    </Typography>
    {helper && (
      <Typography variant="caption" color="text.secondary">
        {helper}
      </Typography>
    )}
  </Paper>
);

export default KpiCard;
