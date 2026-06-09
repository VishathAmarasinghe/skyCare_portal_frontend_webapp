import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { APIService } from "../../utils/apiService";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";

export interface AgreementReferenceMaterial {
  id: string;
  title: string;
  description?: string;
  originalFilename?: string;
  mimeType?: string;
  audience: string;
  careGiverType?: string;
  sortOrder: number;
  active: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgreementReferenceMaterialSummary {
  id: string;
  title: string;
  description?: string;
  originalFilename?: string;
  mimeType?: string;
}

interface AgreementReferenceMaterialState {
  materials: AgreementReferenceMaterial[];
  loading: boolean;
}

const initialState: AgreementReferenceMaterialState = {
  materials: [],
  loading: false,
};

export const fetchReferenceMaterials = createAsyncThunk(
  "agreementReferenceMaterials/fetchAll",
  async (
    params: { recipientType?: string; careGiverType?: string } | undefined,
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.agreementReferenceMaterials,
        { params }
      );
      return response.data as AgreementReferenceMaterial[];
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: error.response?.data?.message || "Unable to load reference materials.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const uploadReferenceMaterial = createAsyncThunk(
  "agreementReferenceMaterials/upload",
  async (
    {
      file,
      title,
      description,
      audience,
      careGiverType,
      sortOrder,
      createdBy,
    }: {
      file: File;
      title: string;
      description?: string;
      audience?: string;
      careGiverType?: string;
      sortOrder?: number;
      createdBy?: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      if (description) formData.append("description", description);
      if (audience) formData.append("audience", audience);
      if (careGiverType) formData.append("careGiverType", careGiverType);
      if (sortOrder != null) formData.append("sortOrder", String(sortOrder));
      if (createdBy) formData.append("createdBy", createdBy);

      const response = await axios.post(
        `${AppConfig.serviceUrls.agreementReferenceMaterials}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Reference material uploaded.",
          type: "success",
        })
      );
      return response.data as AgreementReferenceMaterial;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: error.response?.data?.message || "Unable to upload reference material.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateReferenceMaterial = createAsyncThunk(
  "agreementReferenceMaterials/update",
  async (
    {
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Pick<AgreementReferenceMaterial, "title" | "description" | "audience" | "careGiverType" | "sortOrder">> & {
        active?: boolean;
      };
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().put(
        `${AppConfig.serviceUrls.agreementReferenceMaterials}/${id}`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Reference material updated.",
          type: "success",
        })
      );
      return response.data as AgreementReferenceMaterial;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: error.response?.data?.message || "Unable to update reference material.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deactivateReferenceMaterial = createAsyncThunk(
  "agreementReferenceMaterials/deactivate",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      await APIService.getInstance().delete(
        `${AppConfig.serviceUrls.agreementReferenceMaterials}/${id}`
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Reference material removed.",
          type: "success",
        })
      );
      return id;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: error.response?.data?.message || "Unable to remove reference material.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const downloadReferenceMaterialAdmin = async (id: string, filename?: string) => {
  const response = await APIService.getInstance().get(
    `${AppConfig.serviceUrls.agreementReferenceMaterials}/${id}/download`,
    { responseType: "blob" }
  );
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename || "reference-material";
  link.click();
  window.URL.revokeObjectURL(url);
};

const agreementReferenceMaterialSlice = createSlice({
  name: "agreementReferenceMaterials",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferenceMaterials.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReferenceMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload;
      })
      .addCase(fetchReferenceMaterials.rejected, (state) => {
        state.loading = false;
      })
      .addCase(uploadReferenceMaterial.fulfilled, (state, action) => {
        state.materials = [...state.materials, action.payload].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)
        );
      })
      .addCase(updateReferenceMaterial.fulfilled, (state, action) => {
        state.materials = state.materials
          .map((item) => (item.id === action.payload.id ? action.payload : item))
          .filter((item) => item.active)
          .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
      })
      .addCase(deactivateReferenceMaterial.fulfilled, (state, action) => {
        state.materials = state.materials.filter((item) => item.id !== action.payload);
      });
  },
});

export default agreementReferenceMaterialSlice.reducer;
