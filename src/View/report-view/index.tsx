import React, { useEffect, useState, useMemo } from "react";
import {
  Stack,
  Typography,
  useTheme,
  TextField,
  Avatar,
  Chip,
  Grid,
  Button,
  Autocomplete,
  Box,
  IconButton,
} from "@mui/material";
import { Clear } from "@mui/icons-material";
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
import { fetchClients } from "@slices/clientSlice/client";

const ReportView = () => {
  const theme = useTheme();
  const [shiftModalOpen, setShiftModalOpen] = useState<boolean>(false);
  const [shiftIsEditMode, setShiftIsEditMode] = useState<boolean>(false);
  const [selectedShiftNote, setSelectedShiftNote] = useState<{
    shiftNoteID: string | null;
  }>({ shiftNoteID: null });
  const [pureNew, setPureNew] = useState<boolean>(false);

  // State for filters
  const [selectedOption, setSelectedOption] = useState<Employee | null>(null);
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
  }, [shiftModalOpen]);

  useEffect(() => {
    setEmployees(employeeSlice?.employees);
  }, [employeeSlice?.employees]);

  // Sort employees in ascending order by first name and add "All" option
  const sortedEmployees = useMemo(() => {
    if (!employees) return [];
    const sorted = [...employees].sort((a, b) => 
      (a?.firstName || "").localeCompare(b?.firstName || "")
    );
    // Add "All" option at the beginning
    const allOption: Employee = {
      employeeID: "all",
      firstName: "All",
      lastName: "",
      email: "",
      password: "",
      accessRole: "",
      joinDate: "",
      profile_photo: "",
      status: "",
      employeeAddresses: [],
      employeeJobRoles: [],
      employeePhoneNo: [],
      emergencyPhoneNo: "",
      emergencyUser: ""
    };
    return [allOption, ...sorted];
  }, [employees]);

  useEffect(() => {
    dispatch(
      fetchTimeSheets({
        startDate: startDate,
        endDate: endDate,
        employeeID: selectedOption?.employeeID || "all",
        clientID: "",
      })
    );
  }, [endDate, startDate, selectedOption,shiftModalOpen,shiftSlice?.updateState]);

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
        employeeID: selectedOption?.employeeID || "all",
        clientID: "",
      })
    }
  }, [shiftSlice?.submitState, shiftSlice?.updateState]) ;

  // Handlers
  const handleOptionChange = (event: any, newValue: Employee | null) => {
    setSelectedOption(newValue);
  };

  const handleClearSelection = () => {
    setSelectedOption(null);
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
        height={"9%"}
      >
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h6"
        >
          Time Sheets
        </Typography>
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
      </Stack>
      <Stack width="100%" height="90%" mt={1}>
        <Grid container width={"100%"} height="10%" spacing={2} alignItems="center">
          {/* Selector */}
          <Grid item xs={12} sm={4} md={6}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Autocomplete
                fullWidth
                size="small"
                options={sortedEmployees}
                value={selectedOption}
                onChange={handleOptionChange}
                getOptionLabel={(option) => `${option?.firstName} ${option?.lastName}`}
                isOptionEqualToValue={(option, value) => option?.employeeID === value?.employeeID}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Care Giver"
                    placeholder="Search care givers..."
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    {option.employeeID === "all" ? (
                      <Chip
                        label="All Care Givers"
                        variant="outlined"
                        color="primary"
                      />
                    ) : (
                      <Chip
                        avatar={
                          <Avatar
                            src={
                              option?.profile_photo
                                ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                                    option?.profile_photo
                                  )}`
                                : ""
                            }
                            alt={option?.firstName}
                          >
                            {option.email?.charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        label={`${option?.firstName} ${option?.lastName}`}
                        variant="outlined"
                      />
                    )}
                  </Box>
                )}
                noOptionsText="No care givers found"
                clearOnEscape
                selectOnFocus
                handleHomeEndKeys
              />
              {selectedOption && (
                <IconButton
                  aria-label="clear selection"
                  onClick={handleClearSelection}
                  size="small"
                  color="primary"
                >
                  <Clear />
                </IconButton>
              )}
            </Box>
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
        <Stack width={"100%"} height={"100%"}>
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

export default ReportView;
