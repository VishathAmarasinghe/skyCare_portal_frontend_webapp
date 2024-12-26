import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Switch,
  Typography,
} from "@mui/material";
import AddNoteForm from "../component/AddNoteForm";
import { useAppSelector } from "../../../slices/store";
import { State } from "../../../types/types";

type AddNewNotesModalProps = {
  isNoteModalVisible: boolean;
  setIsNoteModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
};
const AddNewNotesModal = ({
  isNoteModalVisible,
  setIsNoteModalVisible,
  isEditMode,
  setIsEditMode,
}: AddNewNotesModalProps) => {
  const noteState = useAppSelector((state) => state.notes);

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditMode(event.target.checked);
  };

  return (
    <Modal
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {noteState?.selectedNote ? "Update" : "Add"} Notes
          </Typography>
          {noteState?.selectedNote != null && (
            <FormControlLabel
              control={
                <Switch
                  checked={isEditMode}
                  onChange={handleToggleChange}
                  color="primary"
                />
              }
              label={isEditMode ? "Edit Mode On" : "Edit Mode Off"}
              labelPlacement="start"
            />
          )}
        </Box>
      }
      width="80%"
      centered
      maskClosable={false}
      open={isNoteModalVisible}
      closable={false}
      onOk={() => setIsNoteModalVisible(false)}
      onCancel={() => setIsNoteModalVisible(false)}
      footer={
        <Box display="flex" justifyContent="end" width="100%">
          <Button
            variant="outlined"
            sx={{ mr: 2 }}
            onClick={() => setIsNoteModalVisible(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!isEditMode}
            variant="contained"
            onClick={() =>
              document.getElementById("note-submit-button")?.click()
            }
          >
            Save
          </Button>
        </Box>
      }
    >
      <Box sx={{ mt: 2 }} width="100%">
        <AddNoteForm
          isEditMode={isEditMode}
          isNoteModalVisible={isNoteModalVisible}
          key="note-Add-form"
        />
      </Box>
    </Modal>
  );
};

export default AddNewNotesModal;
