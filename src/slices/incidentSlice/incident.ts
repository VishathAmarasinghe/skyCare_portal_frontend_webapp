import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";
import axios, { HttpStatusCode } from "axios";
import { AppointmentAddress } from "../appointmentSlice/appointment";

export interface Incidents {
  incidentID: string;
  title: string;
  reportDate: string; // ISO string date
  incidentDate: string; // ISO string date
  incidentTime: string; // ISO string datetime
  incidentTypeID: string;
  incidentStatusID: string;
  address: AppointmentAddress; // Embedded DTO
  issue: string;
  description: string;
  hospitalized: boolean;
  admitDate: string | null; // ISO string date or null
  dischargeDate: string | null; // ISO string date or null
  carePlanID: string;
  appointmentID: string;
  taskID: string;
  followUp: string;
  notes: string;
  documents: IncidentDocuments[];
  parties: IncidentInvolvedParties[];
  answers: IncidentActionTypeAllAnswers[];
  employeeID: string;
}

export interface IncidentStatus {
  incidentStatusID: string;
  status: string;
  description: string;
  activeStatus: string;
}

export interface IncidentActionTypesQuestions {
  incidentActionID: string;
  question: string;
  yesNoAnswer: boolean;
  status: string;
  incidentSubActionList: IncidentSubActionTypeQuestions[];
}

export interface IncidentDocuments {
  documentID: string;
  documentName: string;
  documentLocation: string;
  incidentID: string;
}

export interface IncidentInvolvedParties {
  partyID: string;
  firstName: string;
  lastName: string;
  email: string;
  workPhoneNo: string;
  type: string;
}

export interface IncidentSubActionTypeQuestions {
  id: string;
  question: string;
  incidentActionTypesID: string;
  state: string;
}

export interface IncidentActionTypeAllAnswers {
  id: number | null; // Nullable for newly created answers
  incidentActionID: string;
  incidentSubActionID: string | null; // Nullable for main questions
  incidentID: string;
  answer: string;
}

export interface saveQuestion {
  mainQuestion: string;
  yesNoType: boolean;
  subQuestions: string[];
}

export interface IncidentType {
  incidentTypeID: string;
  title: string;
  description: string;
  status: string;
}

export interface IncidentActionTypes {
  incidentActionID: string;
  question: string;
  answer: boolean;
}

interface IncidentState {
  state: State;
  submitState: State;
  updateState: State;
  deleteState: State;
  subTypeState: State;
  incidentTypeState: State;
  stateMessage: string | null;
  errorMessage: string | null;
  incidentsTypes: IncidentType[];
  incidentStatus: IncidentStatus[];
  incidentActionTypesQuestions: IncidentActionTypesQuestions[];
  selectedIncident: Incidents | null;
  incidents: Incidents[];
  backgroundProcess: boolean;
  backgroundProcessMessage: string | null;
}

// Define the initial state for the ResourceSlice
const initialState: IncidentState = {
  state: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  deleteState: State.idle,
  subTypeState: State.idle,
  incidentTypeState: State.idle,
  stateMessage: "",
  errorMessage: "",
  incidents: [],
  incidentStatus: [],
  incidentsTypes: [],
  incidentActionTypesQuestions: [],
  selectedIncident: null,
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

// Fetch single resources
export const fetchAllIncidentsByEmployeeId = createAsyncThunk(
  "incident/fetchAllIncidentsByEmployeeId",
  async (employeeID: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.incident + `/employee/${employeeID}`
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
              ? SnackMessage.error.fetchIncidents
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

// Fetch single resources
export const fetchAllIncidents = createAsyncThunk(
  "incident/fetchAllIncidents",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.incident
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
              ? SnackMessage.error.fetchIncidents
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

// Fetch single resources
export const fetchAllIncidentTypes = createAsyncThunk(
  "incident/fetchAllIncidentTypes",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.incidentTypes
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
              ? SnackMessage.error.fetchIncidentTypes
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const saveIncidentQuestion = createAsyncThunk(
  "incident/saveIncidnetQuestion",
  async (payload: saveQuestion[], { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.incidentQuestions + `/with-sub-questions`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Incident Question saved successfully",
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
              ? "Failed to save incident question"
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const updateIncidentQuestion = createAsyncThunk(
  "incident/updateIncidnetQuestion",
  async (
    payload: IncidentActionTypesQuestions,
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().put(
        AppConfig.serviceUrls.incidentQuestions + `/update`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Incident Question updated successfully",
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
              ? "Failed to update incident question"
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const saveIncidentTypes = createAsyncThunk(
  "incident/saveIncidentTypes",
  async (payload: IncidentType, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.incidentTypes,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Incident Type saved successfully",
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
              ? "Failed to save incident type"
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const updateIncidentTypes = createAsyncThunk(
  "incident/updateIncidentTypes",
  async (payload: IncidentType, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(
        AppConfig.serviceUrls.incidentTypes + `/${payload?.incidentTypeID}`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Incident Type updated successfully",
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
              ? "Failed to update incident type"
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const fetchSingleIncident = createAsyncThunk(
  "incident/fetchSingleIncident",
  async (incidentID: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.incident + `/${incidentID}`
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
              ? SnackMessage.error.fetchIncidents
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const fetchAllIncidentActionTypeQuestions = createAsyncThunk(
  "incident/fetchAllIncidentActionTypeQuestions",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.incidentQuestions
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
              ? SnackMessage.error.fetchIncidentQuestions
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const fetchAllIncidentStatus = createAsyncThunk(
  "incident/fetchAllIncidentStatus",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.incidentStatus
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
              ? SnackMessage.error.fetchIncidentStatus
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const saveIncidentStatus = createAsyncThunk(
  "incident/saveIncidentStatus",
  async (payload: IncidentStatus, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.incidentStatus,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Incident Status saved successfully",
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
              ? "Failed to save incident status"
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const updateIncidentStatus = createAsyncThunk(
  "incident/updateIncidentStatus",
  async (payload: IncidentStatus, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(
        AppConfig.serviceUrls.incidentStatus + `/${payload?.incidentStatusID}`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Incident Status updated successfully",
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
              ? "Failed to update incident status"
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const updateIncident = createAsyncThunk(
  "incident/updateIncident",
  async (
    payload: { incident: Incidents; files: File[] },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<Incidents>((resolve, reject) => {
      const formData = new FormData();

      formData.append("incident", JSON.stringify(payload.incident));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.incident + `/${payload?.incident?.incidentID}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        )
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.updateIncident,
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
                  ? SnackMessage.error.incidentUpdate
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
export const saveIncident = createAsyncThunk(
  "incident/saveIncident",
  async (
    payload: { incident: Incidents; files: File[] },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<Incidents>((resolve, reject) => {
      const formData = new FormData();

      formData.append("incident", JSON.stringify(payload.incident));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
      APIService.getInstance()
        .post(AppConfig.serviceUrls.incident, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.saveIncident,
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
                  ? SnackMessage.error.saveIncident
                  : String(error.response?.data?.error),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// Define the slice with reducers and extraReducers
const IncidentSlice = createSlice({
  name: "Incident",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.submitState = State.idle;
      state.updateState = State.idle;
      state.deleteState = State.idle;
    },
    resetSelectedIncident(state) {
      state.selectedIncident = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllIncidentTypes.pending, (state) => {
        state.subTypeState = State.loading;
        state.incidentTypeState = State.loading;
        state.stateMessage = "Fetching incident Types...";
      })
      .addCase(fetchAllIncidentTypes.fulfilled, (state, action) => {
        state.subTypeState = State.success;
        state.incidentTypeState = State.success;
        state.stateMessage = "Successfully fetched incident Types!";
        state.incidentsTypes = action.payload;
      })
      .addCase(fetchAllIncidentTypes.rejected, (state) => {
        state.subTypeState = State.failed;
        state.incidentTypeState = State.failed;
        state.stateMessage = "Failed to fetch incident types!";
      })
      .addCase(fetchAllIncidentStatus.pending, (state) => {
        state.subTypeState = State.loading;
        state.stateMessage = "Fetching incident Status...";
      })
      .addCase(fetchAllIncidentStatus.fulfilled, (state, action) => {
        state.subTypeState = State.success;
        state.stateMessage = "Successfully fetched incident Status!";
        state.incidentStatus = action.payload;
      })
      .addCase(fetchAllIncidentStatus.rejected, (state) => {
        state.subTypeState = State.failed;
        state.stateMessage = "Failed to fetch incident Status!";
      })
      .addCase(fetchAllIncidentActionTypeQuestions.pending, (state) => {
        state.subTypeState = State.loading;
        state.stateMessage = "Fetching incident Questions...";
      })
      .addCase(
        fetchAllIncidentActionTypeQuestions.fulfilled,
        (state, action) => {
          state.subTypeState = State.success;
          state.stateMessage = "Successfully fetched incident questions!";
          state.incidentActionTypesQuestions = action.payload;
        }
      )
      .addCase(fetchAllIncidentActionTypeQuestions.rejected, (state) => {
        state.subTypeState = State.failed;
        state.stateMessage = "Failed to fetch incident questions!";
      })
      .addCase(updateIncidentStatus.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "updating incident Status...";
      })
      .addCase(updateIncidentStatus.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully updated incident Status!";
      })
      .addCase(updateIncidentStatus.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to update incident Status!";
      })
      .addCase(saveIncidentStatus.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "saving incident Status...";
      })
      .addCase(saveIncidentStatus.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved incident Status!";
      })
      .addCase(saveIncidentStatus.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save incident Status!";
      })
      .addCase(updateIncidentTypes.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "saving incident types...";
      })
      .addCase(updateIncidentTypes.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully saved incident types!";
      })
      .addCase(updateIncidentTypes.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to save incident types!";
      })
      .addCase(saveIncidentTypes.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "saving incident type...";
      })
      .addCase(saveIncidentTypes.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved incident type!";
      })
      .addCase(saveIncidentTypes.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save incident type!";
      })
      .addCase(saveIncidentQuestion.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "saving incident Question...";
      })
      .addCase(saveIncidentQuestion.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved incident Question!";
      })
      .addCase(saveIncidentQuestion.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save incident Question!";
      })
      .addCase(updateIncidentQuestion.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "update incident Question...";
      })
      .addCase(updateIncidentQuestion.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully update incident Question!";
      })
      .addCase(updateIncidentQuestion.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to update incident Question!";
      })
      .addCase(saveIncident.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Saving incident...";
      })
      .addCase(saveIncident.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved incident!";
      })
      .addCase(saveIncident.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save incident!";
      })
      .addCase(fetchAllIncidents.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "fetching incidents...";
      })
      .addCase(fetchAllIncidents.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched incidents!";
        state.incidents = action.payload;
      })
      .addCase(fetchAllIncidents.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch incidents!";
      })
      .addCase(fetchSingleIncident.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "fetching incidents...";
      })
      .addCase(fetchSingleIncident.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched incident!";
        state.selectedIncident = action.payload;
      })
      .addCase(fetchSingleIncident.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch incidents!";
      })
      .addCase(updateIncident.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "Updating incident...";
      })
      .addCase(updateIncident.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully updated incident!";
        state.selectedIncident = action.payload;
      })
      .addCase(updateIncident.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to update incidents!";
      })
      .addCase(fetchAllIncidentsByEmployeeId.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "fetching incident...";
      })
      .addCase(fetchAllIncidentsByEmployeeId.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched incident!";
        state.selectedIncident = action.payload;
      })
      .addCase(fetchAllIncidentsByEmployeeId.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch incidents!";
      });
  },
});

export const { resetSubmitState, resetSelectedIncident } =
  IncidentSlice.actions;
export default IncidentSlice.reducer;
