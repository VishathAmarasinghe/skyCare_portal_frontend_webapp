
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(function Link(
  itemProps,
  ref
) {
  return <RouterLink ref={ref} {...itemProps} role={undefined} />;
});

export default function MaintenancePage() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <img alt="maintenance" src="/maintenance.gif" />
      <Typography variant="h4" style={{ color: "gray" }}>
        Exciting changes are on the way! Our website is currently undergoing a
        transformation to enhance your experience. Please check back soon to see
        the amazing updates.
      </Typography>
    </Box>
  );
}
