import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { AppConfig } from "../../config/config";
import { State } from "../../types/types";
import { enqueueSnackbarMessage } from "../commonSlice/common";

export interface EmailTemplate {
  templateID: string;
  title: string;
  content: string;
  category?: string;
  placeholdersMetadata?: string;
}

export interface EmailPlaceholderItem {
  token: string;
  description: string;
  exampleOutput: string;
}

export interface EmailTemplatePreview {
  mergedSubject: string;
  mergedBodyHtml: string;
  fullHtml: string;
  fromAddress: string;
  sampleRecipient: string;
}

interface EmailTemplateState {
  state: State;
  updateState: State;
  previewState: State;
  templates: EmailTemplate[];
  selectedTemplate: EmailTemplate | null;
  placeholders: EmailPlaceholderItem[];
  preview: EmailTemplatePreview | null;
}

const initialState: EmailTemplateState = {
  state: State.idle,
  updateState: State.idle,
  previewState: State.idle,
  templates: [],
  selectedTemplate: null,
  placeholders: [],
  preview: null,
};

export const fetchEmailTemplates = createAsyncThunk(
  "emailTemplates/fetchAll",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.emailTemplates
      );
      return response.data as EmailTemplate[];
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to load email templates.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateEmailTemplate = createAsyncThunk(
  "emailTemplates/update",
  async (
    { id, payload }: { id: string; payload: EmailTemplate },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().put(
        `${AppConfig.serviceUrls.emailTemplates}/${id}`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Email template saved.",
          type: "success",
        })
      );
      return response.data as EmailTemplate;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to save email template.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchEmailPlaceholders = createAsyncThunk(
  "emailTemplates/fetchPlaceholders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.emailTemplatePlaceholders
      );
      return response.data as EmailPlaceholderItem[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const previewEmailTemplate = createAsyncThunk(
  "emailTemplates/preview",
  async (
    payload: {
      subject: string;
      bodyHtml: string;
      sampleRecipientName?: string;
      sampleRecipientEmail?: string;
      tokenOverrides?: Record<string, string>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.emailTemplatePreview,
        payload
      );
      return response.data as EmailTemplatePreview;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const testSendEmailTemplate = createAsyncThunk(
  "emailTemplates/testSend",
  async (
    payload: { recipientEmail: string; subject: string; content: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await APIService.getInstance().post(
        `${AppConfig.serviceUrls.emailTemplates}/test-send`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Test email sent.",
          type: "success",
        })
      );
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to send test email.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

const emailTemplateSlice = createSlice({
  name: "emailTemplates",
  initialState,
  reducers: {
    setSelectedEmailTemplate(state, action) {
      state.selectedTemplate = action.payload;
    },
    clearEmailPreview(state) {
      state.preview = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmailTemplates.fulfilled, (state, action) => {
        state.state = State.success;
        state.templates = action.payload;
      })
      .addCase(updateEmailTemplate.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.selectedTemplate = action.payload;
      })
      .addCase(fetchEmailPlaceholders.fulfilled, (state, action) => {
        state.placeholders = action.payload;
      })
      .addCase(previewEmailTemplate.pending, (state) => {
        state.previewState = State.loading;
      })
      .addCase(previewEmailTemplate.fulfilled, (state, action) => {
        state.previewState = State.success;
        state.preview = action.payload;
      })
      .addCase(previewEmailTemplate.rejected, (state) => {
        state.previewState = State.failed;
      });
  },
});

export const { setSelectedEmailTemplate, clearEmailPreview } = emailTemplateSlice.actions;
export default emailTemplateSlice.reducer;
