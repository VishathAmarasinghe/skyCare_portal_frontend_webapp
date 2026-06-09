import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AppConfig } from "@config/config";
import { State } from "../../types/types";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";

export interface RpRegisterRecord {
  registerID?: string;
  clientID: string;
  participantName?: string;
  ndisNumber?: string;
  restrictivePracticeType?: string;
  description?: string;
  behaviourSupportPlanCurrent?: boolean;
  authorisationStatus?: string;
  authorisingBody?: string;
  dateAuthorised?: string;
  reviewDate?: string;
  practitionerEmployeeID?: string;
  practitionerName?: string;
  reductionStrategyInPlace?: boolean;
  incidentIds?: string[];
  staffTrained?: boolean;
  comments?: string;
}

export interface BehaviourDataRecord {
  recordID?: string;
  clientID: string;
  participantName?: string;
  recordDate?: string;
  recordTime?: string;
  behaviourObserved?: string;
  antecedent?: string;
  staffResponse?: string;
  restrictivePracticeUsed?: string;
  outcome?: string;
  duration?: string;
  intensity?: string;
  followUpRequired?: boolean;
  staffEmployeeID?: string;
  staffName?: string;
  staffInitials?: string;
}

export interface RpEvidenceRecord {
  evidenceID?: string;
  clientID: string;
  participantName?: string;
  restrictivePracticeType?: string;
  baselineFrequency?: string;
  currentFrequency?: string;
  reductionGoal?: string;
  strategiesImplemented?: string;
  alternativeSupportsUsed?: string;
  staffTrainingCompleted?: boolean;
  behaviourDataReviewed?: boolean;
  reviewDate?: string;
  outcomeProgress?: string;
  nextActions?: string;
  responsibleEmployeeID?: string;
  responsiblePersonName?: string;
}

export interface BehaviorSupportFilters {
  requesterRole?: string;
  requesterEmployeeId?: string;
  clientId?: string;
  ndisNumber?: string;
  rpType?: string;
  authStatus?: string;
  from?: string;
  to?: string;
  intensity?: string;
  followUpRequired?: boolean | "";
  q?: string;
}

interface BehaviorSupportState {
  rpRegisters: RpRegisterRecord[];
  behaviourData: BehaviourDataRecord[];
  rpEvidence: RpEvidenceRecord[];
  loading: boolean;
  submitState: State;
}

const initialState: BehaviorSupportState = {
  rpRegisters: [],
  behaviourData: [],
  rpEvidence: [],
  loading: false,
  submitState: State.idle,
};

const buildParams = (filters: BehaviorSupportFilters) => {
  const params: Record<string, string | boolean> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      params[key] = value as string | boolean;
    }
  });
  return params;
};

export const fetchRpRegisters = createAsyncThunk(
  "behaviorSupport/fetchRp",
  async (filters: BehaviorSupportFilters, { rejectWithValue }) => {
    try {
      const res = await axios.get(AppConfig.serviceUrls.restrictivePracticeRegisters, {
        params: buildParams(filters),
      });
      return res.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const fetchBehaviourData = createAsyncThunk(
  "behaviorSupport/fetchBd",
  async (filters: BehaviorSupportFilters, { rejectWithValue }) => {
    try {
      const res = await axios.get(AppConfig.serviceUrls.behaviourDataRecords, {
        params: buildParams(filters),
      });
      return res.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const fetchRpEvidence = createAsyncThunk(
  "behaviorSupport/fetchRe",
  async (filters: BehaviorSupportFilters, { rejectWithValue }) => {
    try {
      const res = await axios.get(AppConfig.serviceUrls.restrictivePracticeEvidence, {
        params: buildParams(filters),
      });
      return res.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

const saveRecord = (url: string, record: unknown, params: Record<string, string>, isUpdate: boolean, id?: string) =>
  isUpdate ? axios.put(`${url}/${id}`, record, { params }) : axios.post(url, record, { params });

export const saveRpRegister = createAsyncThunk(
  "behaviorSupport/saveRp",
  async (
    payload: { record: RpRegisterRecord; isUpdate: boolean; requesterRole: string; requesterEmployeeId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const params = {
        requesterRole: payload.requesterRole,
        requesterEmployeeId: payload.requesterEmployeeId,
      };
      await saveRecord(
        AppConfig.serviceUrls.restrictivePracticeRegisters,
        payload.record,
        params,
        payload.isUpdate,
        payload.record.registerID
      );
      dispatch(enqueueSnackbarMessage({ message: SnackMessage.success.saveIncident, type: "success" }));
      return true;
    } catch (e) {
      dispatch(enqueueSnackbarMessage({ message: "Operation failed", type: "error" }));
      return rejectWithValue(e);
    }
  }
);

export const saveBehaviourData = createAsyncThunk(
  "behaviorSupport/saveBd",
  async (
    payload: { record: BehaviourDataRecord; isUpdate: boolean; requesterRole: string; requesterEmployeeId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const params = {
        requesterRole: payload.requesterRole,
        requesterEmployeeId: payload.requesterEmployeeId,
      };
      await saveRecord(
        AppConfig.serviceUrls.behaviourDataRecords,
        payload.record,
        params,
        payload.isUpdate,
        payload.record.recordID
      );
      dispatch(enqueueSnackbarMessage({ message: SnackMessage.success.saveIncident, type: "success" }));
      return true;
    } catch (e) {
      dispatch(enqueueSnackbarMessage({ message: "Operation failed", type: "error" }));
      return rejectWithValue(e);
    }
  }
);

export const saveRpEvidence = createAsyncThunk(
  "behaviorSupport/saveRe",
  async (
    payload: { record: RpEvidenceRecord; isUpdate: boolean; requesterRole: string; requesterEmployeeId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const params = {
        requesterRole: payload.requesterRole,
        requesterEmployeeId: payload.requesterEmployeeId,
      };
      await saveRecord(
        AppConfig.serviceUrls.restrictivePracticeEvidence,
        payload.record,
        params,
        payload.isUpdate,
        payload.record.evidenceID
      );
      dispatch(enqueueSnackbarMessage({ message: SnackMessage.success.saveIncident, type: "success" }));
      return true;
    } catch (e) {
      dispatch(enqueueSnackbarMessage({ message: "Operation failed", type: "error" }));
      return rejectWithValue(e);
    }
  }
);

export const deleteRpRegister = createAsyncThunk(
  "behaviorSupport/deleteRp",
  async (payload: { id: string; requesterRole: string }, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`${AppConfig.serviceUrls.restrictivePracticeRegisters}/${payload.id}`, {
        params: { requesterRole: payload.requesterRole },
      });
      dispatch(enqueueSnackbarMessage({ message: "Record deleted successfully", type: "success" }));
      return payload.id;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const deleteBehaviourData = createAsyncThunk(
  "behaviorSupport/deleteBd",
  async (payload: { id: string; requesterRole: string }, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`${AppConfig.serviceUrls.behaviourDataRecords}/${payload.id}`, {
        params: { requesterRole: payload.requesterRole },
      });
      dispatch(enqueueSnackbarMessage({ message: "Record deleted successfully", type: "success" }));
      return payload.id;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const deleteRpEvidence = createAsyncThunk(
  "behaviorSupport/deleteRe",
  async (payload: { id: string; requesterRole: string }, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`${AppConfig.serviceUrls.restrictivePracticeEvidence}/${payload.id}`, {
        params: { requesterRole: payload.requesterRole },
      });
      dispatch(enqueueSnackbarMessage({ message: "Record deleted successfully", type: "success" }));
      return payload.id;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const exportBehaviorCsv = (baseUrl: string, filters: BehaviorSupportFilters) => {
  const params = new URLSearchParams();
  Object.entries(buildParams(filters)).forEach(([k, v]) => params.append(k, String(v)));
  window.open(`${baseUrl}/export?${params.toString()}`, "_blank");
};

const behaviorSupportSlice = createSlice({
  name: "behaviorSupport",
  initialState,
  reducers: {
    resetBehaviorSupportSubmitState: (state) => {
      state.submitState = State.idle;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRpRegisters.pending, (state) => { state.loading = true; })
      .addCase(fetchRpRegisters.fulfilled, (state, action) => {
        state.loading = false;
        state.rpRegisters = action.payload;
      })
      .addCase(fetchBehaviourData.fulfilled, (state, action) => {
        state.behaviourData = action.payload;
      })
      .addCase(fetchRpEvidence.fulfilled, (state, action) => {
        state.rpEvidence = action.payload;
      })
      .addCase(saveRpRegister.fulfilled, (state) => { state.submitState = State.success; })
      .addCase(saveBehaviourData.fulfilled, (state) => { state.submitState = State.success; })
      .addCase(saveRpEvidence.fulfilled, (state) => { state.submitState = State.success; })
      .addCase(deleteRpRegister.fulfilled, (state, action) => {
        state.rpRegisters = state.rpRegisters.filter((r) => r.registerID !== action.payload);
      })
      .addCase(deleteBehaviourData.fulfilled, (state, action) => {
        state.behaviourData = state.behaviourData.filter((r) => r.recordID !== action.payload);
      })
      .addCase(deleteRpEvidence.fulfilled, (state, action) => {
        state.rpEvidence = state.rpEvidence.filter((r) => r.evidenceID !== action.payload);
      });
  },
});

export const { resetBehaviorSupportSubmitState } = behaviorSupportSlice.actions;
export default behaviorSupportSlice.reducer;
