import { Button, Stack, Typography, useTheme } from "@mui/material";
import AddNewCarePlanModal from "@view/client-view/modal/AddNewCarePlanModal";
import React, { useEffect, useState } from "react";
import CarePlanMainTable from "./components/CarePlanMainTable";
import { useAppDispatch } from "@slices/store";
import { fetchAllCarePlans } from "@slices/carePlanSlice/carePlan";
import { fetchClients } from "@slices/clientSlice/client";

const CarePlanView = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  useEffect(()=>{
    dispatch(fetchAllCarePlans());
    dispatch(fetchClients());
  },[isModalVisible])

  const theme = useTheme();
  return <Stack width="100%" 
  data-aos="fade-right"
  data-aos-duration="200"
  sx={{backgroundColor: theme.palette.background.paper, boxShadow: 1, borderRadius: 2,padding:2}}
  height="100%">
    <Stack width="100%" flexDirection="row" alignItems="center" justifyContent="space-between">
    <AddNewCarePlanModal isEditMode={isEditMode} setIsEditMode={setIsEditMode} isCarePlanAddModalVisible={isModalVisible} setIsCarePlanAddModalVisible={setIsModalVisible}/>
      <Typography color={theme.palette.primary.main} fontWeight="600" variant="h6">Care Plans</Typography>
      <Button variant='contained' onClick={()=>{setIsEditMode(true),setIsModalVisible(true)}}>Add Care Plan</Button>
    </Stack>
    <Stack width="100%" height="480px">
        <CarePlanMainTable isCarePlanModalVisible={isModalVisible} setIsCarePlanModalVisible={setIsModalVisible}/>
    </Stack>

  </Stack>
};

export default CarePlanView;
