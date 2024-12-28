import React from "react";
import { Button, Stack, Typography, useTheme } from "@mui/material";
import pcImage from "../../assets/images/pcImage.gif";
import { useAppDispatch } from "../../slices/store";
import { logout } from "../../slices/authSlice/auth";

const MobileViewPage = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Stack
      width="100%"
      height="110vh"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundColor: theme?.palette?.background?.default,
        textAlign: "center",
        padding: 2,
        px: { xs: 2, sm: 3 }, // Horizontal padding for responsiveness
      }}
    >
      <img
        src={pcImage}
        alt="Please use a Laptop or PC"
        style={{
          maxWidth: "80%", // Ensure the image doesn't overflow on smaller screens
          height: "auto",
          marginBottom: theme.spacing(3),
        }}
      />
      <Typography
        variant="h4"
        sx={{
          marginBottom: 2,
          fontSize: { xs: "1.5rem", sm: "2rem" }, // Responsive font size
        }}
      >
        Please use a Laptop or PC for a better experience
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 4,
          fontSize: { xs: "0.875rem", sm: "1rem" }, // Responsive font size
          maxWidth: "80%", // Limit text width on mobile for better readability
        }}
      >
        Our application is optimized for desktop and laptop screens. For the
        best user experience, please switch to a larger screen.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogout}
        sx={{
          padding: "10px 20px",
          fontSize: { xs: "0.875rem", sm: "1rem" }, // Responsive font size for button
          maxWidth: "80%", // Limit button width on mobile
        }}
      >
        Logout
      </Button>
    </Stack>
  );
};

export default MobileViewPage;
