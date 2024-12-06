import { State } from "../../types/types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import axios, { HttpStatusCode } from "axios";
import { SnackMessage } from "../../Config/constant";

export interface AppointmentType {
  appointmentTypeID:string,
  name: string,
  status: string,
  color:string
}

export interface AppointmentAddress {
    appointmentAddressID: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  }
  
  export interface AppointmentAttachment {
    appointmentID: string;
    documentID: string;
    document: string;
  }
  
  export interface RecurrentWork {
    recurrentWorkID: string;
    appointmentID: string;
    taskID: string;
    recurrenceType: string;
    startDate: string;
    endDate: string;
    frequencyCount: number;
    day: string;
    occurrenceLimit: number;
  }
  
  export interface JobAssignCreation {
    careGiverIDs: string[];
    taskID: string;
    appointmentID: string;
    assignType: string;
    assigner: string;
  }
  
  export interface Appointment {
    appointmentID: string;
    title: string;
    appointmentTypeID: string;
    clientID: string;
    caregiverCount: number;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    duration: number;
    comment: string;
    carePlanID: string;
    taskID: string;
    broadcastType: string;
    appointmentAddress: AppointmentAddress;
    attachments: AppointmentAttachment[];
    recurrenceState: boolean;
    recurrentWork: RecurrentWork;
    jobAssigns: JobAssignCreation;
  }
  
  export interface AppointmentState {
    state: State;
    submitState: State;
    updateState: State;
    deleteState: State;
    appointments: Appointment[];
    appointmentTypes: AppointmentType[];
    selectedAppointment: Appointment | null;
    errorMessage: string | null;
    stateMessage: string | null;
    backgroundProcess: boolean;
    backgroundProcessMessage: string | null;
  }
  

  const initialState: AppointmentState = {
    state: State.idle,
    submitState: State.idle,
    updateState: State.idle,
    deleteState: State.idle,
    appointments: [],
    appointmentTypes: [],
    selectedAppointment: null,
    errorMessage: null,
    stateMessage: null,
    backgroundProcess: false,
    backgroundProcessMessage: null,
  };
  
  export const fetchAppointmentsByClientID = createAsyncThunk(
  "appointments/fetchAppointmentsByClientID",
  async (clientID: string, { dispatch, rejectWithValue }) => {
    return new Promise<Appointment[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.appointments + `/client/${clientID}`)
        .then((response) => resolve(response.data))
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: error.response?.status === HttpStatusCode.InternalServerError
                ? SnackMessage.error.fetchAppointments
                : String(error.response?.data?.message),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data?.message);
        });
    });
  }
);


export const fetchAppointmentTypes = createAsyncThunk(
  "appointments/fetchAppointmentTypes",
  async (_, { dispatch, rejectWithValue }) => {
    return new Promise<AppointmentType[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.appointmentTypes)
        .then((response) => resolve(response.data))
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: error.response?.status === HttpStatusCode.InternalServerError
                ? "Failed to fetch appointment types."
                : String(error.response?.data?.message),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data?.message);
        });
    });
  }
);

export const saveAppointment = createAsyncThunk(
  "appointments/saveAppointment",
  async (payload:{appointmentData:Appointment,files:File[]}, { dispatch, rejectWithValue }) => {
    return new Promise<Appointment>((resolve, reject) => {
      const formData = new FormData();
      formData.append("appointment", JSON.stringify(payload.appointmentData));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
      APIService.getInstance()
        .post(AppConfig.serviceUrls.appointments, formData,{
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          dispatch(enqueueSnackbarMessage({ message: "Appointment saved successfully!", type: "success" }));
          resolve(response.data);
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Failed to save appointment!",
              type: "error",
            })
          );
          rejectWithValue(error.response?.data?.message);
        });
    });
  }
);

export const fetchSingleAppointment = createAsyncThunk(
  "appointments/fetchSingleAppointment",
  async (appointmentID: string, { dispatch, rejectWithValue }) => {
    return new Promise<Appointment>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.appointments + `/${appointmentID}`)
        .then((response) => resolve(response.data))
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Failed to fetch the appointment!",
              type: "error",
            })
          );
          rejectWithValue(error.response?.data?.message);
        });
    });
  }
);

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    resetSelectedAppointment(state) {
      state.selectedAppointment = null;
    },
    resetSubmitState(state) {
      state.submitState = State.idle;
      state.updateState = State.idle;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointmentsByClientID.pending, (state) => {
        state.state = State.loading;
      })
      .addCase(fetchAppointmentsByClientID.fulfilled, (state, action) => {
        state.state = State.success;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointmentsByClientID.rejected, (state) => {
        state.state = State.failed;
      })
      .addCase(saveAppointment.pending, (state) => {
        state.submitState = State.loading;
      })
      .addCase(saveAppointment.fulfilled, (state) => {
        state.submitState = State.success;
      })
      .addCase(saveAppointment.rejected, (state) => {
        state.submitState = State.failed;
      })
      .addCase(fetchSingleAppointment.pending, (state) => {
        state.state = State.loading;
      })
      .addCase(fetchSingleAppointment.fulfilled, (state, action) => {
        state.selectedAppointment = action.payload;
        state.state = State.success;
      })
      .addCase(fetchSingleAppointment.rejected, (state) => {
        state.state = State.failed;
      })
      .addCase(fetchAppointmentTypes.pending, (state) => {
        state.state = State.loading;
      })
      .addCase(fetchAppointmentTypes.fulfilled, (state, action) => {
        state.appointmentTypes = action.payload;
        state.state = State.success;
      })
      .addCase(fetchAppointmentTypes.rejected, (state) => {
        state.state = State.failed;
      });
  },
});

export const { resetSelectedAppointment, resetSubmitState } = appointmentSlice.actions;
export default appointmentSlice.reducer;
