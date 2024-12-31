import React, { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  useTheme,
  MenuItem,
  Select,
  TextField,
  SelectChangeEvent,
  Avatar,
  Chip,
  Grid,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_SUPER_ADMIN,
  FILE_DOWNLOAD_BASE_URL,
} from "@config/config";
import {
  fetchTimeSheets,
  getAllShiftNotes,
  getAllShiftNotesByEmployeeID,
} from "@slices/shiftNoteSlice/shiftNote";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { State } from "../../types/types";
import ShiftNoteModal from "../careGiver-dashboard-view/modal/ShiftNoteModal";
import TimeSheetTable from "./components/TimeSheetTable";
import dayjs from "dayjs";
import { Employee, fetchEmployeesByRole } from "@slices/employeeSlice/employee";

const ReportView = () => {
  const theme = useTheme();
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchEmployeesByRole("CareGiver"));
  }, []);

  useEffect(() => {
    setEmployees(employeeSlice?.employees);
  }, [employeeSlice?.employees]);

  useEffect(() => {
    dispatch(
      fetchTimeSheets({
        startDate: startDate,
        endDate: endDate,
        employeeID: selectedOption,
      })
    );
  }, [endDate, startDate, selectedOption]);

  useEffect(() => {
    if (
      shiftSlice?.submitState === State?.success ||
      shiftSlice?.updateState === State?.success
    ) {
      setShiftModalOpen(false);
      setSelectedShiftNote({ shiftNoteID: null });
      setShiftIsEditMode(false);
    }
  }, [shiftSlice?.submitState, shiftSlice?.updateState]);

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
    <Stack
      width="100%"
      data-aos="fade-right"
      data-aos-duration="200"
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: 1,
        borderRadius: 2,
        padding: 2,
      }}
      height="100%"
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
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h6"
        >
          Time Sheets
        </Typography>
      </Stack>
      <Stack width="100%" height="480px" mt={1}>
        <Grid container width={"100%"} spacing={2} alignItems="center">
          {/* Selector */}
          <Grid item xs={12} sm={4} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Care Giver</InputLabel>
              <Select
                value={selectedOption}
                onChange={handleOptionChange}
                displayEmpty
                variant="outlined"
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
        </Grid>
        <TimeSheetTable
          setPureNew={setPureNew}
          isNoteModalVisible={shiftModalOpen}
          setIsNoteModalVisible={setShiftModalOpen}
        />
      </Stack>
    </Stack>
  );
};

export default ReportView;
