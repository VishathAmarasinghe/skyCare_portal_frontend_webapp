import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";
import axios, { HttpStatusCode } from "axios";
import {
  AppointmentCalenderType,
} from "../appointmentSlice/appointment";

export interface LegacyAdminDashboard {
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

export interface TimesheetInsights {
  fromDate: string;
  toDate: string;
  previousFromDate: string;
  previousToDate: string;
  totalReceived: number;
  previousPeriodTotal: number;
  changePercent: number | null;
  averagePerDay: number;
  peakDay: string;
  peakDayCount: number;
  submissionsByDay: Record<string, number>;
}

export interface DocumentComplianceSummary {
  expired: number;
  expiringIn7Days: number;
  expiringIn30Days: number;
  missingRequired: number;
  pending: number;
  missingExpiryDate: number;
}

export type DocumentIssueType =
  | "EXPIRED"
  | "EXPIRING"
  | "MISSING_REQUIRED"
  | "PENDING"
  | "NO_EXPIRY_DATE";

export interface DocumentComplianceItem {
  employeeId: string;
  careGiverId: string;
  employeeName: string;
  careGiverType: string;
  documentTypeId: string;
  documentTypeName: string;
  status: string | null;
  expDate: string | null;
  daysUntilExpiry: number | null;
  issueType: DocumentIssueType;
  required: boolean;
}

export interface DocumentComplianceInsights {
  summary: DocumentComplianceSummary;
  expiryTimelineByWeek: Record<string, number>;
  expiringByDocumentType: Record<string, number>;
  attentionItems: DocumentComplianceItem[];
  items: DocumentComplianceItem[];
}

export interface AgreementAttention {
  awaitingSignature: number;
  sent: number;
  viewed: number;
  expired: number;
}

export interface AdminInsightsDashboard {
  staffCount: number;
  clientCount: number;
  timesheet: TimesheetInsights;
  documents: DocumentComplianceInsights;
  agreements: AgreementAttention;
}

export interface AdminInsightsQuery {
  from: string;
  to: string;
}

interface DashboardState {
  state: State;
  submitState: State;
  adminInsights: AdminInsightsDashboard | null;
  adminInsightsQuery: AdminInsightsQuery | null;
  adminDashboard: LegacyAdminDashboard | null;
  careGiverDashboard: { twoWeekAppointmentCount: Record<string, number> } | null;
  stateMessage: string | null;
  errorMessage: string | null;
  backgroundProcess: boolean;
  backgroundProcessMessage: string | null;
}

const initialState: DashboardState = {
  state: State.idle,
  submitState: State.idle,
  adminInsights: null,
  adminInsightsQuery: null,
  adminDashboard: null,
  careGiverDashboard: null,
  stateMessage: "",
  errorMessage: "",
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

export const fetchAdminDashboard = createAsyncThunk(
  "dashboard/fetchAdminDashboard",
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
              : String((error as { response?: { data?: unknown } }).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const fetchAdminInsightsDashboard = createAsyncThunk(
  "dashboard/fetchAdminInsightsDashboard",
  async (query: AdminInsightsQuery, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.dashboard}/admin/insights?from=${query.from}&to=${query.to}`
      );
      return { data: response.data as AdminInsightsDashboard, query };
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
              : String((error as { response?: { data?: unknown } }).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

export const fetchCareGiverDashboard = createAsyncThunk(
  "dashboard/fetchCareGiverDashboard",
  async (employeeID: string, { dispatch, rejectWithValue }) => {
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
              : String((error as { response?: { data?: unknown } }).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

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
      .addCase(fetchAdminInsightsDashboard.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching admin dashboard..";
      })
      .addCase(fetchAdminInsightsDashboard.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched admin dashboard!";
        state.adminInsights = action.payload.data;
        state.adminInsightsQuery = action.payload.query;
      })
      .addCase(fetchAdminInsightsDashboard.rejected, (state) => {
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

export default DashboardSlice.reducer;
