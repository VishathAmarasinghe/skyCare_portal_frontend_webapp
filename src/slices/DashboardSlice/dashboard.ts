import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../Config/constant";
import axios, { HttpStatusCode } from "axios";
import {
  AppointmentAddress,
  AppointmentCalenderType,
} from "../AppointmentSlice/appointment";

export interface Dashboard {
  clientCount: number;
  serviceCount: number;
  staffCount: number;
  adminCount: number;

  todayTotalCount: number;
  todayCompletedCount: number;
  todayAppointments: AppointmentCalenderType[];

  twoWeekAppointmentCount: Record<string, number>;
  appointmentCountByType: Record<string, number>;
}

export interface CareGiverDashboard {
  twoWeekAppointmentCount: Record<string, number>;
}

interface DashboardState {
  state: State;
  submitState: State;
  adminDashboard: Dashboard | null;
  careGiverDashboard: CareGiverDashboard | null;
  stateMessage: string | null;
  errorMessage: string | null;
  backgroundProcess: boolean;
  backgroundProcessMessage: string | null;
}

// Define the initial state for the ResourceSlice
const initialState: DashboardState = {
  state: State.idle,
  submitState: State.idle,
  adminDashboard: null,
  careGiverDashboard: null,
  stateMessage: "",
  errorMessage: "",
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

// Fetch single resources
export const fetchAdminDashboard = createAsyncThunk(
  "incident/fetchAdminDashboard",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.dashboard + "/admin"
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
              ? SnackMessage.error.fetchDashboard
              : String((error as any).response?.data?.message),
          type: "error",
        })
      );
      throw error;
    }
  }
);

// Fetch single resources
export const fetchCareGiverDashboard = createAsyncThunk(
  "incident/fetchCareGiverDashboard",
  async (employeeID:string, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.dashboard + `/careGiver/${employeeID}`
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
              ? SnackMessage.error.fetchDashboard
              : String((error as any).response?.data?.message),
          type: "error",
        })
      );
      throw error;
    }
  }
);

// Define the slice with reducers and extraReducers
const DashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching admin dashboard..";
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched admin dashboard!";
        state.adminDashboard = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch AdminDashboard!";
      })
      .addCase(fetchCareGiverDashboard.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching caregiver dashboard..";
      })
      .addCase(fetchCareGiverDashboard.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched careGiver dashboard!";
        state.careGiverDashboard = action.payload;
      })
      .addCase(fetchCareGiverDashboard.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch care giver Dashboard!";
      });
  },
});

export const {} = DashboardSlice.actions;
export default DashboardSlice.reducer;
