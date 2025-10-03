import { Button, FormControl, Grid, InputLabel, Select, Stack, TextField, Typography, useTheme } from '@mui/material';
import { fetchClients } from '@slices/clientSlice/client';
import { fetchTimeSheets } from '@slices/shiftNoteSlice/shiftNote';
import { useAppDispatch, useAppSelector } from '@slices/store';
import { State } from '../../../../types/types';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import ShiftNoteModal from '../../../careGiver-dashboard-view/modal/ShiftNoteModal';
import TimeSheetTable from '../../../report-view/components/TimeSheetTable';

const TimeSheetTabs = () => {
    const theme = useTheme();
    const [searchParams] = useSearchParams();
    const employeeID = searchParams.get("employeeID");
    const [shiftModalOpen, setShiftModalOpen] = useState<boolean>(false);
    const [shiftIsEditMode, setShiftIsEditMode] = useState<boolean>(false);
    const [selectedShiftNote, setSelectedShiftNote] = useState<{
      shiftNoteID: string | null;
    }>({ shiftNoteID: null });
    const [pureNew, setPureNew] = useState<boolean>(false);
  
    // State for filters
    const [selectedOption, setSelectedOption] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>(
      dayjs().subtract(7, "day").format("YYYY-MM-DD")
    );
    const [endDate, setEndDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
    
  
    const authRoles = useAppSelector((state) => state?.auth?.roles);
    const authUser = useAppSelector((state) => state?.auth?.userInfo);
    const shiftSlice = useAppSelector((state) => state?.shiftNotes);
    const employeeSlice = useAppSelector((state) => state?.employees);
    const dispatch = useAppDispatch();
  
    useEffect(() => {
      dispatch(fetchClients());
    }, []);
  
  
    useEffect(() => {
      dispatch(
        fetchTimeSheets({
          startDate: startDate,
          endDate: endDate,
          employeeID: employeeID || '',
          clientID:"",
        })
      );
    }, [endDate, startDate, employeeID]);
  
    useEffect(() => {
      if (
        shiftSlice?.submitState === State?.success ||
        shiftSlice?.updateState === State?.success
      ) {
        setShiftModalOpen(false);
        setSelectedShiftNote({ shiftNoteID: null });
        setShiftIsEditMode(false);
        fetchTimeSheets({
          startDate: startDate,
          endDate: endDate,
          employeeID: selectedOption,
          clientID:"",
        })
      }
    }, [shiftSlice?.submitState, shiftSlice?.updateState]);
  
    // Handlers
  
    const handleStartDateChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setStartDate(event.target.value);
    };
  
    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setEndDate(event.target.value);
    };
  
    return (
      <Stack
        width="100%"
      >
        <ShiftNoteModal
          pureNew={pureNew}
          isEditMode={shiftIsEditMode}
          setIsEditMode={setShiftIsEditMode}
          setSelectedShiftNote={setSelectedShiftNote}
          isNoteModalVisible={shiftModalOpen}
          setIsNoteModalVisible={setShiftModalOpen}
          selectedShiftNote={selectedShiftNote}
          foreignDetails={{ careGiverID: null, recurrentID: null }}
        />
        <Stack
          width="100%"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
        </Stack>
        <Stack width="100%" height="440px" mt={1}>
          <Grid container width={"100%"} spacing={2} alignItems="center">  
            {/* Start Date */}
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                name="startDate"
                value={startDate}
                onChange={handleStartDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
  
            {/* End Date */}
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                name="endDate"
                value={endDate}
                onChange={handleEndDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item>
            <Button
            variant="contained"
            onClick={() => {
              setSelectedShiftNote({ shiftNoteID: null }),
                setShiftIsEditMode(true),
                setShiftModalOpen(true),
                setPureNew(true);
            }}
          >
            New Time Sheet
          </Button>
            </Grid>
          </Grid>
          <TimeSheetTable
            setPureNew={setPureNew}
            isNoteModalVisible={shiftModalOpen}
            setIsNoteModalVisible={setShiftModalOpen}
          />
        </Stack>
      </Stack>
    );
}

export default TimeSheetTabs
