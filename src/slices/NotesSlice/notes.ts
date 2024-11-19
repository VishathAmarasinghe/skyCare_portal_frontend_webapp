import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { APIService } from '../../utils/apiService'
import { State } from '../../types/types'
import { AppConfig } from '../../config/config'
import { enqueueSnackbarMessage } from '../commonSlice/common'
import { SnackMessage } from '../../Config/constant'
import axios, { HttpStatusCode } from 'axios'

// Define the type for Notes model
export interface Notes {
  noteID: string
  title: string
  createDate: string
  shiftStartTime: string
  shiftEndTime: string
  careplanID: string | null
  clientID: string
  noteType: "Internal Note" | "Shift Note"
  taskID: string | null
  appointmentID: string | null
  effectiveDate: string
  description: string
  sharedGroup: "All" | "Internal" 
  createdBy: string | null
}

export interface NoteFiles {
    noteID: string
    docID: string
    document: string
}

interface NoteState {
  State: State
  submitState: State
  updateState: State
  stateMessage: string | null
  errorMessage: string | null
  selectedNote: Notes | null
  notes: Notes[] | []
  noteFiles: NoteFiles[] | []
  backgroundProcess: boolean
  backgroundProcessMessage: string | null
}

// Define the initial state for the NoteSlice
const initialState: NoteState = {
  State: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  stateMessage: '',
  errorMessage: '',
  selectedNote: null,
  notes: [],
  noteFiles: [],
  backgroundProcess: false,
  backgroundProcessMessage: null,
}


// Fetch notes by clientID
export const fetchNotes = createAsyncThunk(
  'note/fetchNotes',
  async (clientID:String, { dispatch, rejectWithValue }) => {
    return new Promise<Notes[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.notes)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue('Request canceled')
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchNotes
                  : String(error.response?.data?.message),
              type: 'error',
            }),
          )
          reject(error.response?.data?.message)
        })
    })
  },
)


// Save notes by clientID
export const saveNotes = createAsyncThunk(
    'note/SaveNotes',
    async (payload:{notes:Notes,files:File[]}, { dispatch, rejectWithValue }) => {
      return new Promise<Notes>((resolve, reject) => {
        const formData = new FormData();

        formData.append("note",JSON.stringify(payload.notes))
        payload.files.forEach((file) => {
          formData.append("files",file)
        })
        APIService.getInstance()
          .post(AppConfig.serviceUrls.notes,formData,{
            headers: {
              'Content-Type': 'multipart/form-data',
          }})
          .then((response) => {
            dispatch(enqueueSnackbarMessage({
                message: SnackMessage.success.saveNotes,
                type: 'success',
            }))
            resolve(response.data)
          })
          .catch((error) => {
            if (axios.isCancel(error)) {
              return rejectWithValue('Request canceled')
            }
            dispatch(
              enqueueSnackbarMessage({
                message:
                  error.response?.status === HttpStatusCode.InternalServerError
                    ? SnackMessage.error.saveNotes
                    : String(error.response?.data?.message),
                type: 'error',
              }),
            )
            reject(error.response?.data?.message)
          })
      })
    },
  )

// Define the slice with reducers and extraReducers
const NoteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.submitState = State.idle
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.State = State.loading
        state.stateMessage = 'Fetching notes...'
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.State = State.success
        state.stateMessage = 'Successfully fetched notes!'
        state.notes = action.payload
      })
      .addCase(fetchNotes.rejected, (state) => {
        state.State = State.failed
        state.stateMessage = 'Failed to fetch notes!'
      })
      .addCase(saveNotes.pending, (state) => {
        state.submitState = State.loading
        state.stateMessage = 'submitting notes...'
      })
      .addCase(saveNotes.fulfilled, (state, action) => {
        state.submitState = State.success
        state.stateMessage = 'Successfully uploaded notes!'
      })
      .addCase(saveNotes.rejected, (state) => {
        state.submitState = State.failed
        state.stateMessage = 'Failed to save notes!'
      })
  },
})

export const { resetSubmitState } = NoteSlice.actions
export default NoteSlice.reducer
