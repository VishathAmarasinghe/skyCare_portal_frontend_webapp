import React, { useEffect, useState, useMemo, useRef } from "react";
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
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  fetchExportTimeSheets,
  incrementExportCounts,
  bulkUpdateExportCounts,
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
  const [pendingOnly, setPendingOnly] = useState<boolean>(false);

  const authRoles = useAppSelector((state) => state?.auth?.roles);
  const authUser = useAppSelector((state) => state?.auth?.userInfo);
  const shiftSlice = useAppSelector((state) => state?.shiftNotes);
  const employeeSlice = useAppSelector((state) => state?.employees);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const requestIdRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  // Debug logging
  useEffect(() => {
    console.log("Selected rows updated:", selectedRows);
  }, [selectedRows]);

  // Auto-select all timesheets when pendingOnly checkbox is checked
  useEffect(() => {
    if (pendingOnly && shiftSlice?.timeSheets) {
      const allTimesheetIds = shiftSlice.timeSheets
        .map(ts => ts?.shiftNoteDTO?.noteID)
        .filter(Boolean) as string[];
      setSelectedRows(allTimesheetIds);
    } else if (!pendingOnly) {
      setSelectedRows([]);
    }
  }, [pendingOnly, shiftSlice?.timeSheets]);
  const [bulkConfirmText, setBulkConfirmText] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("");
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
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Add a small delay to prevent rapid successive calls
    timeoutRef.current = setTimeout(() => {
      const currentRequestId = ++requestIdRef.current;
      setIsLoading(true);
      
      const thunk = pendingOnly ? fetchExportTimeSheets : fetchTimeSheets;
      dispatch(
        thunk({
          startDate: startDate,
          endDate: endDate,
          employeeID: selectedOption?.employeeID || "all",
          clientID: "",
        })
      ).finally(() => {
        // Only update loading state if this is still the latest request
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      });
    }, 100); // 100ms delay

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [endDate, startDate, selectedOption, shiftModalOpen, shiftSlice?.updateState, dispatch, pendingOnly]);

  useEffect(() => {
    if (
      shiftSlice?.submitState === State?.success ||
      shiftSlice?.updateState === State?.success
    ) {
      setShiftModalOpen(false);
      setSelectedShiftNote({ shiftNoteID: null });
      setShiftIsEditMode(false);
      
      // Trigger a refresh of time sheets after successful operations
      const currentRequestId = ++requestIdRef.current;
      setIsLoading(true);
      
      const thunk = pendingOnly ? fetchExportTimeSheets : fetchTimeSheets;
      dispatch(thunk({
        startDate: startDate,
        endDate: endDate,
        employeeID: selectedOption?.employeeID || "all",
        clientID: "",
      })).finally(() => {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      });
    }
  }, [shiftSlice?.submitState, shiftSlice?.updateState, dispatch, startDate, endDate, selectedOption, pendingOnly]);

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
        
        {/* Important Section for Pending Payment Processing */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            border: `2px solid ${theme.palette.warning.main}`,
            borderRadius: 2,
            backgroundColor: theme.palette.warning.light + '20',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={pendingOnly} 
                  onChange={(e) => setPendingOnly(e.target.checked)}
                  color="warning"
                />
              }
              label={
                <Typography variant="subtitle2" fontWeight={600} color="warning.dark">
                  Get only pending payment timesheets
                </Typography>
              }
            />
            <Stack direction="row" spacing={1} alignItems="center">
              {pendingOnly && selectedRows.length === (shiftSlice?.timeSheets?.length || 0) && selectedRows.length > 0 && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setConfirmDialogOpen(true)}
                  sx={{ fontWeight: 600 }}
                >
                  Change state as Paid (Bulk)
                </Button>
              )}
              {selectedRows.length > 0 && !(pendingOnly && selectedRows.length === (shiftSlice?.timeSheets?.length || 0) && selectedRows.length > 0) && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setBulkUpdateDialogOpen(true)}
                  sx={{ fontWeight: 600 }}
                >
                  Update Selected ({selectedRows.length})
                </Button>
              )}
              {/* Debug info */}
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            <strong>Important:</strong> When you click this checkbox, you will receive all pending timesheets submitted within the given date range and also past timesheets that were submitted later. 
            Once you are done with the payment, please update them as paid to avoid them showing again when you select pending timesheets.
          </Typography>
        </Box>
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
            showExportButton={pendingOnly}
            onSelectionChange={setSelectedRows}
            externalSelectedRows={selectedRows}
          />
        </Stack>
        <Dialog
          open={confirmDialogOpen}
          onClose={() => { setConfirmDialogOpen(false); setConfirmText(""); }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm payment processing</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Are you sure that you are going to confirm that these selected time sheets ({shiftSlice?.timeSheets?.length || 0}) are proceeded for the payment one time. Please note that you cannot view these time sheets again in pending mode.
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Type: confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              variant="text" 
              onClick={() => { setConfirmDialogOpen(false); setConfirmText(""); }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={confirmText.trim().toLowerCase() !== "confirm" || (shiftSlice?.timeSheets?.length || 0) === 0}
              onClick={async () => {
                const ids = (shiftSlice?.timeSheets || []).map(ts => ts?.shiftNoteDTO?.noteID).filter(Boolean);
                try {
                  await dispatch(incrementExportCounts({ noteIds: ids as string[] }));
                } finally {
                  setConfirmDialogOpen(false);
                  setConfirmText("");
                  // Refresh list
                  const thunk = pendingOnly ? fetchExportTimeSheets : fetchTimeSheets;
                  dispatch(thunk({
                    startDate,
                    endDate,
                    employeeID: selectedOption?.employeeID || "all",
                    clientID: "",
                  }));
                }
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Update Dialog */}
        <Dialog
          open={bulkUpdateDialogOpen}
          onClose={() => { 
            setBulkUpdateDialogOpen(false); 
            setBulkConfirmText(""); 
            setSelectedAction("");
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <Typography variant="h5" fontWeight={600}>
              Bulk Update Action
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedRows.length} timesheet{selectedRows.length !== 1 ? 's' : ''} selected
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {(() => {
              const selectedTimesheets = (shiftSlice?.timeSheets || []).filter(ts => 
                selectedRows.includes(ts?.shiftNoteDTO?.noteID)
              );
              const exportedCount = selectedTimesheets.filter(ts => 
                (ts?.shiftNoteDTO?.exportCount || 0) > 0
              ).length;
              const unexportedCount = selectedTimesheets.length - exportedCount;

              return (
                <Stack spacing={3}>
                  <Typography variant="h6" textAlign="center" color="primary">
                    Choose Action
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Button
                      variant={selectedAction === "export" ? "contained" : "outlined"}
                      color="primary"
                      onClick={() => setSelectedAction("export")}
                      disabled={unexportedCount === 0}
                      size="large"
                      sx={{ 
                        py: 2,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: selectedAction === "export" ? 3 : 1,
                        '&:hover': {
                          boxShadow: 4,
                        }
                      }}
                    >
                      <Stack alignItems="center" spacing={1}>
                        <Typography variant="h6">
                          Export Unexported Timesheets
                        </Typography>
                        <Typography variant="body2" color="inherit">
                          {unexportedCount} timesheet{unexportedCount !== 1 ? 's' : ''} will be exported
                        </Typography>
                      </Stack>
                    </Button>
                    
                    <Button
                      variant={selectedAction === "reverse" ? "contained" : "outlined"}
                      color="warning"
                      onClick={() => setSelectedAction("reverse")}
                      disabled={exportedCount === 0}
                      size="large"
                      sx={{ 
                        py: 2,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: selectedAction === "reverse" ? 3 : 1,
                        '&:hover': {
                          boxShadow: 4,
                        }
                      }}
                    >
                      <Stack alignItems="center" spacing={1}>
                        <Typography variant="h6">
                          Reverse to Unexported
                        </Typography>
                        <Typography variant="body2" color="inherit">
                          {exportedCount} timesheet{exportedCount !== 1 ? 's' : ''} will be reversed
                        </Typography>
                      </Stack>
                    </Button>
                    
                    <Button
                      variant={selectedAction === "both" ? "contained" : "outlined"}
                      color="secondary"
                      onClick={() => setSelectedAction("both")}
                      disabled={unexportedCount === 0 || exportedCount === 0}
                      size="large"
                      sx={{ 
                        py: 2,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: selectedAction === "both" ? 3 : 1,
                        '&:hover': {
                          boxShadow: 4,
                        }
                      }}
                    >
                      <Stack alignItems="center" spacing={1}>
                        <Typography variant="h6">
                          Perform Both Actions
                        </Typography>
                        <Typography variant="body2" color="inherit">
                          Export unexported and reverse exported timesheets
                        </Typography>
                      </Stack>
                    </Button>
                  </Stack>

                  {selectedAction && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Type "confirm" to proceed:
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type: confirm"
                        value={bulkConfirmText}
                        onChange={(e) => setBulkConfirmText(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Box>
                  )}
                </Stack>
              );
            })()}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              variant="outlined"
              onClick={() => { 
                setBulkUpdateDialogOpen(false); 
                setBulkConfirmText(""); 
                setSelectedAction("");
              }}
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!selectedAction || bulkConfirmText.trim().toLowerCase() !== "confirm"}
              onClick={async () => {
                try {
                  await dispatch(bulkUpdateExportCounts({
                    noteIds: selectedRows,
                    action: selectedAction
                  }));
                } finally {
                  setBulkUpdateDialogOpen(false);
                  setBulkConfirmText("");
                  setSelectedAction("");
                  // Refresh data with same parameters
                  const thunk = pendingOnly ? fetchExportTimeSheets : fetchTimeSheets;
                  dispatch(thunk({
                    startDate,
                    endDate,
                    employeeID: selectedOption?.employeeID || "all",
                    clientID: "",
                  }));
                }
              }}
              sx={{ minWidth: 100 }}
            >
              Execute
            </Button>
          </DialogActions>
        </Dialog>
        
      </Stack>
    </Stack>
  );
};

export default ReportView;
