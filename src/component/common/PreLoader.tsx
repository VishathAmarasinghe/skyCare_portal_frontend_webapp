import { PreLoaderProps } from "../../types/types";
import companyLogo from "../../assets/images/app_logo.png";
import Grid from "@mui/material/Grid";
import loadingImage from "../../assets/images/Loading.gif";
import { Box, Container, Paper, alpha, useTheme, useMediaQuery } from "@mui/material";
import CircularProgress, {
  circularProgressClasses,
  CircularProgressProps,
} from "@mui/material/CircularProgress";
import StateWithImage from "../ui/StateWithImage";
import LinearProgress from "@mui/material/LinearProgress";

function CustomCircularProgress(props: CircularProgressProps) {
  return (
    <Box sx={{ position: "relative" }}>
      <CircularProgress
        variant="determinate"
        sx={{
          color: (theme) => theme.palette.grey[800],
        }}
        size={40}
        thickness={4}
        {...props}
        value={100}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        sx={{
          color: (theme) => theme.palette.primary.main,
          animationDuration: "550ms",
          position: "absolute",
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: "round",
          },
        }}
        size={40}
        thickness={4}
        {...props}
      />
    </Box>
  );
}

const PreLoader = (props: PreLoaderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      variant="outlined"
      elevation={4}
      sx={{
        background: alpha(
          theme.palette.primary.main,
          theme.palette.action.hoverOpacity
        ),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 2,
        paddingY: isMobile ? 2 : 5,
        position: "relative",
        top: isMobile ? 60 : 120,
        m: "auto",
        maxWidth: isMobile ? "90vw" : "40vw",
      }}
    >
      <Container maxWidth={isMobile ? "xs" : "md"}>
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          gap={isMobile ? 1 : 2}
        >
          <Grid item xs={12}>
            {!props.hideLogo && (
              <img
                alt="logo"
                width={isMobile ? "200" : "320"}
                src={companyLogo}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <StateWithImage imageUrl={loadingImage} message="Loading" />
          </Grid>
          <Grid item xs={12} width="100%">
            {props.isLoading && <LinearProgress />}
          </Grid>
        </Grid>
      </Container>
    </Paper>
  );
};

export default PreLoader;
