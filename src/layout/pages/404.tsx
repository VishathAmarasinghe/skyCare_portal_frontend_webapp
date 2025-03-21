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

//error page
export default function Error() {
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
      <Typography variant="h1" style={{ color: "gray" }}>
        404
      </Typography>
      <Typography variant="h6" style={{ color: "gray" }}>
        The page you’re looking for doesn’t exist.
      </Typography>
      <Button component={Link} to={"/"} variant="contained">
        Back Home
      </Button>
    </Box>
  );
}
