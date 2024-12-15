import Grid from "@mui/material/Grid";
import { Container, alpha, Paper, useTheme } from "@mui/material";
import { ErrorHandlerProps } from "../../types/types";
import StateWithImage from "../ui/StateWithImage";
import React from "react";
import companyLogo from "../../assets/images/app_logo.png";
import notFoundImage from "../../assets/images/not-found.svg";

const ErrorHandler = (props: ErrorHandlerProps) => {
  const theme = useTheme();
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
        borderRadius: 2,
        paddingY: 5,
        position: "relative",
        top: "15vh",
        m: "auto",
        maxWidth: "40vw",
      }}
    >
      <Container maxWidth="md">
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          gap={2}
        >
          <img alt="logo" width="250" height="auto" src={companyLogo}></img>
        </Grid>
        <Grid item xs={12}>
          <StateWithImage
          
            message={
              props.message || "Something went wrong! Please try again later."
            }
            imageUrl={notFoundImage}
          />
        </Grid>
      </Container>
    </Paper>
  );
};

export default ErrorHandler;
