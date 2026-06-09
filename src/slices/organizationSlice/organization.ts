import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { AppConfig } from "../../config/config";
import { State } from "../../types/types";
import { enqueueSnackbarMessage } from "../commonSlice/common";

export interface OrganizationSetting {
  id?: string;
  name: string;
  abn: string;
  address: string;
  phone: string;
  email: string;
  directorName: string;
  logoPath?: string;
  logoUrl?: string;
}

interface OrganizationState {
  state: State;
  updateState: State;
  organization: OrganizationSetting | null;
}

const initialState: OrganizationState = {
  state: State.idle,
  updateState: State.idle,
  organization: null,
};

export const fetchOrganizationSetting = createAsyncThunk(
  "organization/fetch",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.organizationSettings
      );
      return response.data as OrganizationSetting;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to load organization settings.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateOrganizationSetting = createAsyncThunk(
  "organization/update",
  async (payload: OrganizationSetting, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(
        AppConfig.serviceUrls.organizationSettings,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Organization details saved.",
          type: "success",
        })
      );
      return response.data as OrganizationSetting;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to save organization details.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const uploadOrganizationLogo = createAsyncThunk(
  "organization/uploadLogo",
  async (file: File, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.organizationSettings}/logo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Organization logo uploaded.",
          type: "success",
        })
      );
      return response.data as OrganizationSetting;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to upload logo.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizationSetting.fulfilled, (state, action) => {
        state.state = State.success;
        state.organization = action.payload;
      })
      .addCase(updateOrganizationSetting.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.organization = action.payload;
      })
      .addCase(uploadOrganizationLogo.fulfilled, (state, action) => {
        state.organization = action.payload;
      });
  },
});

export default organizationSlice.reducer;
