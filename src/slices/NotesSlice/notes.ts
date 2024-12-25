import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";
import axios, { HttpStatusCode } from "axios";

// Define the type for Notes model
export interface Notes {
  noteID: string;
  title: string;
  createDate: string;
  shiftStartTime: string | null;
  shiftEndTime: string | null;
  careplanID: string | null;
  clientID: string;
  noteType: "Internal Note" | "Shift Note";
  taskID: string | null;
  appointmentID: string | null;
  effectiveDate: string;
  description: string;
  sharedGroup: "All" | "Internal";
  createdBy: string | null;
  documents: NoteFiles[] | null;
}

export interface NoteFiles {
  noteID: string;
  docID: string;
  document: string;
}

interface NoteState {
  State: State;
  submitState: State;
  updateState: State;
  deleteState: State;
  stateMessage: string | null;
  errorMessage: string | null;
  selectedNote: Notes | null;
  notes: Notes[] | [];
  noteFiles: NoteFiles[] | [];
  backgroundProcess: boolean;
  backgroundProcessMessage: string | null;
}

// Define the initial state for the NoteSlice
const initialState: NoteState = {
  State: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  deleteState: State.idle,
  stateMessage: "",
  errorMessage: "",
  selectedNote: null,
  notes: [],
  noteFiles: [],
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

// Fetch all notes
export const fetchNotes = createAsyncThunk(
  "note/fetchNotes",
  async (_, { dispatch, rejectWithValue }) => {
    return new Promise<Notes[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.notes)
        .then((response) => {
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
                  ? SnackMessage.error.fetchNotes
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Fetch all notes
export const fetchSingleNote = createAsyncThunk(
  "note/fetchSingleNote",
  async (noteID: String, { dispatch, rejectWithValue }) => {
    return new Promise<Notes>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.notes + `/${noteID}`)
        .then((response) => {
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
                  ? SnackMessage.error.fetchNotes
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Fetch all notes by client id
export const fetchNotesByClientID = createAsyncThunk(
  "note/fetchNotesByClientID",
  async (clientID: String, { dispatch, rejectWithValue }) => {
    return new Promise<Notes[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.notes + `/client/${clientID}`)
        .then((response) => {
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
                  ? SnackMessage.error.fetchNotes
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Save notes by clientID
export const saveNotes = createAsyncThunk(
  "note/SaveNotes",
  async (
    payload: { notes: Notes; files: File[] },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<Notes>((resolve, reject) => {
      const formData = new FormData();

      formData.append("note", JSON.stringify(payload.notes));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
      APIService.getInstance()
        .post(AppConfig.serviceUrls.notes, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.saveNotes,
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
                  ? SnackMessage.error.saveNotes
                  : String(error.response?.data?.error),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Update notes
export const updateNotes = createAsyncThunk(
  "note/UpdateNotes",
  async (
    payload: { notes: Notes; files: File[] },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<Notes>((resolve, reject) => {
      const formData = new FormData();

      formData.append("note", JSON.stringify(payload.notes));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.notes + `/${payload.notes.noteID}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        )
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.updateNotes,
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
                  ? SnackMessage.error.updateNotes
                  : String(error.response?.data?.error),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// delete note
export const deleteNotes = createAsyncThunk(
  "note/deleteNotes",
  async (payload: { noteID: string }, { dispatch, rejectWithValue }) => {
    return new Promise<Notes>((resolve, reject) => {
      APIService.getInstance()
        .delete(AppConfig.serviceUrls.notes + `/${payload.noteID}`)
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.NoteDeleted,
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
                  ? SnackMessage.error.NoteDeleted
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
const NoteSlice = createSlice({
  name: "note",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.submitState = State.idle;
      state.updateState = State.idle;
      state.deleteState = State.idle;
    },
    resetSelectedNote(state) {
      state.selectedNote = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching notes...";
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.State = State.success;
        state.stateMessage = "Successfully fetched notes!";
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch notes!";
      })
      .addCase(saveNotes.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "submitting notes...";
      })
      .addCase(saveNotes.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully uploaded notes!";
      })
      .addCase(saveNotes.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save notes!";
      })
      .addCase(fetchNotesByClientID.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching notes...";
      })
      .addCase(fetchNotesByClientID.fulfilled, (state, action) => {
        state.State = State.success;
        state.stateMessage = "Successfully fetched notes!";
        state.notes = action.payload;
      })
      .addCase(fetchNotesByClientID.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch notes!";
      })
      .addCase(fetchSingleNote.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching notes...";
      })
      .addCase(fetchSingleNote.fulfilled, (state, action) => {
        state.State = State.success;
        state.stateMessage = "Successfully fetched notes!";
        state.selectedNote = action.payload;
      })
      .addCase(fetchSingleNote.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch notes!";
      })
      .addCase(updateNotes.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "Updating note...";
      })
      .addCase(updateNotes.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully update note!";
      })
      .addCase(updateNotes.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to Update notes!";
      })
      .addCase(deleteNotes.pending, (state) => {
        state.deleteState = State.loading;
        state.stateMessage = "Deleting note...";
      })
      .addCase(deleteNotes.fulfilled, (state, action) => {
        state.deleteState = State.success;
        state.stateMessage = "Successfully delete note!";
      })
      .addCase(deleteNotes.rejected, (state) => {
        state.deleteState = State.failed;
        state.stateMessage = "Failed to delete notes!";
      });
  },
});

export const { resetSubmitState, resetSelectedNote } = NoteSlice.actions;
export default NoteSlice.reducer;
