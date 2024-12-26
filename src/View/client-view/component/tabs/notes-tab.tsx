import React, { useEffect, useState } from "react";
import { Button, Stack } from "@mui/material";
import NotesTable from "../NotesTable";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../slices/store";
import {
  fetchNotes,
  fetchNotesByClientID,
  resetSubmitState,
  resetSelectedNote,
} from "../../../../slices/notesSliceName/notes";
import AddNewNotesModal from "../../modal/AddNewNotesModal";
import { State } from "../../../../types/types";
import { set } from "date-fns";

const NotesTab = () => {
  const [isNoteModalVisible, setIsNoteModalVisible] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const clientID = searchParams.get("clientID");
  const dispatch = useAppDispatch();
  const noteState = useAppSelector((state) => state.notes);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    if (!isNoteModalVisible) {
      dispatch(resetSelectedNote());
    }
  }, [isNoteModalVisible]);

  useEffect(() => {
    if (!isNoteModalVisible) {
      setIsEditMode(false);
    }
  }, [isNoteModalVisible]);

  useEffect(() => {
    if (noteState.submitState === State.success) {
      dispatch(resetSubmitState());
      setIsNoteModalVisible(false);
      fetchNotesRelatedToClient();
      setIsEditMode(false);
    }
  }, [noteState.submitState]);

  useEffect(() => {
    if (noteState.updateState === State.success) {
      dispatch(resetSubmitState());
      setIsNoteModalVisible(false);
      fetchNotesRelatedToClient();
      setIsEditMode(false);
    }
  }, [noteState.updateState]);

  useEffect(() => {
    if (noteState.deleteState === State.success) {
      dispatch(resetSubmitState());
      fetchNotesRelatedToClient();
    }
  }, [noteState.deleteState]);

  useEffect(() => {
    fetchNotesRelatedToClient();
  }, [clientID]);

  const fetchNotesRelatedToClient = async () => {
    if (clientID !== null && clientID !== undefined && clientID !== "") {
      dispatch(fetchNotesByClientID(clientID));
    }
  };
  return (
    <Stack width="100%" height="80%">
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="end"
        justifyContent="flex-end"
      >
        <Button
          variant="contained"
          onClick={() => {
            setIsNoteModalVisible(true);
            setIsEditMode(true);
          }}
        >
          Add Notes
        </Button>
      </Stack>
      <Stack width="100%" height="480px">
        <AddNewNotesModal
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          isNoteModalVisible={isNoteModalVisible}
          setIsNoteModalVisible={setIsNoteModalVisible}
        />
        <NotesTable
          isNoteModalVisible={isNoteModalVisible}
          setIsNoteModalVisible={setIsNoteModalVisible}
        />
      </Stack>
    </Stack>
  );
};

export default NotesTab;
