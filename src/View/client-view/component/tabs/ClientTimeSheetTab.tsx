import {
  Avatar,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  CircularProgress,
  Box,
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import {
  ClientDocuments,
  fetchClientDocuments,
  saveClientDocuments,
} from "@slices/clientSlice/client";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { FILE_DOWNLOAD_BASE_URL } from "@config/config";
import TimeSheetTable from "../../../report-view/components/TimeSheetTable";
import ShiftNoteModal from "../../../careGiver-dashboard-view/modal/ShiftNoteModal";
import { Employee, fetchEmployeesByRole } from "@slices/employeeSlice/employee";
import { fetchTimeSheets } from "@slices/shiftNoteSlice/shiftNote";

const ClientTimeSheetTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const clientID = searchParams.get("clientID");
  const clientSlice = useAppSelector((state) => state?.clients);
  const dispatch = useAppDispatch();
  const [shiftModalOpen, setShiftModalOpen] = useState<boolean>(false);
  const [shiftIsEditMode, setShiftIsEditMode] = useState<boolean>(false);
  const [selectedShiftNote, setSelectedShiftNote] = useState<{
    shiftNoteID: string | null;
  }>({ shiftNoteID: null });
  const [pureNew, setPureNew] = useState<boolean>(false);
  const shiftSlice = useAppSelector((state) => state?.shiftNotes);
  const employeeSlice = useAppSelector((state) => state?.employees);
  // State for filters
  const [selectedOption, setSelectedOption] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>(
    dayjs().subtract(7, "day").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const requestIdRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatch(fetchEmployeesByRole("CareGiver"));
  }, [shiftModalOpen]);

  useEffect(() => {
    setEmployees(employeeSlice?.employees);
  }, [employeeSlice?.employees]);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only fetch if we have a valid clientID
    if (clientID) {
      // Add a small delay to prevent rapid successive calls
      timeoutRef.current = setTimeout(() => {
        const currentRequestId = ++requestIdRef.current;
        setIsLoading(true);
        
        dispatch(
          fetchTimeSheets({
            startDate: startDate,
            endDate: endDate,
            employeeID: selectedOption,
            clientID: clientID,
          })
        ).finally(() => {
          // Only update loading state if this is still the latest request
          if (currentRequestId === requestIdRef.current) {
            setIsLoading(false);
          }
        });
      }, 100); // 100ms delay
    }

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    endDate,
    startDate,
    selectedOption,
    clientID,
    shiftModalOpen,
    shiftSlice?.updateState,
    dispatch,
  ]);

  useEffect(() => {
    if (clientID) {
      dispatch(fetchClientDocuments(clientID));
    }
  }, [isModalOpen, clientSlice?.submitState, clientSlice?.updateState]);

  // Handlers
  const handleOptionChange = (event: SelectChangeEvent<string>) => {
    setSelectedOption(event.target.value as string);
  };

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  return (
    <Stack width="100%" height="100%">
      <Stack width="100%" height="95%" mt={1}>
        <Grid
          container
          width={"100%"}
          height="10%"
          spacing={2}
          alignItems="center"
        >
          {/* Selector */}
          <Grid item xs={12} sm={4} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Care Giver</InputLabel>
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
              <Select
                value={selectedOption}
                onChange={handleOptionChange}
                displayEmpty
                variant="outlined"
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="all">All</MenuItem>
                {employees?.map((emp) => (
                  <MenuItem key={emp?.employeeID} value={emp?.employeeID}>
                    <Chip
                      avatar={
                        <Avatar
                          src={
                            emp?.profile_photo
                              ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                                  emp?.profile_photo
                                )}`
                              : ""
                          } // Replace with your avatar URL logic
                          alt={emp?.firstName}
                        >
                          {emp.email?.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      label={`${emp?.firstName} ${emp?.lastName}`}
                      variant="outlined"
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Start Date */}
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth
              size="small"
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
              size="small"
              value={endDate}
              onChange={handleEndDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
        <Stack width={"100%"} height={"100%"} position="relative">
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                zIndex: 1000,
              }}
            >
              <Stack alignItems="center" spacing={2}>
                <CircularProgress size={40} />
                <Box sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                  Loading time sheets...
                </Box>
              </Stack>
            </Box>
          )}
          <TimeSheetTable
            setPureNew={setPureNew}
            isNoteModalVisible={shiftModalOpen}
            setIsNoteModalVisible={setShiftModalOpen}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ClientTimeSheetTab;
