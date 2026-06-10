import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AppConfig } from "@config/config";
import { State } from "../../types/types";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";

export interface ComplianceLookupItem {
  lookupID: string;
  lookupType?: string;
  title: string;
  description?: string;
  status?: string;
  sortOrder?: number;
}

interface ComplianceLookupState {
  trainingCourses: ComplianceLookupItem[];
  trainingProviders: ComplianceLookupItem[];
  rpTypes: ComplianceLookupItem[];
  authStatuses: ComplianceLookupItem[];
  authBodies: ComplianceLookupItem[];
  intensities: ComplianceLookupItem[];
  loading: boolean;
  submitState: State;
}

const initialState: ComplianceLookupState = {
  trainingCourses: [],
  trainingProviders: [],
  rpTypes: [],
  authStatuses: [],
  authBodies: [],
  intensities: [],
  loading: false,
  submitState: State.idle,
};

export const fetchTrainingCourses = createAsyncThunk(
  "complianceLookup/fetchTrainingCourses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(AppConfig.serviceUrls.trainingCourseTypes);
      return res.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const fetchTrainingProviders = createAsyncThunk(
  "complianceLookup/fetchTrainingProviders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(AppConfig.serviceUrls.trainingProviders);
      return res.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const fetchRpTypes = createAsyncThunk(
  "complianceLookup/fetchRpTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(AppConfig.serviceUrls.restrictivePracticeTypes);
      return res.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const fetchAuthStatuses = createAsyncThunk(
  "complianceLookup/fetchAuthStatuses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(AppConfig.serviceUrls.authorisationStatuses);
      return res.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const fetchAuthBodies = createAsyncThunk(
  "complianceLookup/fetchAuthBodies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(AppConfig.serviceUrls.authorisingBodies);
      return res.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const fetchIntensities = createAsyncThunk(
  "complianceLookup/fetchIntensities",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(AppConfig.serviceUrls.behaviourIntensities);
      return res.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const saveLookupItem = createAsyncThunk(
  "complianceLookup/save",
  async (
    payload: { url: string; item: ComplianceLookupItem; isUpdate: boolean },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = payload.isUpdate
        ? await axios.put(`${payload.url}/${payload.item.lookupID}`, payload.item)
        : await axios.post(payload.url, payload.item);
      dispatch(enqueueSnackbarMessage({ message: "Saved successfully", type: "success" }));
      return res.data;
    } catch (e) {
      dispatch(enqueueSnackbarMessage({ message: "Operation failed", type: "error" }));
      return rejectWithValue(e);
    }
  }
);

export const deleteLookupItem = createAsyncThunk(
  "complianceLookup/delete",
  async (
    payload: { url: string; lookupID: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await axios.delete(`${payload.url}/${payload.lookupID}`);
      dispatch(enqueueSnackbarMessage({ message: "Deleted successfully", type: "success" }));
      return payload.lookupID;
    } catch (e) {
      dispatch(enqueueSnackbarMessage({ message: "Operation failed", type: "error" }));
      return rejectWithValue(e);
    }
  }
);

const complianceLookupSlice = createSlice({
  name: "complianceLookup",
  initialState,
  reducers: {
    resetComplianceLookupSubmitState: (state) => {
      state.submitState = State.idle;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainingCourses.fulfilled, (state, action) => {
        state.trainingCourses = action.payload;
      })
      .addCase(fetchTrainingProviders.fulfilled, (state, action) => {
        state.trainingProviders = action.payload;
      })
      .addCase(fetchRpTypes.fulfilled, (state, action) => {
        state.rpTypes = action.payload;
      })
      .addCase(fetchAuthStatuses.fulfilled, (state, action) => {
        state.authStatuses = action.payload;
      })
      .addCase(fetchAuthBodies.fulfilled, (state, action) => {
        state.authBodies = action.payload;
      })
      .addCase(fetchIntensities.fulfilled, (state, action) => {
        state.intensities = action.payload;
      })
      .addCase(saveLookupItem.pending, (state) => {
        state.submitState = State.loading;
      })
      .addCase(saveLookupItem.fulfilled, (state) => {
        state.submitState = State.success;
      })
      .addCase(saveLookupItem.rejected, (state) => {
        state.submitState = State.failed;
      })
      .addCase(deleteLookupItem.pending, (state) => {
        state.submitState = State.loading;
      })
      .addCase(deleteLookupItem.fulfilled, (state) => {
        state.submitState = State.success;
      })
      .addCase(deleteLookupItem.rejected, (state) => {
        state.submitState = State.failed;
      });
  },
});

export const { resetComplianceLookupSubmitState } = complianceLookupSlice.actions;
export default complianceLookupSlice.reducer;
