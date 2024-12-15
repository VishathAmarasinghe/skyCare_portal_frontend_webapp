import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../Config/constant";
import axios, { HttpStatusCode } from "axios";
import { AppointmentAddress } from "../AppointmentSlice/appointment";

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
}

export interface IncidentStatus {
  incidentStatusID: string;
  status: string;
  description: string;
  activeStatus: string;
}

export interface IncidentActionTypesQuestions{
    incidentActionID: string;
    question: string;
    yesNoAnswer: boolean;
    status: string,
    incidentSubActionList:IncidentSubActionTypeQuestions[];
}

export interface IncidentDocuments {
    documentID: string;
    documentName: string;
    documentLocation: string;
    incidentID: string;
}

export interface IncidentInvolvedParties  {
    partyID: string;
    firstName: string;
    lastName: string;
    email: string;
    workPhoneNo: string;
    type: string;
  };

export interface IncidentSubActionTypeQuestions{
    id:string;
    question: string;
    incidentActionTypesID: string;
    state:string;
}

export interface IncidentActionTypeAllAnswers {
    id: number | null; // Nullable for newly created answers
    incidentActionID: string;
    incidentSubActionID: string | null; // Nullable for main questions
    incidentID: string;
    answer: string;
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
  stateMessage: string | null;
  errorMessage: string | null;
  incidentsTypes: IncidentType[];
  incidentStatus: IncidentStatus[];
  incidentActionTypesQuestions:IncidentActionTypesQuestions[];
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
  stateMessage: "",
  errorMessage: "",
  incidents: [],
  incidentStatus: [],
  incidentsTypes: [],
    incidentActionTypesQuestions:[],
  selectedIncident: null,
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

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
              : String((error as any).response?.data?.message),
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
                : String((error as any).response?.data?.message),
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
                : String((error as any).response?.data?.message),
            type: "error",
          })
        );
        throw error;
      }
    }
  );

// Save a new resource
export const saveResource = createAsyncThunk(
  "resource/saveResource",
  async (
    payload: { resource: Resource; files: File[] },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData = new FormData();

      formData.append("resourceData", JSON.stringify(payload.resource));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.resources,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.saveResources,
          type: "success",
        })
      );

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      console.log("error", error);
      dispatch(
        enqueueSnackbarMessage({
          message:
            (error as any).response?.status ===
            HttpStatusCode.InternalServerError
              ? SnackMessage.error.saveResources
              : String((error as any).response?.data?.message),
          type: "error",
        })
      );
      throw error;
    }
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
        state.stateMessage = "Fetching incident Types...";
      })
      .addCase(fetchAllIncidentTypes.fulfilled, (state, action) => {
        state.subTypeState = State.success;
        state.stateMessage = "Successfully fetched incident Types!";
        state.incidentsTypes = action.payload;
      })
      .addCase(fetchAllIncidentTypes.rejected, (state) => {
        state.subTypeState = State.failed;
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
      .addCase(fetchAllIncidentActionTypeQuestions.fulfilled, (state, action) => {
        state.subTypeState = State.success;
        state.stateMessage = "Successfully fetched incident questions!";
        state.incidentActionTypesQuestions = action.payload;
      })
      .addCase(fetchAllIncidentActionTypeQuestions.rejected, (state) => {
        state.subTypeState = State.failed;
        state.stateMessage = "Failed to fetch incident questions!";
      });
  },
});

export const { resetSubmitState, resetSelectedIncident } =
  IncidentSlice.actions;
export default IncidentSlice.reducer;
