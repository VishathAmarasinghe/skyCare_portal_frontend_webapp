import { Button, Stack, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import ClientTable from "../component/ClientTable";
import AddNewClientModal from "../modal/AddNewClientModal";
import { useAppDispatch, useAppSelector } from "@slices/store";
import {fetchClients} from '../../../slices/clientSlice/client';

const ClientTablePanel = () => {
  const theme = useTheme();
  const [isClientAddModalVisible, setIsClientAddModalVisible] = useState<boolean>(false);
  const dispatch  = useAppDispatch();

  useEffect(()=>{
    fetchAllClients();
  },[])

  useEffect(()=>{
    if(!isClientAddModalVisible){
      fetchAllClients();
    }
  },[isClientAddModalVisible])




  const fetchAllClients = async () => {
    console.log('fetching clients');
    
      dispatch(fetchClients());
  }
  


  const handleOpenModel = () => {
    setIsClientAddModalVisible(true);
  }
  return( 
  <Stack width="100%" height="100%" border="2px solid red"
  sx={{
    backgroundColor: theme.palette.background.paper ,

  }}
  >
    
    <Stack width="100%" flexDirection="row" alignItems="end" justifyContent="flex-end">
      <AddNewClientModal  isClientAddModalVisible={isClientAddModalVisible} setIsClientAddModalVisible={setIsClientAddModalVisible}/>
      <Button
      color="primary"
      variant="contained"
      onClick={handleOpenModel}
      >
        Add Client
      </Button>
    </Stack>
    <Stack width="100%" height="80%">
      <ClientTable />
    </Stack>
  </Stack>
)};


export default ClientTablePanel;
