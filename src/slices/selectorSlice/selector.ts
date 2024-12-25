import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { AppConfig } from "../../config/config";
import { State } from "../../types/types";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";
import axios, { AxiosError, HttpStatusCode } from "axios";

// Define types for each entity
export interface ClientClassification {
  classificationID: string;
  classificationName: string;
  state: string;
}

export interface ClientType {
  clientTypeID: string;
  name: string;
  status: string;
}

export interface Language {
  languageID: string;
  language: string;
  languageNotes: string;
}

export interface ClientStatus {
  clientStatusID: string;
  status: string;
}

// Define types for the slice state
interface SelectorState {
  State: State;
  submitState: State;
  updateState: State;
  stateMessage: string | null;
  errorMessage: string | null;
  classifications: ClientClassification[];
  languages: Language[];
  clientStatus: ClientStatus[];
  clientTypes: ClientType[];
  backgroundProcess: boolean;
  backgroundProcessMessage: string | null;
}

// Initial state for the client slice
const initialState: SelectorState = {
  State: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  stateMessage: "",
  errorMessage: "",
  classifications: [],
  languages: [],
  clientStatus: [],
  clientTypes: [],
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

// Fetch classifications
export const fetchClassifications = createAsyncThunk(
  "selector/fetchClassifications",
  async (_, { dispatch, rejectWithValue }) => {
    return new Promise<ClientClassification[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.classifications)
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
                  ? SnackMessage.error.fetchClassifications
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Fetch classifications
export const fetchClientStatus = createAsyncThunk(
  "selector/fetchClientStatus",
  async (_, { dispatch, rejectWithValue }) => {
    return new Promise<ClientStatus[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.clientStatus)
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
                  ? SnackMessage.error.fetchClientStatus
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Fetch classifications
export const fetchClientTypes = createAsyncThunk(
  "selector/fetchClientTypes",
  async (_, { dispatch, rejectWithValue }) => {
    return new Promise<ClientType[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.clientTypes)
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
                  ? SnackMessage.error.fetchClientTypes
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Fetch classifications
export const fetchLanguages = createAsyncThunk(
  "selector/fetchLanguages",
  async (_, { dispatch, rejectWithValue }) => {
    return new Promise<Language[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.languages)
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
                  ? SnackMessage.error.fetchLanguages
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

export const updateLanguage = createAsyncThunk(
  "selector/UpdateLanguages",
  async (Payload: Language, { dispatch, rejectWithValue }) => {
    return new Promise<Language>((resolve, reject) => {
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.languages + `/${Payload?.languageID}`,
          Payload
        )
        .then((response) => {
          console.log("response", response);
          if (response.status === HttpStatusCode.Created) {
            dispatch(
              enqueueSnackbarMessage({
                message: SnackMessage.success.languageUpdated,
                type: "success",
              })
            );
            resolve(response.data);
          }
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
                  ? SnackMessage.error.languageUpdated
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);
// Fetch classifications
export const SaveLanguage = createAsyncThunk(
  "selector/SaveLanguages",
  async (Payload: Language, { dispatch, rejectWithValue }) => {
    return new Promise<Language>((resolve, reject) => {
      APIService.getInstance()
        .post(AppConfig.serviceUrls.languages, Payload)
        .then((response) => {
          console.log("response", response);
          if (response.status === HttpStatusCode.Created) {
            dispatch(
              enqueueSnackbarMessage({
                message: SnackMessage.success.saveLanguage,
                type: "success",
              })
            );
            resolve(response.data);
          }
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
                  ? SnackMessage.error.saveLanguage
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

export const updateClassification = createAsyncThunk(
  "selector/updateClassification",
  async (Payload: ClientClassification, { dispatch, rejectWithValue }) => {
    return new Promise<ClientClassification>((resolve, reject) => {
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.classifications +
            `/${Payload?.classificationID}`,
          Payload
        )
        .then((response) => {
          console.log("response", response);
          if (response.status === HttpStatusCode.Ok) {
            dispatch(
              enqueueSnackbarMessage({
                message: SnackMessage.success.classificationUpdated,
                type: "success",
              })
            );
            resolve(response.data);
          }
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
                  ? SnackMessage.error.classificationUpdated
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

export const saveClassification = createAsyncThunk(
  "selector/SaveClassification",
  async (Payload: ClientClassification, { dispatch, rejectWithValue }) => {
    return new Promise<ClientClassification>((resolve, reject) => {
      APIService.getInstance()
        .post(AppConfig.serviceUrls.classifications, Payload)
        .then((response) => {
          console.log("response", response);
          if (response.status === HttpStatusCode.Created) {
            dispatch(
              enqueueSnackbarMessage({
                message: SnackMessage.success.saveClassification,
                type: "success",
              })
            );
            resolve(response.data);
          }
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
                  ? SnackMessage.error.saveClassification
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

export const updateClientType = createAsyncThunk(
  "selector/UpdateClientType",
  async (Payload: ClientType, { dispatch, rejectWithValue }) => {
    return new Promise<ClientType>((resolve, reject) => {
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.clientTypes + `/${Payload?.clientTypeID}`,
          Payload
        )
        .then((response) => {
          console.log("response", response);
          if (response.status === HttpStatusCode.Ok) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Client Type Updated successfully",
                type: "success",
              })
            );
            resolve(response.data);
          }
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
                  ? SnackMessage.error.clientTypeUpdated
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

export const saveClientType = createAsyncThunk(
  "selector/SaveClientType",
  async (Payload: ClientType, { dispatch, rejectWithValue }) => {
    return new Promise<ClientType>((resolve, reject) => {
      APIService.getInstance()
        .post(AppConfig.serviceUrls.clientTypes, Payload)
        .then((response) => {
          console.log("response", response);
          if (response.status === HttpStatusCode.Created) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Client Type saved successfully",
                type: "success",
              })
            );
            resolve(response.data);
          }
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
                  ? SnackMessage.error.saveClientType
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

export const updateClientStatus = createAsyncThunk(
  "selector/UpdateClientStatus",
  async (
    Payload: { status: String; clientStatusID: String },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<ClientStatus>((resolve, reject) => {
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.clientStatus + `/${Payload?.clientStatusID}`,
          Payload
        )
        .then((response) => {
          console.log("response", response);
          if (response.status === HttpStatusCode.Ok) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Client Status updated successfully",
                type: "success",
              })
            );
            resolve(response.data);
          }
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
                  ? SnackMessage.error.clientStatusUpdated
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

export const saveClientStatus = createAsyncThunk(
  "selector/SaveClientStatus",
  async (Payload: { status: String }, { dispatch, rejectWithValue }) => {
    return new Promise<ClientStatus>((resolve, reject) => {
      APIService.getInstance()
        .post(AppConfig.serviceUrls.clientStatus, Payload)
        .then((response) => {
          console.log("response", response);
          if (response.status === HttpStatusCode.Created) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Client Status saved successfully",
                type: "success",
              })
            );
            resolve(response.data);
          }
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
                  ? SnackMessage.error.saveClientStatus
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Define the client slice
const SelectorSlice = createSlice({
  name: "Selector",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.submitState = State.idle;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch classifications
      .addCase(fetchClassifications.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching classifications...";
      })
      .addCase(
        fetchClassifications.fulfilled,
        (state, action: PayloadAction<ClientClassification[]>) => {
          state.State = State.success;
          state.stateMessage = "Successfully fetched classifications!";
          state.classifications = action.payload;
        }
      )
      .addCase(fetchClassifications.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch classifications!";
      })

      // Fetch languages
      .addCase(fetchLanguages.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching languages...";
      })
      .addCase(
        fetchLanguages.fulfilled,
        (state, action: PayloadAction<Language[]>) => {
          state.State = State.success;
          state.stateMessage = "Successfully fetched languages!";
          state.languages = action.payload;
        }
      )
      .addCase(fetchLanguages.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch languages!";
      })

      // Fetch client types
      .addCase(fetchClientTypes.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching client types...";
      })
      .addCase(
        fetchClientTypes.fulfilled,
        (state, action: PayloadAction<ClientType[]>) => {
          state.State = State.success;
          state.stateMessage = "Successfully fetched client types!";
          state.clientTypes = action.payload;
        }
      )
      .addCase(fetchClientTypes.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch client types!";
      })

      // Fetch client statuses
      .addCase(fetchClientStatus.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching client statuses...";
      })
      .addCase(
        fetchClientStatus.fulfilled,
        (state, action: PayloadAction<ClientStatus[]>) => {
          state.State = State.success;
          state.stateMessage = "Successfully fetched client statuses!";
          state.clientStatus = action.payload;
        }
      )
      .addCase(fetchClientStatus.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch client statuses!";
      })

      // Save Language
      .addCase(SaveLanguage.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Saving language...";
      })
      .addCase(
        SaveLanguage.fulfilled,
        (state, action: PayloadAction<Language>) => {
          console.log("cation came here  ");

          state.submitState = State.success;
          state.stateMessage = "Language saved successfully";
        }
      )
      .addCase(SaveLanguage.rejected, (state, action) => {
        state.submitState = State.failed;
        state.stateMessage = `Failed to save language: ${action.payload}`;
      })

      // Save Classification
      .addCase(saveClassification.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Saving classification...";
      })
      .addCase(
        saveClassification.fulfilled,
        (state, action: PayloadAction<ClientClassification>) => {
          state.submitState = State.success;
          state.stateMessage = "Classification saved successfully";
        }
      )
      .addCase(saveClassification.rejected, (state, action) => {
        state.submitState = State.failed;
        state.stateMessage = `Failed to save classification: ${action.payload}`;
      })

      // Save Client Type
      .addCase(saveClientType.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Saving client type...";
      })
      .addCase(
        saveClientType.fulfilled,
        (state, action: PayloadAction<ClientType>) => {
          state.submitState = State.success;
          state.stateMessage = "Client Type saved successfully";
        }
      )
      .addCase(saveClientType.rejected, (state, action) => {
        state.submitState = State.failed;
        state.stateMessage = `Failed to save client type: ${action.payload}`;
      })
      // Save Client Status
      .addCase(saveClientStatus.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Saving client status...";
      })
      .addCase(
        saveClientStatus.fulfilled,
        (state, action: PayloadAction<ClientStatus>) => {
          state.submitState = State.success;
          state.stateMessage = "Client Status saved successfully";
        }
      )
      .addCase(saveClientStatus.rejected, (state, action) => {
        state.submitState = State.failed;
        state.stateMessage = `Failed to save client status: ${action.payload}`;
      })
      .addCase(updateLanguage.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "updating Language...";
      })
      .addCase(
        updateLanguage.fulfilled,
        (state, action: PayloadAction<Language>) => {
          state.updateState = State.success;
          state.stateMessage = "Language updated successfully";
        }
      )
      .addCase(updateLanguage.rejected, (state, action) => {
        state.updateState = State.failed;
        state.stateMessage = `fail to update Language: ${action.payload}`;
      })
      .addCase(updateClassification.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "updating Classifications...";
      })
      .addCase(updateClassification.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "classification updated successfully";
      })
      .addCase(updateClassification.rejected, (state, action) => {
        state.updateState = State.failed;
        state.stateMessage = `fail to update Classification`;
      })
      .addCase(updateClientType.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "updating Client Type...";
      })
      .addCase(updateClientType.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "client Type updated successfully";
      })
      .addCase(updateClientType.rejected, (state, action) => {
        state.updateState = State.failed;
        state.stateMessage = `fail to update client type`;
      })
      .addCase(updateClientStatus.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "updating Client Status...";
      })
      .addCase(updateClientStatus.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "client Status updated successfully";
      })
      .addCase(updateClientStatus.rejected, (state, action) => {
        state.updateState = State.failed;
        state.stateMessage = `fail to update client Status`;
      });
  },
});

// Export actions and reducer
export const { resetSubmitState } = SelectorSlice.actions;
export default SelectorSlice.reducer;
