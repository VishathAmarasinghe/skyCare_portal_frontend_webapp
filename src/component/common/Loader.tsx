import React from 'react'
import { Box, Container, Paper, alpha, useTheme,Grid, Typography, Stack} from "@mui/material"; 
import LinearProgress from '@mui/material/LinearProgress';

const Loader = () => {
    const theme = useTheme();
  return (
    <Stack
    //   variant="elevation"
      sx={{
        // background: alpha(
        //     theme.palette.primary.main,
        //     theme.palette.action.hoverOpacity
        // ),
        display: "flex",
        justifyContent: "center",
        borderRadius: 2,
        paddingY: 2,
        position: "relative",
        top: 310,
        m: "auto",
        maxWidth: "30vw",
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
          <Grid item xs={12}>
            <Typography variant="h6" color="textSecondary">Loading</Typography>
          </Grid>
          <Grid item xs={12} width={"100%"}>
            <LinearProgress />
          </Grid>
        </Grid>
      </Container>
    </Stack>
  )
}

export default Loader
