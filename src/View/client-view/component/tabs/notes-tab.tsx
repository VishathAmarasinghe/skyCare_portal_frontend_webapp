import React, { useEffect, useState } from 'react'
import { Button, Stack } from '@mui/material'
import NotesTable from '../NotesTable';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@slices/store';
import { fetchNotes, resetSubmitState } from '@slices/NotesSlice/notes';
import AddNewNotesModal from '../../modal/AddNewNotesModal';
import { State } from '../../../../types/types';

const NotesTab = () => {
  const [isNoteModalVisible, setIsNoteModalVisible] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const clientID = searchParams.get('clientID');
  const dispatch = useAppDispatch();
  const noteState = useAppSelector((state)=>state.notes);


  useEffect(()=>{
    if(noteState.submitState === State.success){
      setIsNoteModalVisible(false);
      resetSubmitState();
      fetchNotesRelatedToClient();
    }
  },[])

  useEffect(()=>{
    fetchNotesRelatedToClient();
  },[clientID])


  const fetchNotesRelatedToClient = async () => {
    if (clientID!==null && clientID!==undefined && clientID!=='') {
      dispatch(fetchNotes(clientID)); 
    }
  }
  return (
    <Stack width="100%" height="80%" border="2px solid red">
        <Stack width="100%" flexDirection="row" alignItems="end" justifyContent="flex-end">
            <Button variant='contained' onClick={()=>setIsNoteModalVisible(true)}>Add Notes</Button>
        </Stack>
        <Stack width="100%" height="480px">
          <AddNewNotesModal isNoteModalVisible={isNoteModalVisible} setIsNoteModalVisible={setIsNoteModalVisible}/>
            <NotesTable/>
        </Stack>
    </Stack>
  )
}

export default NotesTab;
