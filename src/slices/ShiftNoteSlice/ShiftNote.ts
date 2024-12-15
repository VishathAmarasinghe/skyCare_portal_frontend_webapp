import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../Config/constant";
import axios, { HttpStatusCode } from "axios";

// Define the type for Resource model
export interface StartShiftNote {
  recurrentAppointmentID: string;
  employeeID: string;
}

export interface ShiftNoteDocuments{
    documentId:string;
    documentName:string;
    documentLocation:string;
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
  documents:ShiftNoteDocuments[];
}

export interface currentShiftNoteState {
  shiftNoteID: string;
  recurrentAppointmentID: string;
  employeeID: string;
  CareGiverID: string;
  shiftNoteState: string;
  shiftNoteAvailability: string;
}

interface ShiftNoteState {
  state: State;
  startState: State;
  submitState: State;
  updateState: State;
  shiftNotes: updateShiftNote[];
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
  selectedShiftNote: null,
  currentShiftNoteState: null,
  stateMessage: "",
  errorMessage: "",
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

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
              : String((error as any).response?.data?.message),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const getSingleShiftNoteByShiftID = createAsyncThunk(
    "shiftNote/getSingleShiftNotes",
    async (
      shiftNoteID:string,
      { dispatch, rejectWithValue }
    ) => {
      try {
        const response = await APIService.getInstance().get(AppConfig.serviceUrls.shiftNotes+`/${shiftNoteID}`);
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
                : String((error as any).response?.data?.message),
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
    async (
      _,
      { dispatch, rejectWithValue }
    ) => {
      try {
        const response = await APIService.getInstance().get(AppConfig.serviceUrls.shiftNotes);
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
                : String((error as any).response?.data?.message),
            type: "error",
          })
        );
        throw error;
      }
    }
  );


  export const getAllShiftNotesByEmployeeID = createAsyncThunk(
    "shiftNote/getAllShiftNotesByEmployee",
    async (
      employeeID:string,
      { dispatch, rejectWithValue }
    ) => {
      try {
        const response = await APIService.getInstance().get(AppConfig.serviceUrls.shiftNotes+`/careGiver/${employeeID}`);
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
                : String((error as any).response?.data?.message),
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
              : String((error as any).response?.data?.message),
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
          .put(AppConfig.serviceUrls.shiftNotes+`/${payload?.notes?.noteID}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
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
                    : String(error.response?.data?.error),
                type: "error",
              })
            );
            reject(error.response?.data?.message);
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
          .post(AppConfig.serviceUrls.shiftNotes+`/finish`, formData, {
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
                    : String(error.response?.data?.error),
                type: "error",
              })
            );
            reject(error.response?.data?.message);
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
        state.stateMessage ="feching all shiftNotes by employee Successfully!";
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
        state.stateMessage ="feching  shiftNotes by employee Successfully!";
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
        state.stateMessage ="Shift note Updated Successfully!";      
      })
      .addCase(updatehiftNotes.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "fail to update shiftNote!";
      })
      
  },
});

export const { resetSubmitState, resetSelectedShiftNote } =
  ShiftNoteSlice.actions;
export default ShiftNoteSlice.reducer;
