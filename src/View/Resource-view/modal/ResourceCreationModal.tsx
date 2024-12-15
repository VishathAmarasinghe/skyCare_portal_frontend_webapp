import React, { useEffect, useState } from 'react'
import { Modal } from 'antd';
import {Box, Button, FormControlLabel, IconButton, Switch, Typography} from "@mui/material";
import { State } from '../../../types/types';
import { useAppSelector } from '../../../slices/store';
import AddResourceForm from '../components/ResourceForm';
import { APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN } from '@config/config';

type AddNewNotesModalProps = {
    isResourceModalVisible: boolean;
    setIsResourceModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isEditMode:boolean; 
    setIsEditMode:React.Dispatch<React.SetStateAction<boolean>>;
}
const ResourceCreationModal = ({isResourceModalVisible:isResourceModalVisible,setIsResourceModalVisible: setIsResourceModalVisible,isEditMode,setIsEditMode}:AddNewNotesModalProps) => {

  const resourceSlice = useAppSelector((state)=>state.resource);
  const authRole = useAppSelector((state)=>state.auth.roles);

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditMode(event.target.checked);
  };
    
  return (
    <Modal
    title={
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{resourceSlice?.selectedResource?"Update/View":"Add"} Resources</Typography>
        {
          resourceSlice?.selectedResource!=null && (authRole.includes(APPLICATION_ADMIN) || authRole.includes(APPLICATION_SUPER_ADMIN)) &&
          <FormControlLabel
            control={
              <Switch
                checked={isEditMode}
                onChange={handleToggleChange}
                color="primary"
              />
            }
            label={isEditMode ? 'Edit Mode On' : 'Edit Mode Off'}
            labelPlacement="start"
          />
        }
      </Box>
    }
      width="80%"
      centered
      maskClosable={false}
      open={isResourceModalVisible}
      closable={false}
      onOk={() => setIsResourceModalVisible(false)}
      onCancel={() => setIsResourceModalVisible(false)}
      
      footer={(
        <Box display="flex" justifyContent="end" width="100%">
          <Button variant="outlined" sx={{mr:2}} onClick={()=>setIsResourceModalVisible(false)}>Cancel</Button>
          <Button disabled={!isEditMode} variant='contained' onClick={()=>document.getElementById("resource-submit-button")?.click()}>Save</Button>
        </Box>
      )}
    >
      <Box sx={{ mt: 2 }}  width="100%">
        <AddResourceForm isEditMode={isEditMode} isResourceModalVisible={isResourceModalVisible}/>
      </Box>
    </Modal>
  )
}

export default ResourceCreationModal
