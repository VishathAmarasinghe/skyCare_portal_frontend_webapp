import { State } from "../../types/types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import axios, { HttpStatusCode } from "axios";
import { SnackMessage } from "../../config/constant";

export interface CareGiverAssignedDTO {
  firstName: string;
  lastName: string;
  employeeID: string;
  careGiverID: string;
  acceptanceState: string;
  userProfilePhoto: string;
}

export interface RecurrentAppointmentValues {
  recurrentAppointmentID: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  comment: string;
}

export interface JobAssignShowerDTO {
  recurrentAppointmentID: string;
  appointmentID: string;
  jobState: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  cancelState: boolean;
  comment: string;
  requiredHeadcount: number;
  assigners: CareGiverAssignedDTO[];
}

export interface AppointmentType {
  appointmentTypeID: string;
  name: string;
  status: string;
  color: string;
}

interface JobAssignerDTO {
  assignID: string;
  careGiverID: string;
  taskID: string | null;
  appointmentID: string;
  assignType: string | null;
  assigner: string | null;
  acceptanceType: string;
  recurrentAppointmentID: string;
}

interface RecurrentAppointmentDTO {
  recurrentAppointmentID: string;
  appointmentID: string;
  recurrentWorkID: string;
  occurrenceNumber: number;
  startDate: string; // ISO date string (e.g., "2023-12-31")
  startTime: string;
  endDate: string; // ISO date string (e.g., "2023-12-31")
  endTime: string;
  status: string;
  isCancelled: boolean;
  comment: string;
}

export interface NextAppointmentDTO {
  appointment: Appointment;
  recurrentTask: RecurrentAppointmentDTO;
}

export interface PendingAppointments {
  recurrentAppointmentID: string;
  careGiverStatus: string;
  appointmentData: Appointment;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface JobAssigner {
  jobAssignData: JobAssignerDTO;
  recurrentAppointmentData: RecurrentAppointmentDTO;
  totalRequired: number;
  pendingRequired: number;
}

export interface AppointmentCareGiver {
  careGiverID: string;
  appointmentData: Appointment; // Ensure Appointment is defined elsewhere.
  allocations: JobAssigner[]; // List of job assignments.
}

export interface AppointmentCalenderType {
  appointmentID: string;
  title: string;
  startDateAndTime: string;
  endDateAndTime: string;
  eventColor: string;
  recurrentAppointmentID: string;
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
  calenderState: State;
  submitState: State;
  updateState: State;
  deleteState: State;
  appointments: Appointment[];
  nextAppointment: NextAppointmentDTO | null;
  jobAssignerTable: JobAssignShowerDTO[];
  jobAssignerState: State;
  careGvierAppointments: AppointmentCareGiver[];
  calenderEvents: AppointmentCalenderType[];
  appointmentTypes: AppointmentType[];
  selectedAppointment: Appointment | null;
  pendingAppointments: PendingAppointments[];
  selectedRecurrentAppointment: PendingAppointments | null;
  errorMessage: string | null;
  stateMessage: string | null;
  backgroundProcess: boolean;
  backgroundProcessMessage: string | null;
}

const initialState: AppointmentState = {
  state: State.idle,
  calenderState: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  deleteState: State.idle,
  jobAssignerState: State.idle,
  nextAppointment: null,
  jobAssignerTable: [],
  appointments: [],
  calenderEvents: [],
  appointmentTypes: [],
  careGvierAppointments: [],
  pendingAppointments: [],
  selectedRecurrentAppointment: null,
  selectedAppointment: null,
  errorMessage: null,
  stateMessage: null,
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

export const fetchRecurrentAppointmentDetails = createAsyncThunk(
  "appointments/fetchRecurrentAppointmentDetails",
  async (
    payload: { recurrentAppointmentID: string },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<PendingAppointments>((resolve, reject) => {
      APIService.getInstance()
        .get(
          AppConfig.serviceUrls.appointments +
            `/recurrentAppointment/${payload.recurrentAppointmentID}`
        )
        .then((response) => resolve(response.data))
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchAppointmentDetails
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const fetchNextAppointmentbyCareGiver = createAsyncThunk(
  "appointments/fetchNextAppointmentbyCareGiver",
  async (payload: { employeeID: string }, { dispatch, rejectWithValue }) => {
    return new Promise<NextAppointmentDTO>((resolve, reject) => {
      APIService.getInstance()
        .get(
          AppConfig.serviceUrls.appointments +
            `/next/appointment/${payload.employeeID}`
        )
        .then((response) => resolve(response.data))
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchingNextAppointment
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const fetchAppointmentsByCareGiverAndStatus = createAsyncThunk(
  "appointments/fetchAppointmentsByCareGiverAndStatus",
  async (
    payload: { employeeID: string; status: string },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<AppointmentCareGiver[]>((resolve, reject) => {
      APIService.getInstance()
        .get(
          AppConfig.serviceUrls.appointments +
            `/careGiver/${payload.employeeID}?status=${payload.status}`
        )
        .then((response) => resolve(response.data))
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchCalenderEvents
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const updateRecurrentAppointment = createAsyncThunk(
  "appointments/updateRecurrentAppointment",
  async (
    payload: RecurrentAppointmentValues,
    { dispatch, rejectWithValue }
  ) => {
    return new Promise((resolve, reject) => {
      APIService.getInstance()
        .post(
          AppConfig.serviceUrls.appointments + `/recurrentAppointment`,
          payload
        )
        .then((response) => {
          resolve(response.data),
            dispatch(
              enqueueSnackbarMessage({
                message: SnackMessage.success.updateRecurrentAppointment,
                type: "success",
              })
            );
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.updateRecurrentAppointment
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const fetchJobAssignmentTable = createAsyncThunk(
  "appointments/fetchJobAssignmentTable",
  async (payload: { appointmentID: string }, { dispatch, rejectWithValue }) => {
    return new Promise<JobAssignShowerDTO[]>((resolve, reject) => {
      APIService.getInstance()
        .get(
          AppConfig.serviceUrls.jobAssigns +
            `/assignment/${payload.appointmentID}`
        )
        .then((response) => resolve(response.data))
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchJobAssignerTable
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const updateCareGiverAcceptanceState = createAsyncThunk(
  "appointments/updateCareGiverAcceptanceState",
  async (
    payload: { assignID: string; status: string },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise((resolve, reject) => {
      console.log("payload", payload.assignID);
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.jobAssigns +
            `/acceptanceType/${payload?.assignID}?status=${payload.status}`
        )
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: `Caregiver ${payload.status} the appointment!`,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.updateJobAcceptanceState
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const cancelAppointment = createAsyncThunk(
  "appointments/cancelAppointment",
  async (
    payload: { recurrentAppointmentID: string },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise((resolve, reject) => {
      APIService.getInstance()
        .delete(
          AppConfig.serviceUrls.appointments +
            `/cancelAppointment/${payload.recurrentAppointmentID}`
        )
        .then((response) => {
          resolve(response.data),
            dispatch(
              enqueueSnackbarMessage({
                message: "Appointment cancelled successfully!",
                type: "success",
              })
            );
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.appointmentCancel
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const fetchPendingAppointmentsWithUser = createAsyncThunk(
  "appointments/fetchPendingAppointmentsWithUser",
  async (payload: { employeeID: string }, { dispatch, rejectWithValue }) => {
    return new Promise<PendingAppointments[]>((resolve, reject) => {
      APIService.getInstance()
        .get(
          AppConfig.serviceUrls.appointments + `/pending/${payload.employeeID}`
        )
        .then((response) => resolve(response.data))
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.pendingAppointments
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const fetchAppointmentbyCalenderWithUser = createAsyncThunk(
  "appointments/fetchAppointmentsForCalenderWithUser",
  async (
    payload: { startDate: string; endDate: string; employeeID: string },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<AppointmentCalenderType[]>((resolve, reject) => {
      APIService.getInstance()
        .get(
          AppConfig.serviceUrls.appointments +
            `/calender/user/${payload?.employeeID}?startDate=${payload.startDate}&endDate=${payload.endDate}`
        )
        .then((response) => resolve(response.data))
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchCalenderEvents
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const fetchAppointmentbyCalender = createAsyncThunk(
  "appointments/fetchAppointmentsForCalender",
  async (
    payload: { startDate: string; endDate: string },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<AppointmentCalenderType[]>((resolve, reject) => {
      APIService.getInstance()
        .get(
          AppConfig.serviceUrls.appointments +
            `/calender?startDate=${payload.startDate}&endDate=${payload.endDate}`
        )
        .then((response) => resolve(response.data))
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchCalenderEvents
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
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
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchAppointments
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
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
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? "Failed to fetch appointment types."
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const saveAppointmentTypes = createAsyncThunk(
  "appointments/saveAppointmentTypes",
  async (payload: AppointmentType, { dispatch, rejectWithValue }) => {
    return new Promise<AppointmentType>((resolve, reject) => {
      APIService.getInstance()
        .post(AppConfig.serviceUrls.appointmentTypes, payload)
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Appointment type saved successfully!",
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? "Failed to save appointment types."
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const updateAppointmentTypes = createAsyncThunk(
  "appointments/updateAppointmentTypes",
  async (payload: AppointmentType, { dispatch, rejectWithValue }) => {
    return new Promise<AppointmentType>((resolve, reject) => {
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.appointmentTypes +
            `/${payload?.appointmentTypeID}`,
          payload
        )
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Appointment type updated successfully!",
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? "Failed to update appointment types."
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const updateNewAllocations = createAsyncThunk(
  "appointments/updateNewAllocations",
  async (payload: any, { dispatch, rejectWithValue }) => {
    return new Promise<AppointmentType[]>((resolve, reject) => {
      APIService.getInstance()
        .post(AppConfig.serviceUrls.jobAssigns + `/updateAssigners`, payload)
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Caregivers assigned successfully!",
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? "Failed to fetch appointment types."
                  : String(error.response?.data),
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const saveAppointment = createAsyncThunk(
  "appointments/saveAppointment",
  async (
    payload: { appointmentData: Appointment; files: File[] },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<Appointment>((resolve, reject) => {
      const formData = new FormData();
      formData.append("appointment", JSON.stringify(payload.appointmentData));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
      APIService.getInstance()
        .post(AppConfig.serviceUrls.appointments, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Appointment saved successfully!",
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Failed to save appointment!",
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
        });
    });
  }
);

export const updateAppointment = createAsyncThunk(
  "appointments/UpdateAppointment",
  async (
    payload: { appointmentData: Appointment; files: File[] },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<Appointment>((resolve, reject) => {
      const formData = new FormData();
      formData.append("appointment", JSON.stringify(payload.appointmentData));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.appointments +
            `/${payload.appointmentData.appointmentID}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Appointment updated successfully!",
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Failed to update appointment!",
              type: "error",
            })
          );
          rejectWithValue(error.response?.data);
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
          rejectWithValue(error.response?.data);
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
      console.log("resetSelectedAppointment");
      state.selectedRecurrentAppointment = null;
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
      .addCase(fetchAppointmentbyCalenderWithUser.pending, (state) => {
        state.calenderState = State.loading;
      })
      .addCase(
        fetchAppointmentbyCalenderWithUser.fulfilled,
        (state, action) => {
          state.calenderState = State.success;
          state.calenderEvents = action.payload;
        }
      )
      .addCase(fetchAppointmentbyCalenderWithUser.rejected, (state) => {
        state.calenderState = State.failed;
      })
      .addCase(fetchAppointmentsByCareGiverAndStatus.pending, (state) => {
        state.state = State.loading;
      })
      .addCase(
        fetchAppointmentsByCareGiverAndStatus.fulfilled,
        (state, action) => {
          state.state = State.success;
          state.careGvierAppointments = action.payload;
        }
      )
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
      .addCase(fetchJobAssignmentTable.pending, (state) => {
        state.jobAssignerState = State.loading;
      })
      .addCase(fetchJobAssignmentTable.fulfilled, (state, action) => {
        state.jobAssignerState = State.success;
        state.jobAssignerTable = action.payload;
      })
      .addCase(fetchJobAssignmentTable.rejected, (state) => {
        state.jobAssignerState = State.failed;
      })
      .addCase(updateNewAllocations.pending, (state) => {
        state.jobAssignerState = State.loading;
      })
      .addCase(updateNewAllocations.fulfilled, (state, action) => {
        state.jobAssignerState = State.success;
      })
      .addCase(updateNewAllocations.rejected, (state) => {
        state.jobAssignerState = State.failed;
      })
      .addCase(cancelAppointment.pending, (state) => {
        state.deleteState = State.loading;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.deleteState = State.success;
      })
      .addCase(cancelAppointment.rejected, (state) => {
        state.deleteState = State.failed;
      })
      .addCase(updateRecurrentAppointment.pending, (state) => {
        state.updateState = State.loading;
      })
      .addCase(updateRecurrentAppointment.fulfilled, (state, action) => {
        state.updateState = State.success;
      })
      .addCase(updateRecurrentAppointment.rejected, (state) => {
        state.updateState = State.failed;
      })
      .addCase(fetchNextAppointmentbyCareGiver.pending, (state) => {
        state.state = State.loading;
      })
      .addCase(fetchNextAppointmentbyCareGiver.fulfilled, (state, action) => {
        state.state = State.success;
        state.nextAppointment = action.payload;
      })
      .addCase(fetchNextAppointmentbyCareGiver.rejected, (state) => {
        state.state = State.failed;
      })
      .addCase(updateAppointmentTypes.pending, (state) => {
        state.updateState = State.loading;
      })
      .addCase(updateAppointmentTypes.fulfilled, (state, action) => {
        state.updateState = State.success;
      })
      .addCase(updateAppointmentTypes.rejected, (state) => {
        state.updateState = State.failed;
      })
      .addCase(saveAppointmentTypes.pending, (state) => {
        state.submitState = State.loading;
      })
      .addCase(saveAppointmentTypes.fulfilled, (state, action) => {
        state.submitState = State.success;
      })
      .addCase(saveAppointmentTypes.rejected, (state) => {
        state.submitState = State.failed;
      })
      .addCase(fetchPendingAppointmentsWithUser.pending, (state) => {
        state.state = State.loading;
      })
      .addCase(fetchPendingAppointmentsWithUser.fulfilled, (state, action) => {
        state.state = State.success;
        state.pendingAppointments = action.payload;
      })
      .addCase(fetchPendingAppointmentsWithUser.rejected, (state) => {
        state.state = State.failed;
      })
      .addCase(fetchRecurrentAppointmentDetails.pending, (state) => {
        state.state = State.loading;
      })
      .addCase(fetchRecurrentAppointmentDetails.fulfilled, (state, action) => {
        state.state = State.success;
        state.selectedRecurrentAppointment = action.payload;
      })
      .addCase(fetchRecurrentAppointmentDetails.rejected, (state) => {
        state.state = State.failed;
      });
  },
});

export const { resetSelectedAppointment, resetSubmitState } =
  appointmentSlice.actions;
export default appointmentSlice.reducer;
