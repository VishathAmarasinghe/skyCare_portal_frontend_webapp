
import { createSlice, isDraft, PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { APIService } from '../../utils/apiService'
import { State } from '../../types/types'
import { AppConfig } from '../../config/config'
import { enqueueSnackbarMessage } from '../commonSlice/common'
import { SnackMessage } from '../../Config/constant'
import axios, { Axios, HttpStatusCode } from 'axios'

// Define a type for the slice state
interface ClientState {
  State: State
  submitState: State
  updateState: State
  stateMessage: string | null
  errorMessage: string | null
  selectedClient: Client | null
  clients: Client[]
  totalClientCount: number
  backgroundProcess: boolean
  backgroundProcessMessage: string | null
  [key: string]: any // Index signature
}


// Define the initial state using client State
const initialState: ClientState = {
  State: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  stateMessage: '',
  errorMessage: '',
  selectedClient: null,
  clients: [],
  totalClientCount: 0,
  backgroundProcess: false,
  backgroundProcessMessage: null,
}


export interface Address {
  id: number
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  longitude: string
  latitude: string
}

export interface Client {
  clientID: string
  firstName: string
  lastName: string
  preferredName: string
  email: string
  gender: string
  birthday: string
  joinDate: string
  aboutMe: string
  interests: string
  dislikes: string
  profilePhoto: string
  physicalAddress: Address
  postalAddress: Address
  clientLanguages: string[]
  phoneNumbers: string[]
  clientClassifications: string[]
  clientType: string
  clientStatus: string
}

// fetch clients
export const fetchClients = createAsyncThunk(
  'client/fetchClients',
  async (
    _,
    { dispatch, rejectWithValue },
  ) => {
    return new Promise<Client[]>((resolve, reject) => {
      APIService.getInstance()
        .get(
          AppConfig.serviceUrls.clients
        )
        .then((response) => {
          console.log('response', response)
          resolve(response.data)
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue('Request canceled')
          }
          dispatch(
            // dispatching the error message
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchClients
                  : String(error.response?.data?.message),
              type: 'error',
            }),
          )
          reject(error.response?.data?.message)
        })
    })
  },
)

// fetch single Client
export const fetchSingleClients = createAsyncThunk(
  'client/fetchSingleClients',
  async (
    clientID: string,
    { dispatch, rejectWithValue },
  ) => {
    return new Promise<Client>((resolve, reject) => {
      APIService.getInstance()
        .get(
          AppConfig.serviceUrls.clients+'/'+clientID
        )
        .then((response) => {
          console.log('response', response)
          resolve(response.data)
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue('Request canceled')
          }
          dispatch(
            // dispatching the error message
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchSingleClient
                  : String(error.response?.data?.message),
              type: 'error',
            }),
          )
          reject(error.response?.data?.message)
        })
    })
  },
)


// fetch advisories
export const saveClient = createAsyncThunk(
  'client/saveClient',
  async (
    payload: { clientData: Client; profilePhoto: File | null },
    { dispatch, rejectWithValue },
  ) => {
    return new Promise<Client>((resolve, reject) => {
      // Create a FormData object
      const formData = new FormData();
      formData.append('clientData', JSON.stringify(payload.clientData));
      payload.profilePhoto? formData.append('profile_photo', payload?.profilePhoto ? payload.profilePhoto : ''): null;

      APIService.getInstance()
        .post(AppConfig.serviceUrls.clients, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          console.log('response', response);
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.saveClient,
              type: 'success',
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue('Request canceled');
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.saveClient
                  : String(error.response?.data?.message),
              type: 'error',
            }),
          );
          reject(error.response?.data?.message);
        });
    });
  },
);



// Define a type for the slice state
const ClientSlice = createSlice({
  name: 'Client',
  initialState,
  reducers: {
    resetSubmitSate(state) {
      state.submitState = State.idle
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.State = State.loading
        state.stateMessage = 'Fetching Clients...'
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.State = State.success
        state.stateMessage = 'Successfully fetched!'
        state.clients = action.payload
      })
      .addCase(fetchClients.rejected, (state) => {
        state.State = State.failed
        state.stateMessage = 'Failed to fetch!'
      })
      .addCase(saveClient.pending, (state) => {
        state.submitState = State.loading
        state.stateMessage = 'Saving Client...'
      })
      .addCase(saveClient.fulfilled, (state, action) => {
        state.submitState = State.success
        state.stateMessage = 'Successfully Saved!'
      })
      .addCase(saveClient.rejected, (state) => {
        state.submitState = State.failed
        state.stateMessage = 'Failed to save client!'
      })
      .addCase(fetchSingleClients.pending, (state) => {
        state.State = State.loading
        state.stateMessage = 'Fetching client...'
      })
      .addCase(fetchSingleClients.fulfilled, (state, action) => {
        state.State = State.success
        state.stateMessage = 'Successfully Fetched single Client!'
        state.selectedClient = action.payload
      })
      .addCase(fetchSingleClients.rejected, (state) => {
        state.State = State.failed
        state.stateMessage = 'Failed to fetch client!'
      })
  },
})

export const { resetSubmitSate} = ClientSlice.actions
export default ClientSlice.reducer
