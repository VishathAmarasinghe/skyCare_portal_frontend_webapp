import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AppConfig } from "@config/config";
import { State } from "../../types/types";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";

export interface StaffTrainingRecord {
  recordID?: string;
  employeeID?: string;
  staffNameManual?: string;
  employeeName?: string;
  position?: string;
  trainingCourse: string;
  provider?: string;
  dateCompleted?: string;
  expiryDate?: string;
  certificateFiled?: boolean;
  hasCertificate?: boolean;
  competencyAssessed?: boolean;
  assessorEmployeeID?: string;
  assessorNameManual?: string;
  assessorName?: string;
  comments?: string;
  expiryStatus?: string;
  clearCertificate?: boolean;
}

export interface StaffTrainingFilters {
  employeeId?: string;
  course?: string;
  provider?: string;
  expiryStatus?: string;
  from?: string;
  to?: string;
  competencyAssessed?: boolean | "";
  certificateFiled?: boolean | "";
  q?: string;
  requesterRole?: string;
  requesterEmployeeId?: string;
}

interface StaffTrainingState {
  records: StaffTrainingRecord[];
  loading: boolean;
  submitState: State;
}

const initialState: StaffTrainingState = {
  records: [],
  loading: false,
  submitState: State.idle,
};

const buildParams = (filters: StaffTrainingFilters) => {
  const params: Record<string, string | boolean> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      params[key] = value as string | boolean;
    }
  });
  return params;
};

export const fetchStaffTrainingRecords = createAsyncThunk(
  "staffTraining/fetch",
  async (filters: StaffTrainingFilters, { rejectWithValue }) => {
    try {
      const res = await axios.get(AppConfig.serviceUrls.staffTrainingRecords, {
        params: buildParams(filters),
      });
      return res.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const saveStaffTrainingRecord = createAsyncThunk(
  "staffTraining/save",
  async (
    payload: {
      record: StaffTrainingRecord;
      certificate?: File | null;
      isUpdate: boolean;
      requesterRole: string;
      requesterEmployeeId: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const form = new FormData();
      form.append("record", JSON.stringify(payload.record));
      if (payload.certificate) form.append("certificate", payload.certificate);
      const params = {
        requesterRole: payload.requesterRole,
        requesterEmployeeId: payload.requesterEmployeeId,
      };
      const res = payload.isUpdate
        ? await axios.put(
            `${AppConfig.serviceUrls.staffTrainingRecords}/${payload.record.recordID}`,
            form,
            { params, headers: { "Content-Type": "multipart/form-data" } }
          )
        : await axios.post(AppConfig.serviceUrls.staffTrainingRecords, form, {
            params,
            headers: { "Content-Type": "multipart/form-data" },
          });
      dispatch(enqueueSnackbarMessage({ message: SnackMessage.success.saveIncident, type: "success" }));
      return res.data;
    } catch (e) {
      dispatch(enqueueSnackbarMessage({ message: "Operation failed", type: "error" }));
      return rejectWithValue(e);
    }
  }
);

export const deleteStaffTrainingRecord = createAsyncThunk(
  "staffTraining/delete",
  async (
    payload: { recordID: string; requesterRole: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await axios.delete(`${AppConfig.serviceUrls.staffTrainingRecords}/${payload.recordID}`, {
        params: { requesterRole: payload.requesterRole },
      });
      dispatch(enqueueSnackbarMessage({ message: "Record deleted successfully", type: "success" }));
      return payload.recordID;
    } catch (e) {
      dispatch(enqueueSnackbarMessage({ message: "Operation failed", type: "error" }));
      return rejectWithValue(e);
    }
  }
);

export const downloadStaffTrainingCertificate = async (recordID: string, params: Record<string, string>) => {
  const res = await axios.get(
    `${AppConfig.serviceUrls.staffTrainingRecords}/${recordID}/certificate`,
    { params, responseType: "blob" }
  );
  const url = window.URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `certificate-${recordID}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportStaffTrainingCsv = (filters: StaffTrainingFilters) => {
  const params = new URLSearchParams();
  Object.entries(buildParams(filters)).forEach(([k, v]) => params.append(k, String(v)));
  window.open(`${AppConfig.serviceUrls.staffTrainingRecords}/export?${params.toString()}`, "_blank");
};

const staffTrainingSlice = createSlice({
  name: "staffTraining",
  initialState,
  reducers: {
    resetStaffTrainingSubmitState: (state) => {
      state.submitState = State.idle;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffTrainingRecords.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStaffTrainingRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchStaffTrainingRecords.rejected, (state) => {
        state.loading = false;
      })
      .addCase(saveStaffTrainingRecord.pending, (state) => {
        state.submitState = State.loading;
      })
      .addCase(saveStaffTrainingRecord.fulfilled, (state) => {
        state.submitState = State.success;
      })
      .addCase(saveStaffTrainingRecord.rejected, (state) => {
        state.submitState = State.failed;
      })
      .addCase(deleteStaffTrainingRecord.fulfilled, (state, action) => {
        state.records = state.records.filter((r) => r.recordID !== action.payload);
      });
  },
});

export const { resetStaffTrainingSubmitState } = staffTrainingSlice.actions;
export default staffTrainingSlice.reducer;
