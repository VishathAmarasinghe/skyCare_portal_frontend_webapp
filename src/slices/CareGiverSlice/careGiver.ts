import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../Config/constant";
import axios, { HttpStatusCode } from "axios";
import { Employee } from "../EmployeeSlice/employee";

// Define types for CareGiver and related entities
export interface CareGiverPayments {
  careGiverID: string;
  paymentTypeID: string;
  amount: number;
}

export interface CareGiverDocuments {
  careGiverID: string;
  documentTypeID: string;
  expDate: string;
  status: string;
  document: string;
}

export interface CareGiverDocumentTypes {
  documentTypeID: string;
  documentName: string;
  expDateNeeded: boolean;
}

export interface CareGiverPaymentTypes {
  paymentName: string;
  paymentTypeID: string;
  state: string;
}

export interface CareGiver {
  careGiverID: string;
  employee: Employee;
  status: string;
  careGiverPayments: CareGiverPayments[];
  careGiverDocuments: CareGiverDocuments[];
}

// Define a type for the slice state
interface CareGiverState {
  state: State;
  submitState: State;
  updateState: State;
  supportWorkerState: State;
  stateMessage: string | null;
  errorMessage: string | null;
  selectedCareGiver: CareGiver | null;
  careGiverDocumentTypes: CareGiverDocumentTypes[];
  careGiverPaymentTypes: CareGiverPaymentTypes[];
  careGivers: CareGiver[];
  totalCareGiverCount: number;
  [key: string]: any;
}

// Define the initial state
const initialState: CareGiverState = {
  state: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  supportWorkerState: State.idle,
  careGiverDocumentTypes: [],
  careGiverPaymentTypes: [],
  stateMessage: "",
  errorMessage: "",
  selectedCareGiver: null,
  careGivers: [],
  totalCareGiverCount: 0,
};

// Fetch all caregivers
export const fetchDocumentTypes = createAsyncThunk(
  "careGiver/fetchCareGiverDocumentTypes",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.careGiverDocumentTypes
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchCareGiverDocumentTypes
              : String(error.response?.data?.message),
          type: "error",
        })
      );
      throw error.response?.data?.message;
    }
  }
);

// Fetch all caregivers
export const saveDocumentTypes = createAsyncThunk(
  "careGiver/saveCareGiverDocumentTypes",
  async (payload:CareGiverDocumentTypes, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.careGiverDocumentTypes,payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.saveCareGiverDocumentType,
          type: "success",
        })
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.saveCareGiverDocumentType
              : String(error.response?.data?.message),
          type: "error",
        })
      );
      throw error.response?.data?.message;
    }
  }
);


export const updateDocumentTypes = createAsyncThunk(
  "careGiver/updateCareGiverDocumentTypes",
  async (payload:CareGiverDocumentTypes, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(
        AppConfig.serviceUrls.careGiverDocumentTypes+`/${payload?.documentTypeID}`,payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.updateCareGiverDocumentType,
          type: "success",
        })
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.updateCareGiverDocumentType
              : String(error.response?.data?.message),
          type: "error",
        })
      );
      throw error.response?.data?.message;
    }
  }
);

export const updatePaymentTypes = createAsyncThunk(
  "careGiver/updateCareGiverPaymentTypes",
  async (payload:CareGiverPaymentTypes, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(
        AppConfig.serviceUrls.careGiverPaymentTypes+`/${payload?.paymentTypeID}`,payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.updateCareGiverPaymentType,
          type: "success",
        })
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.updateCareGiverPaymentType
              : String(error.response?.data?.message),
          type: "error",
        })
      );
      throw error.response?.data?.message;
    }
  }
);


export const savePaymentTypes = createAsyncThunk(
  "careGiver/saveCareGiverPaymentTypes",
  async (payload:CareGiverPaymentTypes, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.careGiverPaymentTypes,payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.saveCareGiverPaymentType,
          type: "success",
        })
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.saveCareGiverPaymentType
              : String(error.response?.data?.message),
          type: "error",
        })
      );
      throw error.response?.data?.message;
    }
  }
);

export const fetchPaymentTypes = createAsyncThunk(
  "careGiver/fetchCareGiverPaymentTypes",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.careGiverPaymentTypes
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchCareGiverPaymentTypes
              : String(error.response?.data?.message),
          type: "error",
        })
      );
      throw error.response?.data?.message;
    }
  }
);

// Fetch all caregivers
export const fetchCareGivers = createAsyncThunk(
  "careGiver/fetchCareGivers",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.careGivers
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchCareGivers
              : String(error.response?.data?.message),
          type: "error",
        })
      );
      throw error.response?.data?.message;
    }
  }
);

// Fetch a single caregiver
export const fetchSingleCareGiverByEmployeeID = createAsyncThunk(
  "careGiver/fetchSingleCareGiverByEmployeeID",
  async (emploeeID: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.careGivers}/employee?employeeID=${emploeeID}`
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchSingleCareGiver
              : String(error.response?.data?.message),
          type: "error",
        })
      );
      throw error.response?.data?.message;
    }
  }
);

// Fetch a single caregiver
export const fetchSingleCareGiver = createAsyncThunk(
  "careGiver/fetchSingleCareGiver",
  async (careGiverID: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.careGivers}/${careGiverID}`
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchSingleCareGiver
              : String(error.response?.data?.message),
          type: "error",
        })
      );
      throw error.response?.data?.message;
    }
  }
);

// Save a caregiver
export const updateCareGiver = createAsyncThunk(
  "careGiver/updateCareGiver",
  async (payload:{careGiverData:CareGiver,profilePhoto:File|null,uploadFiles:File[]}, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("careGiver", JSON.stringify(payload.careGiverData));
      if(payload.profilePhoto){
        formData.append("profile_photo", payload.profilePhoto);
      }
      payload.uploadFiles.forEach((file) => {
        formData.append("documents", file);
      });
      const response = await APIService.getInstance().put(
        AppConfig.serviceUrls.careGivers+`/${payload.careGiverData.careGiverID}`,
        formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.updateCareGiver,
          type: "success",
        })
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.updateCareGiver
              : String(error.response?.data?.message),
          type: "error",
        })
      );
      throw error.response?.data?.message;
    }
  }
);

// Save a caregiver
export const saveCareGiver = createAsyncThunk(
  "careGiver/saveCareGiver",
  async (payload:{careGiverData:CareGiver,profilePhoto:File|null,uploadFiles:File[]}, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("careGiver", JSON.stringify(payload.careGiverData));
      if(payload.profilePhoto){
        formData.append("profile_photo", payload.profilePhoto);
      }
      payload.uploadFiles.forEach((file) => {
        formData.append("documents", file);
      });
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.careGivers,
        formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.saveCareGiver,
          type: "success",
        })
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.saveCareGiver
              : String(error.response?.data?.message),
          type: "error",
        })
      );
      throw error.response?.data?.message;
    }
  }
);

// Create CareGiver Slice
const CareGiverSlice = createSlice({
  name: "careGiver",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.submitState = State.idle;
      state.updateState = State.idle;
    },
    resetSelectedCareGiver(state) {
      state.selectedCareGiver = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCareGivers.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching Caregivers...";
      })
      .addCase(fetchCareGivers.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched caregivers!";
        state.careGivers = action.payload;
      })
      .addCase(fetchCareGivers.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch caregivers!";
      })
      .addCase(saveCareGiver.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Saving Caregiver...";
      })
      .addCase(saveCareGiver.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved caregiver!";
      })
      .addCase(saveCareGiver.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save caregiver!";
      })
      .addCase(fetchSingleCareGiver.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching Caregiver...";
      })
      .addCase(fetchSingleCareGiver.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched caregiver!";
        state.selectedCareGiver = action.payload;
      })
      .addCase(fetchSingleCareGiver.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch caregiver!";
      })
      .addCase(fetchDocumentTypes.pending, (state) => {
        state.supportWorkerState = State.loading;
        state.stateMessage = "Fetching Caregiver document types...";
      })
      .addCase(fetchDocumentTypes.fulfilled, (state, action) => {
        state.supportWorkerState = State.success;
        state.stateMessage = "Successfully fetched caregiver document types!";
        state.careGiverDocumentTypes = action.payload;
      })
      .addCase(fetchDocumentTypes.rejected, (state) => {
        state.supportWorkerState = State.failed;
        state.stateMessage = "Failed to fetch caregiver document types!";
      })
      .addCase(fetchPaymentTypes.pending, (state) => {
        state.supportWorkerState = State.loading;
        state.stateMessage = "Fetching Caregiver Payment types...";
      })
      .addCase(fetchPaymentTypes.fulfilled, (state, action) => {
        state.supportWorkerState = State.success;
        state.stateMessage = "Successfully fetched caregiver Payment types!";
        state.careGiverPaymentTypes = action.payload;
      })
      .addCase(fetchPaymentTypes.rejected, (state) => {
        state.supportWorkerState = State.failed;
        state.stateMessage = "Failed to fetch caregiver Payment types!";
      })
      .addCase(fetchSingleCareGiverByEmployeeID.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching Caregiver Payment types...";
      })
      .addCase(fetchSingleCareGiverByEmployeeID.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched caregiver Payment types!";
        state.selectedCareGiver = action.payload;
      })
      .addCase(fetchSingleCareGiverByEmployeeID.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch caregiver Payment types!";
      })
      .addCase(saveDocumentTypes.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "saving Caregiver document types...";
      })
      .addCase(saveDocumentTypes.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved caregiver document types!";
        state.selectedCareGiver = action.payload;
      })
      .addCase(saveDocumentTypes.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save caregiver document types!";
      })
      .addCase(updatePaymentTypes.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "saving Caregiver Payment types...";
      })
      .addCase(updatePaymentTypes.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully saved caregiver Payment types!";
        state.selectedCareGiver = action.payload;
      })
      .addCase(updatePaymentTypes.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to save caregiver Payment types!";
      })
      .addCase(updateDocumentTypes.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "saving Caregiver document types...";
      })
      .addCase(updateDocumentTypes.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully saved caregiver document types!";
        state.selectedCareGiver = action.payload;
      })
      .addCase(updateDocumentTypes.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to save caregiver document types!";
      })
      .addCase(savePaymentTypes.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "saving Caregiver Payment types...";
      })
      .addCase(savePaymentTypes.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved caregiver Payment types!";
      })
      .addCase(savePaymentTypes.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save caregiver Payment types!";
      })
      .addCase(updateCareGiver.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "saving Caregiver Payment types...";
      })
      .addCase(updateCareGiver.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully saved caregiver Payment types!";
      })
      .addCase(updateCareGiver.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to save caregiver Payment types!";
      });
  },
});

export const { resetSubmitState,resetSelectedCareGiver } = CareGiverSlice.actions;
export default CareGiverSlice.reducer;
