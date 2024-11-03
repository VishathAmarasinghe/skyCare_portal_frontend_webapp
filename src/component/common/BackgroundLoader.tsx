
import React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { Typography } from "@mui/material";
import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

const BackgroundLoader = (props: {
  open: boolean;
  message: string | null;
  linearProgress?: {
    total: number;
    completed: number;
    action?: () => void;
  };
}) => {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        display: "flex",
        flexDirection: "column",
      }}
      open={props.open}
    >
      {!props.linearProgress && (
        <>
          <CircularProgress color="inherit" />
          <Typography variant="h5" sx={{ marginTop: "20px" }}>
            {props.message}
          </Typography>
        </>
      )}
      {props.linearProgress && (
        <Box sx={{ width: "40%" }}>
          <LinearProgressWithLabel
            value={
              (props.linearProgress.completed / props.linearProgress.total) *
              100
            }
          />
          <Typography variant="h5" sx={{ marginTop: "20px" }}>
            {props.message}
          </Typography>
        </Box>
      )}
    </Backdrop>
  );
};

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default BackgroundLoader;
