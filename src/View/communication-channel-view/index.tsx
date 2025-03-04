import { Stack, Typography, useTheme } from '@mui/material';
import React from 'react'
import SkyChat from './components/SkyChat';

const index = () => {
    const theme = useTheme();

  return (
    <Stack
      width="100%"
      data-aos="fade-right"
      data-aos-duration="200"
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: 1,
        borderRadius: 2,
        padding: 2,
      }}
      height="100%"
    >
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        height={"9%"}
      >
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h6"
        >
          Sky Chat
        </Typography>
      </Stack>
      <Stack width="100%" height="90%" mt={1}>
            <SkyChat/>
      </Stack>
    </Stack>
  )
}

export default index
