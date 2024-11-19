import { Button, Stack } from '@mui/material'
import React from 'react'
import CarePlanTable from '../CarePlanTable'

const CarePlansTab = () => {
  return (
    <Stack width="100%" height="80%" border="2px solid red">
        <Stack width="100%" flexDirection="row" alignItems="end" justifyContent="flex-end">
            <Button variant='contained'>Add Care Plan</Button>
        </Stack>
        <Stack width="100%" height="480px">
            <CarePlanTable/>
        </Stack>
    </Stack>
  )
}

export default CarePlansTab