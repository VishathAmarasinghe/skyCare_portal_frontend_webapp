import React, { useState } from 'react'
import { Modal } from 'antd';
import {Box, Button} from "@mui/material";
import AddNoteForm from '../component/AddNoteForm';

type AddNewNotesModalProps = {
    isNoteModalVisible: boolean;
    setIsNoteModalVisible: (value: boolean) => void;
}
const AddNewNotesModal = ({isNoteModalVisible,setIsNoteModalVisible}:AddNewNotesModalProps) => {
    
  return (
    <Modal
      title="Add Notes"
      width="80%"
      centered
      open={isNoteModalVisible}
      onOk={() => setIsNoteModalVisible(false)}
      onCancel={() => setIsNoteModalVisible(false)}
      footer={(
        <Box display="flex" justifyContent="end" width="100%">
          <Button variant='contained' onClick={()=>document.getElementById("note-submit-button")?.click()}>Save</Button>
        </Box>
      )}
    >
      <Box sx={{ mt: 2 }}  width="100%">
        <AddNoteForm key="note-Add-form"/>
      </Box>
    </Modal>
  )
}

export default AddNewNotesModal
