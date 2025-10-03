import { FILE_DOWNLOAD_BASE_URL } from "@config/config";
import {
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Employee,
  fetchCareGiversAssignToClientID,
} from "@slices/employeeSlice/employee";
import { Avatar } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import ClientTimeSheetTable from "./components/ClientTimeSheetTable";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { fetchExportTimeSheets, fetchTimeSheets } from "@slices/shiftNoteSlice/shiftNote";
import ClientTimeSheetCardList from "./components/ClientTimeSheetCard";

const ClientTimeSheetView = () => {
  const theme = useTheme();
  const authSlice = useAppSelector((state) => state?.auth);
  const shiftSlice = useAppSelector((state) => state?.shiftNotes);
  const employeeSlice = useAppSelector((state) => state?.employees);
  const dispatch = useAppDispatch();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shiftModalOpen, setShiftModalOpen] = useState<boolean>(false);

  const [selectedOption, setSelectedOption] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>(
    dayjs().subtract(7, "day").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [pendingOnly, setPendingOnly] = useState<boolean>(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    dispatch(
      fetchCareGiversAssignToClientID(authSlice?.userInfo?.userID || "")
    );
  }, [shiftModalOpen]);

  useEffect(() => {
    if (employeeSlice?.employees?.length>0) {
      setEmployees(employeeSlice?.employees);
    }
  }, [employeeSlice?.employees]);

  useEffect(() => {
    const thunk = pendingOnly ? fetchExportTimeSheets : fetchTimeSheets;
    dispatch(
      thunk({
        startDate: startDate,
        endDate: endDate,
        employeeID: selectedOption,
        clientID: authSlice?.userInfo?.userID || "",
      })
    );
  }, [
    endDate,
    startDate,
    selectedOption,
    shiftModalOpen,
    shiftSlice?.updateState,
    pendingOnly,
  ]);

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
      </Stack>
      <Stack width="100%" height="90%" mt={1}>
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
        <Grid container width={"100%"} spacing={2} alignItems="center" mt={1}>
          <Grid item>
            <FormControlLabel
              control={<Checkbox checked={pendingOnly} onChange={(e) => setPendingOnly(e.target.checked)} />}
              label="Get only pending payment timesheets"
            />
          </Grid>
        </Grid>
        <Stack width={"100%"} height={"90%"}>
        {isMobile ? (
            <Stack width={"100%"} sx={{ overflowY: "auto",height:"90%",mt:13 }}>
              <ClientTimeSheetCardList />
            </Stack>
          ) : (
            <ClientTimeSheetTable
              isNoteModalVisible={shiftModalOpen}
              setIsNoteModalVisible={setShiftModalOpen}
              showExportButton={pendingOnly}
            />
          )}
         
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ClientTimeSheetView;
