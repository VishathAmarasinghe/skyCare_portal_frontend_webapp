import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import { State } from "../../types/types";
import { APIService } from "../../utils/apiService";
import { AppConfig, FILE_DOWNLOAD_BASE_URL } from "../../config/config";
import axios, { HttpStatusCode } from "axios";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";

// Signature interface
export interface Signature {
  signatureID: string;
  employeeID: string;
  signatureData: string; // Base64 encoded signature image
  createdAt: string;
  updatedAt: string;
}

export interface SignatureDTO {
  signatureID: string;
  employeeID: string;
  signatureData: string;
  createdAt: string;
  updatedAt: string;
}

interface SignatureState {
  State: State;
  submitState: State;
  updateState: State;
  deleteState: State;
  stateMessage: string;
  errorMessage: string;
  currentSignature: Signature | null;
  signatureExists: boolean;
  backgroundProcess: boolean;
  backgroundProcessMessage: string | null;
}

// Initial state for the Signature slice
const initialState: SignatureState = {
  State: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  deleteState: State.idle,
  stateMessage: "",
  errorMessage: "",
  currentSignature: null,
  signatureExists: false,
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

// Upload/Save signature for an employee
export const uploadSignature = createAsyncThunk(
  "signature/uploadSignature",
  async (
    payload: { employeeID: string; signatureFile: File },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<SignatureDTO>((resolve, reject) => {
      const formData = new FormData();
      formData.append('signature', payload.signatureFile);

      APIService.getInstance()
        .post(
          `${AppConfig.serviceUrls.signatures}/upload/${payload.employeeID}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        .then((response) => {
          console.log("Signature upload response:", response);
          dispatch(
            enqueueSnackbarMessage({
              message: "Signature uploaded successfully!",
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          console.log("Signature upload error:", error);
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? "Failed to upload signature. Please try again."
                  : String(error.response?.data?.message || "Failed to upload signature"),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// Get signature by employee ID
export const getSignatureByEmployeeID = createAsyncThunk(
  "signature/getSignatureByEmployeeID",
  async (employeeID: string, { dispatch, rejectWithValue }) => {
    return new Promise<SignatureDTO>((resolve, reject) => {
      console.log("SignatureSlice - Fetching signature for employeeID:", employeeID);
      console.log("SignatureSlice - API URL:", `${AppConfig.serviceUrls.signatures}/employee/${employeeID}`);
      
      APIService.getInstance()
        .get(`${AppConfig.serviceUrls.signatures}/employee/${employeeID}`)
        .then((response) => {
          console.log("SignatureSlice - Fetch response:", response);
          console.log("SignatureSlice - Response status:", response.status);
          console.log("SignatureSlice - Response data:", response.data);
          console.log("SignatureSlice - Response data type:", typeof response.data);
          console.log("SignatureSlice - Response data keys:", response.data ? Object.keys(response.data) : 'null');
          
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          console.log("SignatureSlice - Fetch error:", error);
          console.log("SignatureSlice - Error response:", error.response);
          console.log("SignatureSlice - Error status:", error.response?.status);
          console.log("SignatureSlice - Error data:", error.response?.data);
          
          // Don't show error message for 404 (no signature found)
          if (error.response?.status !== HttpStatusCode.NotFound) {
            dispatch(
              enqueueSnackbarMessage({
                message:
                  error.response?.status === HttpStatusCode.InternalServerError
                    ? "Failed to fetch signature. Please try again."
                    : String(error.response?.data?.message || "Failed to fetch signature"),
                type: "error",
              })
            );
          }
          reject(error.response?.data);
        });
    });
  }
);

// Get signature image as base64 data URL
export const getSignatureImage = createAsyncThunk(
  "signature/getSignatureImage",
  async (payload: { employeeID: string; signaturePath: string }, { dispatch, rejectWithValue }) => {
    return new Promise<string>((resolve, reject) => {
      console.log("SignatureSlice - Fetching signature image for employeeID:", payload.employeeID);
      console.log("SignatureSlice - Signature path:", payload.signaturePath);
      
      // Use the file download URL to get the signature image
      const imageUrl = `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(payload.signaturePath)}`;
      console.log("SignatureSlice - Image download URL:", imageUrl);
      
      APIService.getInstance()
        .get(imageUrl, {
          responseType: 'blob' // Important for binary data
        })
        .then((response) => {
          console.log("SignatureSlice - Image fetch response:", response);
          
          // Convert blob to base64 data URL
          const reader = new FileReader();
          reader.onload = () => {
            const base64Data = reader.result as string;
            console.log("SignatureSlice - Image converted to base64, length:", base64Data.length);
            resolve(base64Data);
          };
          reader.onerror = () => {
            console.error("SignatureSlice - Error reading image blob");
            reject(new Error("Failed to read image data"));
          };
          reader.readAsDataURL(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          console.log("SignatureSlice - Image fetch error:", error);
          console.log("SignatureSlice - Error status:", error.response?.status);
          
          // Don't show error message for 404 (no image found)
          if (error.response?.status !== HttpStatusCode.NotFound) {
            dispatch(
              enqueueSnackbarMessage({
                message:
                  error.response?.status === HttpStatusCode.InternalServerError
                    ? "Failed to fetch signature image. Please try again."
                    : String(error.response?.data?.message || "Failed to fetch signature image"),
                type: "error",
              })
            );
          }
          reject(error.response?.data);
        });
    });
  }
);

// Update signature for an employee
export const updateSignature = createAsyncThunk(
  "signature/updateSignature",
  async (
    payload: { employeeID: string; signatureFile: File },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<SignatureDTO>((resolve, reject) => {
      const formData = new FormData();
      formData.append('signature', payload.signatureFile);

      APIService.getInstance()
        .put(
          `${AppConfig.serviceUrls.signatures}/update/${payload.employeeID}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        .then((response) => {
          console.log("Signature update response:", response);
          dispatch(
            enqueueSnackbarMessage({
              message: "Signature updated successfully!",
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          console.log("Signature update error:", error);
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? "Failed to update signature. Please try again."
                  : String(error.response?.data?.message || "Failed to update signature"),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// Delete signature by employee ID
export const deleteSignatureByEmployeeID = createAsyncThunk(
  "signature/deleteSignatureByEmployeeID",
  async (employeeID: string, { dispatch, rejectWithValue }) => {
    return new Promise<boolean>((resolve, reject) => {
      APIService.getInstance()
        .delete(`${AppConfig.serviceUrls.signatures}/employee/${employeeID}`)
        .then((response) => {
          console.log("Signature delete response:", response);
          dispatch(
            enqueueSnackbarMessage({
              message: "Signature deleted successfully!",
              type: "success",
            })
          );
          resolve(true);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          console.log("Signature delete error:", error);
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? "Failed to delete signature. Please try again."
                  : String(error.response?.data?.message || "Failed to delete signature"),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// Check if signature exists for employee
export const checkSignatureExists = createAsyncThunk(
  "signature/checkSignatureExists",
  async (employeeID: string, { dispatch, rejectWithValue }) => {
    return new Promise<boolean>((resolve, reject) => {
      APIService.getInstance()
        .get(`${AppConfig.serviceUrls.signatures}/exists/${employeeID}`)
        .then((response) => {
          console.log("Signature exists check response:", response);
          resolve(response.data.success);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          console.log("Signature exists check error:", error);
          // Don't show error message for this check
          reject(error.response?.data);
        });
    });
  }
);

// Save signature from canvas (base64 to file conversion)
export const saveSignatureFromCanvas = createAsyncThunk(
  "signature/saveSignatureFromCanvas",
  async (
    payload: { employeeID: string; signatureData: string },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<SignatureDTO>((resolve, reject) => {
      try {
        // Convert base64 to blob
        const base64Data = payload.signatureData.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        
        // Create file from blob
        const file = new File([blob], 'signature.png', { type: 'image/png' });

        // Upload the file
        const formData = new FormData();
        formData.append('signature', file);

        APIService.getInstance()
          .post(
            `${AppConfig.serviceUrls.signatures}/upload/${payload.employeeID}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          )
          .then((response) => {
            console.log("Canvas signature save response:", response);
            dispatch(
              enqueueSnackbarMessage({
                message: "Signature saved successfully!",
                type: "success",
              })
            );
            resolve(response.data);
          })
          .catch((error) => {
            if (axios.isCancel(error)) {
              return rejectWithValue("Request canceled");
            }
            console.log("Canvas signature save error:", error);
            dispatch(
              enqueueSnackbarMessage({
                message:
                  error.response?.status === HttpStatusCode.InternalServerError
                    ? "Failed to save signature. Please try again."
                    : String(error.response?.data?.message || "Failed to save signature"),
                type: "error",
              })
            );
            reject(error.response?.data);
          });
      } catch (error) {
        console.error("Error converting base64 to file:", error);
        dispatch(
          enqueueSnackbarMessage({
            message: "Failed to process signature data",
            type: "error",
          })
        );
        reject(error);
      }
    });
  }
);

// Update signature from canvas (base64 to file conversion)
export const updateSignatureFromCanvas = createAsyncThunk(
  "signature/updateSignatureFromCanvas",
  async (
    payload: { employeeID: string; signatureData: string },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<SignatureDTO>((resolve, reject) => {
      try {
        // Convert base64 to blob
        const base64Data = payload.signatureData.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        
        // Create file from blob
        const file = new File([blob], 'signature.png', { type: 'image/png' });

        // Update the file
        const formData = new FormData();
        formData.append('signature', file);

        APIService.getInstance()
          .put(
            `${AppConfig.serviceUrls.signatures}/update/${payload.employeeID}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          )
          .then((response) => {
            console.log("Canvas signature update response:", response);
            dispatch(
              enqueueSnackbarMessage({
                message: "Signature updated successfully!",
                type: "success",
              })
            );
            resolve(response.data);
          })
          .catch((error) => {
            if (axios.isCancel(error)) {
              return rejectWithValue("Request canceled");
            }
            console.log("Canvas signature update error:", error);
            dispatch(
              enqueueSnackbarMessage({
                message:
                  error.response?.status === HttpStatusCode.InternalServerError
                    ? "Failed to update signature. Please try again."
                    : String(error.response?.data?.message || "Failed to update signature"),
                type: "error",
              })
            );
            reject(error.response?.data);
          });
      } catch (error) {
        console.error("Error converting base64 to file:", error);
        dispatch(
          enqueueSnackbarMessage({
            message: "Failed to process signature data",
            type: "error",
          })
        );
        reject(error);
      }
    });
  }
);

// Define the slice with reducers and extraReducers
const SignatureSlice = createSlice({
  name: "signature",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.submitState = State.idle;
      state.updateState = State.idle;
      state.deleteState = State.idle;
    },
    resetCurrentSignature(state) {
      state.currentSignature = null;
      state.signatureExists = false;
    },
    clearSignatureState(state) {
      state.State = State.idle;
      state.submitState = State.idle;
      state.updateState = State.idle;
      state.deleteState = State.idle;
      state.stateMessage = "";
      state.errorMessage = "";
      state.currentSignature = null;
      state.signatureExists = false;
      state.backgroundProcess = false;
      state.backgroundProcessMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload signature
      .addCase(uploadSignature.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Uploading signature...";
      })
      .addCase(uploadSignature.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully uploaded signature!";
        state.currentSignature = action.payload;
        state.signatureExists = true;
      })
      .addCase(uploadSignature.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to upload signature!";
      })
      // Get signature
      .addCase(getSignatureByEmployeeID.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching signature...";
      })
      .addCase(getSignatureByEmployeeID.fulfilled, (state, action) => {
        state.State = State.success;
        state.stateMessage = "Successfully fetched signature!";
        state.currentSignature = action.payload;
        state.signatureExists = true;
      })
      .addCase(getSignatureByEmployeeID.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "No signature found";
        state.currentSignature = null;
        state.signatureExists = false;
      })
      // Get signature image
      .addCase(getSignatureImage.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching signature image...";
      })
      .addCase(getSignatureImage.fulfilled, (state, action) => {
        state.State = State.success;
        state.stateMessage = "Successfully fetched signature image!";
        // Store the base64 image data in currentSignature
        state.currentSignature = { signatureData: action.payload } as any;
        state.signatureExists = true;
      })
      .addCase(getSignatureImage.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "No signature image found";
        state.currentSignature = null;
        state.signatureExists = false;
      })
      // Update signature
      .addCase(updateSignature.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "Updating signature...";
      })
      .addCase(updateSignature.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully updated signature!";
        state.currentSignature = action.payload;
        state.signatureExists = true;
      })
      .addCase(updateSignature.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to update signature!";
      })
      // Delete signature
      .addCase(deleteSignatureByEmployeeID.pending, (state) => {
        state.deleteState = State.loading;
        state.stateMessage = "Deleting signature...";
      })
      .addCase(deleteSignatureByEmployeeID.fulfilled, (state) => {
        state.deleteState = State.success;
        state.stateMessage = "Successfully deleted signature!";
        state.currentSignature = null;
        state.signatureExists = false;
      })
      .addCase(deleteSignatureByEmployeeID.rejected, (state) => {
        state.deleteState = State.failed;
        state.stateMessage = "Failed to delete signature!";
      })
      // Check signature exists
      .addCase(checkSignatureExists.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Checking signature...";
      })
      .addCase(checkSignatureExists.fulfilled, (state, action) => {
        state.State = State.success;
        state.signatureExists = action.payload;
        state.stateMessage = action.payload ? "Signature exists" : "No signature found";
      })
      .addCase(checkSignatureExists.rejected, (state) => {
        state.State = State.failed;
        state.signatureExists = false;
        state.stateMessage = "Failed to check signature";
      })
      // Save signature from canvas
      .addCase(saveSignatureFromCanvas.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Saving signature...";
      })
      .addCase(saveSignatureFromCanvas.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved signature!";
        state.currentSignature = action.payload;
        state.signatureExists = true;
      })
      .addCase(saveSignatureFromCanvas.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save signature!";
      })
      // Update signature from canvas
      .addCase(updateSignatureFromCanvas.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "Updating signature...";
      })
      .addCase(updateSignatureFromCanvas.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully updated signature!";
        state.currentSignature = action.payload;
        state.signatureExists = true;
      })
      .addCase(updateSignatureFromCanvas.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to update signature!";
      });
  },
});

export const { resetSubmitState, resetCurrentSignature, clearSignatureState } = SignatureSlice.actions;
export default SignatureSlice.reducer;
