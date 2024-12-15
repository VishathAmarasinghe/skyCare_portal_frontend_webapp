import { Button, Stack } from '@mui/material'
import React, { useEffect, useState } from 'react'
import AppointmentTable from '../AppointmentTable';
import AddNewAppointmentModal from '../../modal/AddNewAppointmentModal';
import { useSearchParams } from 'react-router-dom'
import { State } from '../../../../types/types'
import { useAppDispatch, useAppSelector } from '../../../../slices/store'
import { fetchAppointmentsByClientID, fetchAppointmentTypes, resetSelectedAppointment } from '@slices/AppointmentSlice/appointment';


const AppointmentsTab = () => {
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const clientID = searchParams.get('clientID');
  const appointmentSlice = useAppSelector((state)=>state?.appointments);
  const dispatch = useAppDispatch();
  const [isEditMode,setIsEditMode]=useState<boolean>(false);

  useEffect(()=>{
    fetchCarePlansRelatedToClient();
  },[clientID])

  useEffect(()=>{
    if(appointmentSlice?.submitState===State.success || appointmentSlice?.updateState===State.success){
      setIsAppointmentModalVisible(false);
      dispatch(resetSelectedAppointment());
      setIsEditMode(false);
    }
  },[appointmentSlice.submitState,appointmentSlice.updateState])

  useEffect(()=>{
      if(appointmentSlice?.selectedAppointment!==null){
        setIsAppointmentModalVisible(true);
      }
  },[appointmentSlice?.selectedAppointment])

  useEffect(()=>{ 
      fetchCarePlansRelatedToClient();
  },[isAppointmentModalVisible])


  const fetchCarePlansRelatedToClient = async () => {
    if (clientID!==null && clientID!==undefined && clientID!=='') {
      dispatch(fetchAppointmentsByClientID(clientID));
      dispatch(fetchAppointmentTypes());
    }
  }
  return (
    <Stack width="100%" height="80%">
      <AddNewAppointmentModal isEditMode={isEditMode} setIsEditMode={setIsEditMode} isAppointmentAddModalVisible={isAppointmentModalVisible} setIsAppointmentAddModalVisible={setIsAppointmentModalVisible}/>
        <Stack width="100%" flexDirection="row" alignItems="end" justifyContent="flex-end">
            <Button variant='contained' onClick={()=>{setIsAppointmentModalVisible(true);setIsEditMode(true)}}>Add Appointments</Button>
        </Stack>
        <Stack width="100%" height="480px">
            <AppointmentTable isCarePlanModalVisible={isAppointmentModalVisible} setIsCarePlanModalVisible={setIsAppointmentModalVisible}/>
        </Stack>
    </Stack>
  )
}

export default AppointmentsTab




