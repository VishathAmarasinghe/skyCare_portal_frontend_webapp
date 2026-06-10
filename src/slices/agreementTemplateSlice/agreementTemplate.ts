import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { HttpStatusCode } from "axios";
import { APIService } from "../../utils/apiService";
import { AppConfig } from "../../config/config";
import { State } from "../../types/types";
import { enqueueSnackbarMessage } from "../commonSlice/common";

export interface AgreementTemplateVersionSummary {
  id: string;
  versionNumber: number;
  status: string;
  changeNotes?: string;
  publishedAt?: string;
  publishedBy?: string;
  createdAt?: string;
}

export interface AgreementTemplate {
  id: string;
  templateKey: string;
  displayName: string;
  audience: "WORKER" | "CLIENT";
  careGiverType?: string | null;
  defaultForAudience: boolean;
  status: string;
  publishedVersionNumber?: number;
  publishedVersionId?: string;
  versions?: AgreementTemplateVersionSummary[];
}

export interface AgreementTemplateVersion {
  id: string;
  templateId: string;
  templateKey: string;
  versionNumber: number;
  status: string;
  contentHtml: string;
  changeNotes?: string;
}

export interface PlaceholderItem {
  token: string;
  category: string;
  description: string;
  exampleOutput: string;
  sourceEntity: string;
}

export interface PlaceholderCategory {
  category: string;
  items: PlaceholderItem[];
}

export interface AgreementPreviewResponse {
  mergedHtml: string;
  templateKey: string;
  versionNumber: number;
}

export interface AgreementAssignment {
  id?: string;
  templateId: string;
  templateKey?: string;
  templateDisplayName?: string;
  ruleType: string;
  careGiverType: string;
  priority: number;
}

interface AgreementTemplateState {
  state: State;
  submitState: State;
  updateState: State;
  templates: AgreementTemplate[];
  selectedTemplate: AgreementTemplate | null;
  selectedVersion: AgreementTemplateVersion | null;
  previewHtml: string | null;
  placeholders: PlaceholderCategory[];
  assignments: AgreementAssignment[];
  assignmentUpdateState: State;
}

const initialState: AgreementTemplateState = {
  state: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  templates: [],
  selectedTemplate: null,
  selectedVersion: null,
  previewHtml: null,
  placeholders: [],
  assignments: [],
  assignmentUpdateState: State.idle,
};

export const fetchAgreementTemplates = createAsyncThunk(
  "agreementTemplates/fetchAll",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.agreementTemplates
      );
      return response.data as AgreementTemplate[];
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to load agreement templates.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createAgreementTemplate = createAsyncThunk(
  "agreementTemplates/create",
  async (payload: Record<string, unknown>, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.agreementTemplates,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Agreement template created.",
          type: "success",
        })
      );
      return response.data as AgreementTemplate;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: error.response?.data?.message || "Unable to create template.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAgreementTemplateVersion = createAsyncThunk(
  "agreementTemplates/fetchVersion",
  async (versionId: string, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.agreementTemplateVersions}/${versionId}`
      );
      return response.data as AgreementTemplateVersion;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateAgreementTemplateVersion = createAsyncThunk(
  "agreementTemplates/updateVersion",
  async (
    { versionId, payload }: { versionId: string; payload: Record<string, unknown> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().put(
        `${AppConfig.serviceUrls.agreementTemplateVersions}/${versionId}`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Draft saved.",
          type: "success",
        })
      );
      return response.data as AgreementTemplateVersion;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to save draft.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const publishAgreementTemplateVersion = createAsyncThunk(
  "agreementTemplates/publishVersion",
  async (versionId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreementTemplateVersions}/${versionId}/publish`
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Template version published.",
          type: "success",
        })
      );
      return response.data as AgreementTemplateVersion;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: error.response?.data?.message || "Unable to publish version.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createAgreementTemplateVersion = createAsyncThunk(
  "agreementTemplates/createVersion",
  async (
    { templateId, changeNotes }: { templateId: string; changeNotes?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreementTemplates}/${templateId}/versions`,
        { changeNotes }
      );
      return response.data as AgreementTemplateVersion;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to create draft version.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const previewAgreementTemplateVersion = createAsyncThunk(
  "agreementTemplates/previewVersion",
  async (versionId: string, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreementTemplateVersions}/${versionId}/preview`,
        { useSampleData: true }
      );
      return response.data as AgreementPreviewResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const uploadAgreementAsset = createAsyncThunk(
  "agreementTemplates/uploadAsset",
  async (
    { file, templateId }: { file: File; templateId?: string },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (templateId) {
        formData.append("templateId", templateId);
      }
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.agreementTemplateAssets,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data as { assetId: string; url: string };
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchPlaceholderCatalog = createAsyncThunk(
  "agreementTemplates/fetchPlaceholders",
  async (query: string | undefined, { rejectWithValue }) => {
    try {
      const url = query
        ? `${AppConfig.serviceUrls.agreementPlaceholders}?q=${encodeURIComponent(query)}`
        : AppConfig.serviceUrls.agreementPlaceholders;
      const response = await APIService.getInstance().get(url);
      return response.data as PlaceholderCategory[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAgreementAssignments = createAsyncThunk(
  "agreementTemplates/fetchAssignments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.agreementAssignments
      );
      return response.data as AgreementAssignment[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const saveAgreementAssignments = createAsyncThunk(
  "agreementTemplates/saveAssignments",
  async (assignments: AgreementAssignment[], { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(
        AppConfig.serviceUrls.agreementAssignments,
        assignments
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Assignment rules saved.",
          type: "success",
        })
      );
      return response.data as AgreementAssignment[];
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to save assignment rules.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

const agreementTemplateSlice = createSlice({
  name: "agreementTemplates",
  initialState,
  reducers: {
    setSelectedTemplate(state, action: PayloadAction<AgreementTemplate | null>) {
      state.selectedTemplate = action.payload;
    },
    clearPreview(state) {
      state.previewHtml = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgreementTemplates.pending, (state) => {
        state.state = State.loading;
      })
      .addCase(fetchAgreementTemplates.fulfilled, (state, action) => {
        state.state = State.success;
        state.templates = action.payload;
      })
      .addCase(fetchAgreementTemplates.rejected, (state) => {
        state.state = State.failed;
      })
      .addCase(createAgreementTemplate.fulfilled, (state) => {
        state.submitState = State.success;
      })
      .addCase(fetchAgreementTemplateVersion.fulfilled, (state, action) => {
        state.selectedVersion = action.payload;
      })
      .addCase(updateAgreementTemplateVersion.fulfilled, (state, action) => {
        state.selectedVersion = action.payload;
        state.updateState = State.success;
      })
      .addCase(previewAgreementTemplateVersion.fulfilled, (state, action) => {
        state.previewHtml = action.payload.mergedHtml;
      })
      .addCase(fetchPlaceholderCatalog.fulfilled, (state, action) => {
        state.placeholders = action.payload;
      })
      .addCase(fetchAgreementAssignments.fulfilled, (state, action) => {
        state.assignments = action.payload;
      })
      .addCase(saveAgreementAssignments.fulfilled, (state, action) => {
        state.assignments = action.payload;
        state.assignmentUpdateState = State.success;
      });
  },
});

export const { setSelectedTemplate, clearPreview } = agreementTemplateSlice.actions;
export default agreementTemplateSlice.reducer;
