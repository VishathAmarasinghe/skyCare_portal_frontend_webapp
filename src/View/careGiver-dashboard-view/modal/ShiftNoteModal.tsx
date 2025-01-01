import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { State } from "../../../types/types";
import ShiftNoteForm from "../components/ShiftNoteForm";
import { APPLICATION_CARE_GIVER } from "@config/config";
import { fetchClients, fetchClientsAssociatedToCareGiver } from "@slices/clientSlice/client";

type AddNewNotesModalProps = {
  isNoteModalVisible: boolean;
  setIsNoteModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedShiftNote: { shiftNoteID: string | null };
  setSelectedShiftNote: React.Dispatch<
    React.SetStateAction<{ shiftNoteID: string | null }>
  >;
  foreignDetails: { recurrentID: string | null; careGiverID: string | null };
  pureNew: boolean;
};

const ShiftNoteModal = ({
  selectedShiftNote,
  setSelectedShiftNote,
  isNoteModalVisible,
  setIsNoteModalVisible,
  isEditMode,
  setIsEditMode,
  foreignDetails,
  pureNew,
}: AddNewNotesModalProps) => {
  const theme = useTheme();
  const shiftNoteState = useAppSelector((state) => state.shiftNotes);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
   const dispatch = useAppDispatch();
   const authDate = useAppSelector((state)=>state?.auth);

  useEffect(()=>{
    if (isNoteModalVisible) {
      if (authDate?.roles?.includes(APPLICATION_CARE_GIVER)) {
        if (authDate?.userInfo?.userID) {
          dispatch(fetchClientsAssociatedToCareGiver(authDate.userInfo.userID));
        }else{
          dispatch(fetchClients());
        }
      }
    }
  },[authDate,isNoteModalVisible])


  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditMode(event.target.checked);
  };

  return (
    <Modal
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {shiftNoteState?.selectedShiftNote ? "Update" : "Add"} Time Sheet
          </Typography>
          {shiftNoteState?.selectedShiftNote != null && (
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
      width={isMobile ? "100%" : "80%"}
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
            Submit
          </Button>
        </Box>
      }
    >
      <Box sx={{ mt: 2 }} width="100%">
        <ShiftNoteForm
          foreignDetails={foreignDetails}
          pureNew={pureNew}
          selectedShiftNote={selectedShiftNote}
          setSelectedShiftNote={setSelectedShiftNote}
          isEditMode={isEditMode}
          isNoteModalVisible={isNoteModalVisible}
          key="shiftNote-Add-form"
        />
      </Box>
    </Modal>
  );
};

export default ShiftNoteModal;
