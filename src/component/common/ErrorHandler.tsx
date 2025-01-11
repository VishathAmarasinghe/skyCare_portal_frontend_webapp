import React from "react";
import { Grid, Container, alpha, Paper, useTheme, Button, useMediaQuery } from "@mui/material";
import { ErrorHandlerProps } from "../../types/types";
import StateWithImage from "../ui/StateWithImage";
import companyLogo from "../../assets/images/app_logo.png";
import notFoundImage from "../../assets/images/not-found.svg";

const ErrorHandler = (props: ErrorHandlerProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLoginAgain = () => {
    window.location.reload();
  };

  return (
    <Paper
      variant="elevation"
      elevation={4}
      sx={{
        background: alpha(
          theme.palette.primary.main,
          theme.palette.action.hoverOpacity
        ),
        display: "flex",
        justifyContent: "center",
        alignItems: "center", // Vertically center the content
        flexDirection: "column", // Stack the content vertically
        borderRadius: 2,
        paddingY: isMobile ? 3 : 5,
        position: "relative",
        top: isMobile ? "10vh" : "15vh",
        m: "auto",
        maxWidth: isMobile ? "90vw" : "40vw",
        textAlign: "center", // Center the text
      }}
    >
      <Container maxWidth={isMobile ? "xs" : "sm"}>
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          gap={isMobile ? 2 : 3}
        >
          <img
            alt="logo"
            width={isMobile ? "150" : "200"}
            height="auto"
            src={companyLogo}
          />
        </Grid>

        <Grid item xs={12}>
          <StateWithImage
            message={
              props.message || "Something went wrong! Please try again later."
            }
            imageUrl={notFoundImage}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleLoginAgain}
            sx={{
              marginTop: isMobile ? 1 : 2,
              padding: isMobile ? "8px 16px" : "10px 20px",
              textTransform: "none",
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          >
            Login Again
          </Button>
        </Grid>
      </Container>
    </Paper>
  );
};

export default ErrorHandler;
