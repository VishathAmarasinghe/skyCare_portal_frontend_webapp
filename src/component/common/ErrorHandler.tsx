import React from "react";
import { Grid, Container, alpha, Paper, useTheme, Button } from "@mui/material";
import { ErrorHandlerProps } from "../../types/types";
import StateWithImage from "../ui/StateWithImage";
import companyLogo from "../../assets/images/app_logo.png";
import notFoundImage from "../../assets/images/not-found.svg";

const ErrorHandler = (props: ErrorHandlerProps) => {
  const theme = useTheme();

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
        paddingY: 5,
        position: "relative",
        top: "15vh",
        m: "auto",
        maxWidth: "40vw",
        textAlign: "center", // Center the text
      }}
    >
      <Container maxWidth="sm">
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          gap={3}
        >
          <img alt="logo" width="200" height="auto" src={companyLogo} />
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
              marginTop: 2,
              padding: "10px 20px",
              textTransform: "none",
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
