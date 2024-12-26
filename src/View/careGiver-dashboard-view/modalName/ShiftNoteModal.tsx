import React, { useEffect, useState } from 'react'
import { Modal } from 'antd';
import {Box, Button, FormControlLabel, IconButton, Switch, Typography} from "@mui/material";
import { useAppSelector } from '../../../slices/store';
import { State } from '../../../types/types';
import ShiftNoteForm from '../components/ShiftNoteForm';

type AddNewNotesModalProps = {
    isNoteModalVisible: boolean;
    setIsNoteModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isEditMode:boolean; 
    setIsEditMode:React.Dispatch<React.SetStateAction<boolean>>;
    selectedShiftNote:{shiftNoteID: string | null };
    setSelectedShiftNote:React.Dispatch<React.SetStateAction<{shiftNoteID: string | null }>>;  
    pureNew:boolean;

};

const ShiftNoteModal = ({selectedShiftNote,setSelectedShiftNote,isNoteModalVisible,setIsNoteModalVisible,isEditMode,setIsEditMode,pureNew}:AddNewNotesModalProps) => {

  const shiftNoteState = useAppSelector((state)=>state.shiftNotes);

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditMode(event.target.checked);
  };
    
  return (
    <Modal
    title={
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{shiftNoteState?.selectedShiftNote?"Update":"Add"} Shift Note</Typography>
        {
          shiftNoteState?.selectedShiftNote!=null &&
          
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
      open={isNoteModalVisible}
      closable={false}
      onOk={() => setIsNoteModalVisible(false)}
      onCancel={() => setIsNoteModalVisible(false)}
      
      footer={(
        <Box display="flex" justifyContent="end" width="100%">
          <Button variant="outlined" sx={{mr:2}} onClick={()=>setIsNoteModalVisible(false)}>Cancel</Button>
          <Button disabled={!isEditMode} variant='contained' onClick={()=>document.getElementById("note-submit-button")?.click()}>Save</Button>
        </Box>
      )}
    >
      <Box sx={{ mt: 2 }}  width="100%">
        <ShiftNoteForm
        pureNew = {pureNew}
        selectedShiftNote={selectedShiftNote} setSelectedShiftNote={setSelectedShiftNote}
        isEditMode={isEditMode} isNoteModalVisible={isNoteModalVisible} key="shiftNote-Add-form"/>
      </Box>
    </Modal>
  )
}

export default ShiftNoteModal
