import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";
import axios, { HttpStatusCode } from "axios";
import { Client } from "@slices/clientSlice/client";
import {
  Appointment,
  RecurrentAppointmentDTO,
  RecurrentAppointmentValues,
} from "@slices/appointmentSlice/appointment";
import { Employee } from "@slices/employeeSlice/employee";

// Define the type for Resource model
export interface StartShiftNote {
  recurrentAppointmentID: string;
  employeeID: string;
}

export interface ShiftNoteDocuments {
  documentId: string;
  documentName: string;
  documentLocation: string;
}

export interface updateShiftNote {
  noteID: string;
  title: string | null;
  shiftStartDate: string; // Format: "YYYY-MM-DD"
  shiftStartTime: string | null; // Format: "HH:mm:ss"
  shiftEndDate: string | null; // Format: "YYYY-MM-DD"
  shiftEndTime: string | null; // Format: "HH:mm:ss"
  systemShiftStartDate: string; // Format: "YYYY-MM-DD"
  systemShiftEndDate: string | null; // Format: "YYYY-MM-DD"
  systemShiftStartTime: string | null; // Format: "HH:mm:ss"
  systemShiftEndTime: string | null; // Format: "HH:mm:ss"
  recurrentAppointmentID: string | null;
  notes: string | null;
  comments: string | null;
  employeeID: string;
  careGiverID: string | null;
  state: string;
  documents: ShiftNoteDocuments[];
  clientID:string | null;
  totalWorkHrs:number;
  paymentState:string;
  createdAt?: string;
  exportCount?: number;
}

export interface currentShiftNoteState {
  shiftNoteID: string;
  recurrentAppointmentID: string;
  employeeID: string;
  CareGiverID: string;
  shiftNoteState: string;
  shiftNoteAvailability: string;
}

export interface TimeSheet {
  client: Client;
  employeeDTO: Employee;
  shiftNoteDTO: updateShiftNote;
  totalHours: string;
  recurrentAppointment: RecurrentAppointmentDTO;
  appointment: Appointment;
}

interface ShiftNoteState {
  state: State;
  startState: State;
  submitState: State;
  updateState: State;
  shiftNotes: updateShiftNote[];
  timeSheets: TimeSheet[];
  currentShiftNoteState: currentShiftNoteState | null;
  selectedShiftNote: updateShiftNote | null;
  deleteState: State;
  stateMessage: string | null;
  errorMessage: string | null;
  backgroundProcess: boolean;
  backgroundProcessMessage: string | null;
}

// Define the initial state for the ResourceSlice
const initialState: ShiftNoteState = {
  state: State.idle,
  startState: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  deleteState: State.idle,
  shiftNotes: [],
  timeSheets: [],
  selectedShiftNote: null,
  currentShiftNoteState: null,
  stateMessage: "",
  errorMessage: "",
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

export const fetchTimeSheets = createAsyncThunk(
  "shiftNote/fetchTimeSheets",
  async (
    payload: { startDate: string; endDate: string; employeeID: string, clientID: string },
    { dispatch, rejectWithValue, signal }
  ) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.shiftNotes +
          `/time-sheets?startDate=${payload?.startDate}&endDate=${payload?.endDate}&careGiverID=${payload?.employeeID}&clientID=${payload?.clientID}`,
        { 
          signal,
          timeout: 30000 // 30 seconds timeout for timesheet requests
        }
      );
      return response.data;
    } catch (error) {
      // Check if the request was aborted
      if (signal?.aborted || (error as any)?.name === 'AbortError') {
        return rejectWithValue("Request aborted");
      }
      
      console.log("Request error:", error);
      
      // Only show error message if it's not an abort error
      if (!signal?.aborted && (error as any)?.name !== 'AbortError') {
        let errorMessage = "An error occurred while fetching time sheets";
        
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            errorMessage = "Request timed out. Please try again or check your connection.";
          } else if (error.response?.status === HttpStatusCode.InternalServerError) {
            errorMessage = SnackMessage.error.shiftStarted;
          } else if (error.response?.data) {
            errorMessage = String(error.response.data);
          }
        }
        
        dispatch(
          enqueueSnackbarMessage({
            message: errorMessage,
            type: "error",
          })
        );
      }
      
      throw error;
    }
  }
);

export const fetchExportTimeSheets = createAsyncThunk(
  "shiftNote/fetchExportTimeSheets",
  async (
    payload: { startDate: string; endDate: string; employeeID: string, clientID: string },
    { dispatch, rejectWithValue, signal }
  ) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.shiftNotes +
          `/export/time-sheets?startDate=${payload?.startDate}&endDate=${payload?.endDate}&careGiverID=${payload?.employeeID}&clientID=${payload?.clientID}`,
        {
          signal,
          timeout: 30000
        }
      );
      return response.data;
    } catch (error) {
      if (signal?.aborted || (error as any)?.name === 'AbortError') {
        return rejectWithValue("Request aborted");
      }
      let errorMessage = "An error occurred while fetching export time sheets";
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          errorMessage = "Request timed out. Please try again or check your connection.";
        } else if (error.response?.data) {
          errorMessage = String(error.response.data);
        }
      }
      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const incrementExportCounts = createAsyncThunk(
  "shiftNote/incrementExportCounts",
  async (
    payload: { noteIds: string[] },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.shiftNotes + `/export/increment`,
        payload.noteIds,
        { headers: { "Content-Type": "application/json" } }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: `Marked ${payload.noteIds.length} time sheet(s) as paid`,
          type: "success",
        })
      );
      return response.data as number;
    } catch (error) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Failed to mark time sheets as paid",
          type: "error",
        })
      );
      return rejectWithValue(error);
    }
  }
);

export const bulkUpdateExportCounts = createAsyncThunk(
  "shiftNote/bulkUpdateExportCounts",
  async (
    payload: { noteIds: string[]; action: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.shiftNotes + `/export/bulk-update`,
        { noteIds: payload.noteIds, action: payload.action },
        { headers: { "Content-Type": "application/json" } }
      );
      
      const result = response.data as { incremented: number; decremented: number };
      let message = "";
      
      if (result.incremented > 0 && result.decremented > 0) {
        message = `Updated ${result.incremented} timesheets exported and ${result.decremented} timesheets reversed`;
      } else if (result.incremented > 0) {
        message = `Marked ${result.incremented} timesheet(s) as exported`;
      } else if (result.decremented > 0) {
        message = `Reversed ${result.decremented} timesheet(s) to unexported`;
      } else {
        message = "No timesheets were updated";
      }
      
      dispatch(
        enqueueSnackbarMessage({
          message,
          type: "success",
        })
      );
      return result;
    } catch (error) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Failed to update timesheets",
          type: "error",
        })
      );
      return rejectWithValue(error);
    }
  }
);

export const bulkUpdatePaymentStatus = createAsyncThunk(
  "shiftNote/bulkUpdatePaymentStatus",
  async (
    payload: { noteIds: string[]; status: string; comment?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.shiftNotes + `/time-sheets/bulk-status-update`,
        { 
          noteIds: payload.noteIds, 
          status: payload.status,
          comment: payload.comment || ""
        },
        { headers: { "Content-Type": "application/json" } }
      );
      
      const result = response.data as { updated: number };
      
      dispatch(
        enqueueSnackbarMessage({
          message: `Successfully updated ${result.updated} timesheet(s) to ${payload.status}`,
          type: "success",
        })
      );
      return result;
    } catch (error) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Failed to update timesheet status",
          type: "error",
        })
      );
      return rejectWithValue(error);
    }
  }
);

// Fetch single resources
export const submitStartShiftNote = createAsyncThunk(
  "shiftNote/submitStartShiftNote",
  async (
    payload: { recurrentAppointmentID: string; employeeID: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.shiftNotes + `/start`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.shiftStarted,
          type: "success",
        })
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            axios.isAxiosError(error) &&
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.shiftStarted
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const getSingleShiftNoteByShiftID = createAsyncThunk(
  "shiftNote/getSingleShiftNotes",
  async (shiftNoteID: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.shiftNotes + `/${shiftNoteID}`
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            axios.isAxiosError(error) &&
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchShiftNotes
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

// Fetch single resources
export const getAllShiftNotes = createAsyncThunk(
  "shiftNote/getAllShiftNotes",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.shiftNotes
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            axios.isAxiosError(error) &&
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchShiftNotes
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const getAllShiftNotesByEmployeeID = createAsyncThunk(
  "shiftNote/getAllShiftNotesByEmployee",
  async (employeeID: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.shiftNotes + `/careGiver/${employeeID}`
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            axios.isAxiosError(error) &&
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchShiftNotes
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

// Fetch single resources
export const getCurrnetShiftNoteState = createAsyncThunk(
  "shiftNote/getCurrnetShiftNoteState",
  async (
    payload: { recurrentAppointmentID: string; employeeID: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.shiftNotes +
          `/shift-note-state?recurrentAppointmentID=${payload.recurrentAppointmentID}&employeeID=${payload.employeeID}`
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            axios.isAxiosError(error) &&
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.shiftStarted
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

// Save notes by clientID
export const updatehiftNotes = createAsyncThunk(
  "note/updateShiftNotes",
  async (
    payload: { notes: updateShiftNote; files: File[] },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<updateShiftNote>((resolve, reject) => {
      const formData = new FormData();

      formData.append("note", JSON.stringify(payload.notes));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.shiftNotes + `/${payload?.notes?.noteID}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        )
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.shiftUpdate,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.shiftUpdate
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// Save notes by clientID
export const updateShiftNotesPaymentStatus = createAsyncThunk(
  "note/updateShiftNotesPaymentStatus",
  async (
    payload: { id: string; paymentState: string,comment:string },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<string>((resolve, reject) => {
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.shiftNotes + `/time-sheets/status/${payload.id}?status=${payload.paymentState}`,
          { comment: payload.comment }, // Send as JSON
          { headers: { "Content-Type": "application/json" } } 
        )
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.updateTimeSheetStatus,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.updateTimeSheetStatus
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// Save notes by clientID
export const saveNewShiftNotes = createAsyncThunk(
  "note/SaveNewShiftNotes",
  async (
    payload: { notes: updateShiftNote; files: File[] },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<updateShiftNote>((resolve, reject) => {
      const formData = new FormData();

      formData.append("note", JSON.stringify(payload.notes));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
      APIService.getInstance()
        .post(AppConfig.serviceUrls.shiftNotes + `/finish`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.shiftFinished,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.shiftFinished
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// Save notes by clientID
export const saveShiftNotes = createAsyncThunk(
  "note/SaveShiftNotes",
  async (
    payload: { notes: updateShiftNote; files: File[] },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<updateShiftNote>((resolve, reject) => {
      const formData = new FormData();

      formData.append("note", JSON.stringify(payload.notes));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
      APIService.getInstance()
        .post(AppConfig.serviceUrls.shiftNotes + `/new`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.shiftNoteCreated,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.shiftNoteCreated
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// Define the slice with reducers and extraReducers
const ShiftNoteSlice = createSlice({
  name: "shiftNotes",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.submitState = State.idle;
      state.updateState = State.idle;
      state.deleteState = State.idle;
    },
    resetSelectedShiftNote(state) {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitStartShiftNote.pending, (state) => {
        state.startState = State.loading;
        state.stateMessage = "Fetching shiftNotes...";
      })
      .addCase(submitStartShiftNote.fulfilled, (state, action) => {
        state.startState = State.success;
        state.stateMessage = "Successfully fetched shiftNotes!";
      })
      .addCase(submitStartShiftNote.rejected, (state) => {
        state.startState = State.failed;
        state.stateMessage = "Failed to fetch shiftNotes!";
      })
      .addCase(getCurrnetShiftNoteState.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching shiftNote State...";
      })
      .addCase(getCurrnetShiftNoteState.fulfilled, (state, action) => {
        state.state = State.success;
        state.currentShiftNoteState = action.payload;
        state.stateMessage = "Successfully fetched shiftNote states!";
      })
      .addCase(getCurrnetShiftNoteState.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch shiftNote state!";
      })
      .addCase(saveShiftNotes.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Saving shiftNote State...";
      })
      .addCase(saveShiftNotes.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Save Successfully!";
      })
      .addCase(saveShiftNotes.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save shiftNote!";
      })
      .addCase(getAllShiftNotes.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "getting all shiftNote State...";
      })
      .addCase(getAllShiftNotes.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "fetched all shiftnotes Successfully!";
        state.shiftNotes = action.payload;
      })
      .addCase(getAllShiftNotes.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "fail to fetch shiftNote!";
      })
      .addCase(getAllShiftNotesByEmployeeID.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "feching all shiftNotes by employee State...";
      })
      .addCase(getAllShiftNotesByEmployeeID.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "feching all shiftNotes by employee Successfully!";
        state.shiftNotes = action.payload;
      })
      .addCase(getAllShiftNotesByEmployeeID.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "feching all shiftNotes by employee shiftNote!";
      })
      .addCase(getSingleShiftNoteByShiftID.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "feching  shiftNotes by employee State...";
      })
      .addCase(getSingleShiftNoteByShiftID.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "feching  shiftNotes by employee Successfully!";
        state.selectedShiftNote = action.payload;
      })
      .addCase(getSingleShiftNoteByShiftID.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "feching all shiftNotes by employee shiftNote!";
      })
      .addCase(updatehiftNotes.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "updating Shift Note...";
      })
      .addCase(updatehiftNotes.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Shift note Updated Successfully!";
      })
      .addCase(updatehiftNotes.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "fail to update shiftNote!";
      })
      .addCase(fetchTimeSheets.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "loading timesheets...";
      })
      .addCase(fetchTimeSheets.fulfilled, (state, action) => {
        state.state = State.success;
        state.timeSheets = action.payload;
        state.stateMessage = "time sheets fetched Successfully!";
      })
      .addCase(fetchTimeSheets.rejected, (state, action) => {
        // Only update state if it's not an aborted request
        if (action.payload !== "Request aborted") {
          state.state = State.failed;
          state.stateMessage = "fail to fetch time sheets shiftNote!";
        }
      })
      .addCase(fetchExportTimeSheets.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "loading exportable timesheets...";
      })
      .addCase(fetchExportTimeSheets.fulfilled, (state, action) => {
        state.state = State.success;
        state.timeSheets = action.payload;
        state.stateMessage = "exportable time sheets fetched Successfully!";
      })
      .addCase(fetchExportTimeSheets.rejected, (state, action) => {
        if (action.payload !== "Request aborted") {
          state.state = State.failed;
          state.stateMessage = "fail to fetch exportable time sheets!";
        }
      })
      .addCase(updateShiftNotesPaymentStatus.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "updating Shift Note...";
      })
      .addCase(updateShiftNotesPaymentStatus.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Shift note Updated Successfully!";
      })
      .addCase(updateShiftNotesPaymentStatus.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "fail to update shiftNote!";
      })
      .addCase(incrementExportCounts.pending, (state) => {
        state.backgroundProcess = true;
        state.backgroundProcessMessage = "Updating export counts...";
      })
      .addCase(incrementExportCounts.fulfilled, (state) => {
        state.backgroundProcess = false;
        state.backgroundProcessMessage = null;
      })
      .addCase(incrementExportCounts.rejected, (state) => {
        state.backgroundProcess = false;
        state.backgroundProcessMessage = null;
      })
      .addCase(bulkUpdatePaymentStatus.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "Updating payment status...";
      })
      .addCase(bulkUpdatePaymentStatus.fulfilled, (state) => {
        state.updateState = State.success;
        state.stateMessage = "Payment status updated successfully!";
      })
      .addCase(bulkUpdatePaymentStatus.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to update payment status!";
      });
  },
});

export const { resetSubmitState, resetSelectedShiftNote } =
  ShiftNoteSlice.actions;
export default ShiftNoteSlice.reducer;
