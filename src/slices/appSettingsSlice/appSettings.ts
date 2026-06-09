import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { HttpStatusCode } from "axios";
import { APIService } from "../../utils/apiService";
import { AppConfig } from "../../config/config";
import { State } from "../../types/types";
import { enqueueSnackbarMessage } from "../commonSlice/common";

export type HomeMessageType = "WARNING" | "IMPORTANT" | "GENERAL";

export interface HomeMessageSetting {
  enabled: boolean;
  message: string | null;
  type: HomeMessageType;
  updatedAt?: string | null;
}

interface AppSettingsState {
  state: State;
  updateState: State;
  homeMessage: HomeMessageSetting | null;
}

const initialState: AppSettingsState = {
  state: State.idle,
  updateState: State.idle,
  homeMessage: null,
};

export const fetchHomeMessageSetting = createAsyncThunk(
  "appSettings/fetchHomeMessageSetting",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.homeMessage
      );
      return response.data as HomeMessageSetting;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? "Unable to load home message settings."
              : "Unable to load home message settings.",
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

export const updateHomeMessageSetting = createAsyncThunk(
  "appSettings/updateHomeMessageSetting",
  async (payload: HomeMessageSetting, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(
        AppConfig.serviceUrls.homeMessage,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Home message updated successfully.",
          type: "success",
        })
      );
      return response.data as HomeMessageSetting;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? "Unable to update home message."
              : "Unable to update home message.",
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

const AppSettingsSlice = createSlice({
  name: "appSettings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeMessageSetting.pending, (state) => {
        state.state = State.loading;
      })
      .addCase(fetchHomeMessageSetting.fulfilled, (state, action) => {
        state.state = State.success;
        state.homeMessage = action.payload;
      })
      .addCase(fetchHomeMessageSetting.rejected, (state) => {
        state.state = State.failed;
      })
      .addCase(updateHomeMessageSetting.pending, (state) => {
        state.updateState = State.loading;
      })
      .addCase(updateHomeMessageSetting.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.homeMessage = action.payload;
      })
      .addCase(updateHomeMessageSetting.rejected, (state) => {
        state.updateState = State.failed;
      });
  },
});

export default AppSettingsSlice.reducer;

