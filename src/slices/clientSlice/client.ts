import { createSlice, isDraft, PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";
import axios, { Axios, HttpStatusCode } from "axios";

// Define a type for the slice state
interface ClientState {
  State: State;
  submitState: State;
  updateState: State;
  stateMessage: string | null;
  errorMessage: string | null;
  selectedClient: Client | null;
  clients: Client[];
  clientDocuments: ClientDocuments[];
  totalClientCount: number;
  backgroundProcess: boolean;
  backgroundProcessMessage: string | null;
  [key: string]: any; // Index signature
}

// Define the initial state using client State
const initialState: ClientState = {
  State: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  stateMessage: "",
  errorMessage: "",
  selectedClient: null,
  clients: [],
  clientDocuments: [],
  totalClientCount: 0,
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

export interface Address {
  id: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  longitude: string;
  latitude: string;
}

export interface ClientDocuments {
  clientDocumentID: string;
  documentName: string;
  documentLocation: string;
  createdDate: string;
  clientId: string;
  urlLink: string;
  // shareType: string;
}

export interface Client {
  clientID: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  gender: string;
  birthday: string;
  joinDate: string;
  aboutMe: string;
  interests: string;
  dislikes: string;
  profilePhoto: string;
  physicalAddress: Address;
  postalAddress: Address;
  clientLanguages: string[];
  phoneNumbers: string[];
  clientClassifications: string[];
  clientType: string;
  clientStatus: string;
  referenceNo:string;
}

export const deleteClientDocument = createAsyncThunk(
  "client/deleteClientDocument",
  async (documentID: string, { dispatch, rejectWithValue }) => {
    return new Promise<ClientDocuments[]>((resolve, reject) => {
      APIService.getInstance()
        .delete(AppConfig.serviceUrls.clientDocuments + `/${documentID}`)
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.deleteClientDocuments,
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
            // dispatching the error message
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.deleteClientDocuments
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

export const saveClientDocuments = createAsyncThunk(
  "client/clientDocumentSave",
  async (
    payload: { documents: ClientDocuments; files: File[] },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<ClientDocuments>((resolve, reject) => {
      const formData = new FormData();

      formData.append("documentDTOs", JSON.stringify(payload.documents));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
      APIService.getInstance()
        .post(AppConfig.serviceUrls.clientDocuments, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.saveClientDocuments,
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
                  ? SnackMessage.error.saveClientDocuments
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

export const fetchClientDocuments = createAsyncThunk(
  "client/fetchClientDocuments",
  async (clientID: string, { dispatch, rejectWithValue }) => {
    return new Promise<ClientDocuments[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.clientDocuments + `/clients/${clientID}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            // dispatching the error message
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchClientDocuments
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// fetch clients
export const fetchClientsAssociatedToCareGiver = createAsyncThunk(
  "client/fetchClientsAssociatedToCareGiver",
  async (employeeID: string, { dispatch, rejectWithValue }) => {
    return new Promise<Client[]>((resolve, reject) => {
      APIService.getInstance()
        .get(
          AppConfig.serviceUrls.clients +
            `/careGiverAssignedClients/${employeeID}`
        )
        .then((response) => {
          console.log("response", response);
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            // dispatching the error message
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchClients
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// fetch clients
export const fetchClients = createAsyncThunk(
  "client/fetchClients",
  async (_, { dispatch, rejectWithValue }) => {
    return new Promise<Client[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.clients)
        .then((response) => {
          console.log("response", response);
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            // dispatching the error message
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchClients
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// fetch single Client
export const fetchSingleClients = createAsyncThunk(
  "client/fetchSingleClients",
  async (clientID: string, { dispatch, rejectWithValue }) => {
    return new Promise<Client>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.clients + "/" + clientID)
        .then((response) => {
          console.log("response", response);
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            // dispatching the error message
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchSingleClient
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// fetch advisories
export const updateClient = createAsyncThunk(
  "client/updateClient",
  async (payload: { clientData: Client }, { dispatch, rejectWithValue }) => {
    return new Promise<Client>((resolve, reject) => {
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.clients + `/${payload?.clientData?.clientID}`,
          payload?.clientData
        )
        .then((response) => {
          console.log("response", response);
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.updateClient,
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
                  ? SnackMessage.error.updateClient
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// fetch advisories
export const saveClient = createAsyncThunk(
  "client/saveClient",
  async (
    payload: { clientData: Client; profilePhoto: File | null },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<Client>((resolve, reject) => {
      // Create a FormData object
      const formData = new FormData();
      formData.append("clientData", JSON.stringify(payload.clientData));
      payload.profilePhoto
        ? formData.append(
            "profile_photo",
            payload?.profilePhoto ? payload.profilePhoto : ""
          )
        : null;

      APIService.getInstance()
        .post(AppConfig.serviceUrls.clients, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          console.log("response", response);
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.saveClient,
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
                  ? SnackMessage.error.saveClient
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// Define a type for the slice state
const ClientSlice = createSlice({
  name: "Client",
  initialState,
  reducers: {
    resetSubmitSate(state) {
      state.submitState = State.idle;
    },
    resetSelectedClient(state) {
      state.selectedClient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching Clients...";
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.State = State.success;
        state.stateMessage = "Successfully fetched!";
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch!";
      })
      .addCase(saveClient.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Saving Client...";
      })
      .addCase(saveClient.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully Saved!";
      })
      .addCase(saveClient.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save client!";
      })
      .addCase(fetchSingleClients.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching client...";
      })
      .addCase(fetchSingleClients.fulfilled, (state, action) => {
        state.State = State.success;
        state.stateMessage = "Successfully Fetched single Client!";
        state.selectedClient = action.payload;
      })
      .addCase(fetchSingleClients.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch client!";
      })
      .addCase(updateClient.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "Updating client...";
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully updated Client!";
      })
      .addCase(updateClient.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to update client!";
      })
      .addCase(fetchClientsAssociatedToCareGiver.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "fetching client...";
      })
      .addCase(fetchClientsAssociatedToCareGiver.fulfilled, (state, action) => {
        state.State = State.success;
        state.stateMessage = "Successfully fetched Client!";
        state.clients = action?.payload;
      })
      .addCase(fetchClientsAssociatedToCareGiver.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch client!";
      })
      .addCase(fetchClientDocuments.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "fetching client documents...";
      })
      .addCase(fetchClientDocuments.fulfilled, (state, action) => {
        state.State = State.success;
        state.stateMessage = "Successfully fetched Client documents!";
        state.clientDocuments = action?.payload;
      })
      .addCase(fetchClientDocuments.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch client documents!";
      })
      .addCase(saveClientDocuments.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "saving client documents...";
      })
      .addCase(saveClientDocuments.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved Client documents!";
      })
      .addCase(saveClientDocuments.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save clients documents";
      })
      .addCase(deleteClientDocument.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "deleting client documents...";
      })
      .addCase(deleteClientDocument.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully deleted Client documents!";
      })
      .addCase(deleteClientDocument.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to delete client documents";
      });
  },
});

export const { resetSubmitSate, resetSelectedClient } = ClientSlice.actions;
export default ClientSlice.reducer;
