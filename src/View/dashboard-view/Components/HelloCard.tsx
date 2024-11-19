import React from 'react'
import { Stack, Typography, useTheme } from '@mui/material'
import hellocard from '../../../assets/images/helloCard.png'

const HelloCard = () => {
    const theme = useTheme();
  return (
    <Stack width="100%" 
    flexDirection="row"
    padding={2}
    borderRadius={2}
    justifyContent={'space-between'}
    sx={{backgroundColor:theme.palette.primary.main}}
    >
        <Stack>
            <Typography variant='h4' color='white' fontWeight={700}>Hello Vishath</Typography>
            <Typography variant='h6' color='white'>Welcome to SkyCare Portal</Typography>
        </Stack>
        <Stack width={"5%"}>
            <img src={hellocard} alt='HelloCard'/>
        </Stack>
    </Stack>
  )
}

export default HelloCard
