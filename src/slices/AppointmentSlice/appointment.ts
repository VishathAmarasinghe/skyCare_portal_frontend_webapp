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

export interface JobAssigner {
  assignID:string;
  careGiverID:string;
  taskID:string | null;
  appointmentID:string | null;
  assignType:string;
  assigner:string;
  acceptanceType:string;
}

export interface AppointmentCareGiver {
  careGiverID: string;
  appointmentData:Appointment;
  jobAssignData:JobAssigner;
}

export interface AppointmentCalenderType {
  appointmentID:string;
  title:string;
  startDateAndTime:string;
  endDateAndTime:string;
  eventColor:string;
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
    calenderState:State;
    submitState: State;
    updateState: State;
    deleteState: State;
    appointments: Appointment[];
    careGvierAppointments:AppointmentCareGiver[];
    calenderEvents:AppointmentCalenderType[];
    appointmentTypes: AppointmentType[];
    selectedAppointment: Appointment | null;
    errorMessage: string | null;
    stateMessage: string | null;
    backgroundProcess: boolean;
    backgroundProcessMessage: string | null;
  }
  

  const initialState: AppointmentState = {
    state: State.idle,
    calenderState:State.idle,
    submitState: State.idle,
    updateState: State.idle,
    deleteState: State.idle,
    appointments: [],
    calenderEvents:[],
    appointmentTypes: [],
    careGvierAppointments:[],
    selectedAppointment: null,
    errorMessage: null,
    stateMessage: null,
    backgroundProcess: false,
    backgroundProcessMessage: null,
  };

  export const fetchAppointmentsByCareGiverAndStatus = createAsyncThunk(
    "appointments/fetchAppointmentsByCareGiverAndStatus",
    async (payload:{employeeID:string,status:string}, { dispatch, rejectWithValue }) => {
      return new Promise<AppointmentCareGiver[]>((resolve, reject) => {
        APIService.getInstance()
          .get(AppConfig.serviceUrls.appointments + `/careGiver/${payload.employeeID}?status=${payload.status}`)
          .then((response) => resolve(response.data))
          .catch((error) => {
            dispatch(
              enqueueSnackbarMessage({
                message: error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchCalenderEvents
                  : String(error.response?.data?.message),
                type: "error",
              })
            );
            rejectWithValue(error.response?.data?.message);
          });
      });
    }
  );
  

  export const updateCareGiverAcceptanceState = createAsyncThunk(
    "appointments/updateCareGiverAcceptanceState",
    async (payload:{assignID:string,status:string}, { dispatch, rejectWithValue }) => {
      return new Promise((resolve, reject) => {
        console.log("payload",payload.assignID);
        APIService.getInstance()
          .put(AppConfig.serviceUrls.jobAssigns + `/acceptanceType/${payload?.assignID}?status=${payload.status}`)
          .then((response) =>{ 
            dispatch(
              enqueueSnackbarMessage({message:`Caregiver ${payload.status} the appointment!`,type:"success"})
            )
            resolve(response.data)}
          )
          .catch((error) => {
            dispatch(
              enqueueSnackbarMessage({
                message: error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.updateJobAcceptanceState
                  : String(error.response?.data?.message),
                type: "error",
              })
            );
            rejectWithValue(error.response?.data?.message);
          });
      });
    }
  );

  export const fetchAppointmentbyCalender = createAsyncThunk(
    "appointments/fetchAppointmentsForCalender",
    async (payload:{startDate:string,endDate:string}, { dispatch, rejectWithValue }) => {
      return new Promise<AppointmentCalenderType[]>((resolve, reject) => {
        APIService.getInstance()
          .get(AppConfig.serviceUrls.appointments + `/calender?startDate=${payload.startDate}&endDate=${payload.endDate}`)
          .then((response) => resolve(response.data))
          .catch((error) => {
            dispatch(
              enqueueSnackbarMessage({
                message: error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchCalenderEvents
                  : String(error.response?.data?.message),
                type: "error",
              })
            );
            rejectWithValue(error.response?.data?.message);
          });
      });
    }
  );

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


export const updateAppointment = createAsyncThunk(
  "appointments/UpdateAppointment",
  async (payload:{appointmentData:Appointment,files:File[]}, { dispatch, rejectWithValue }) => {
    return new Promise<Appointment>((resolve, reject) => {
      const formData = new FormData();
      formData.append("appointment", JSON.stringify(payload.appointmentData));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
      APIService.getInstance()
        .put(AppConfig.serviceUrls.appointments+`/${payload.appointmentData.appointmentID}`, formData,{
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          dispatch(enqueueSnackbarMessage({ message: "Appointment updated successfully!", type: "success" }));
          resolve(response.data);
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Failed to update appointment!",
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
      })
      .addCase(updateAppointment.pending, (state) => {
        state.updateState = State.loading;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.updateState = State.success;
      })
      .addCase(updateAppointment.rejected, (state) => {
        state.updateState = State.failed;
      })
      .addCase(fetchAppointmentbyCalender.pending, (state) => {
        state.calenderState = State.loading;
      })
      .addCase(fetchAppointmentbyCalender.fulfilled, (state, action) => {
        state.calenderState = State.success;
        state.calenderEvents = action.payload;
      })
      .addCase(fetchAppointmentbyCalender.rejected, (state) => {
        state.calenderState = State.failed;
      })
      .addCase(fetchAppointmentsByCareGiverAndStatus.pending, (state) => {
        state.state = State.loading;
      })
      .addCase(fetchAppointmentsByCareGiverAndStatus.fulfilled, (state, action) => {
        state.state = State.success;
        state.careGvierAppointments = action.payload;
      })
      .addCase(fetchAppointmentsByCareGiverAndStatus.rejected, (state) => {
        state.state = State.failed;
      })
      .addCase(updateCareGiverAcceptanceState.pending, (state) => {
        state.updateState = State.loading;
      })
      .addCase(updateCareGiverAcceptanceState.fulfilled, (state, action) => {
        state.updateState = State.success;
      })
      .addCase(updateCareGiverAcceptanceState.rejected, (state) => {
        state.updateState = State.failed;
      })
      
  },
});

export const { resetSelectedAppointment, resetSubmitState } = appointmentSlice.actions;
export default appointmentSlice.reducer;
