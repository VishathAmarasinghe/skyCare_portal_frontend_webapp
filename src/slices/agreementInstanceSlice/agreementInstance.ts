import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { AppConfig } from "../../config/config";
import { State } from "../../types/types";
import { enqueueSnackbarMessage } from "../commonSlice/common";

export interface AgreementApplicableTemplate {
  templateId: string;
  templateKey: string;
  displayName: string;
  publishedVersionId: string;
  publishedVersionNumber: number;
  careGiverType?: string;
  defaultForAudience: boolean;
}

export interface AgreementInstance {
  id: string;
  templateVersionId: string;
  templateKey: string;
  templateName: string;
  versionNumber: number;
  recipientType: string;
  recipientId: string;
  recipientEmail?: string;
  recipientName?: string;
  status: string;
  hasCustomContent: boolean;
  hasAdminSignature: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  expiresAt?: string;
  sentBy?: string;
  sendMethod?: string;
  manualSendNotes?: string;
  signedViaUpload?: boolean;
  hasSignedPdf?: boolean;
  canSend?: boolean;
  canResend?: boolean;
  canCancel?: boolean;
  canDelete?: boolean;
  canMarkManualSent?: boolean;
  canCopySigningLink?: boolean;
  canUploadSignedPdf?: boolean;
  canClearAdminSignature?: boolean;
  canUpdateStatus?: boolean;
}

export interface AgreementSendResult {
  instance: AgreementInstance;
  expiresAt?: string;
  message?: string;
  signingUrl?: string;
}

export interface AgreementSendPayload {
  emailTemplateId: string;
  recipientEmail: string;
  ccEmails?: string[];
  subjectOverride?: string;
  bodyHtmlOverride?: string;
  expiresAt?: string;
  sentBy: string;
  referenceMaterialIds?: string[];
}

export interface AgreementValidationResult {
  valid: boolean;
  unresolvedPlaceholders: string[];
  warnings: string[];
}

export interface AgreementBulkSendPayload {
  recipientType?: "WORKER" | "CLIENT";
  recipientIds?: string[];
  /** @deprecated use recipientIds with recipientType WORKER */
  careGiverIds?: string[];
  templateKey: string;
  emailTemplateId: string;
  subjectOverride?: string;
  bodyHtmlOverride?: string;
  expiresAt?: string;
  sentBy: string;
  adminEmployeeId: string;
}

export interface AgreementEvent {
  id: string;
  instanceId: string;
  eventType: string;
  actorId?: string;
  actorType?: string;
  metadata?: string;
  createdAt?: string;
}

interface AgreementInstanceState {
  state: State;
  submitState: State;
  applicableTemplates: AgreementApplicableTemplate[];
  instances: AgreementInstance[];
  activeInstance: AgreementInstance | null;
  previewHtml: string | null;
  events: AgreementEvent[];
}

const initialState: AgreementInstanceState = {
  state: State.idle,
  submitState: State.idle,
  applicableTemplates: [],
  instances: [],
  activeInstance: null,
  previewHtml: null,
  events: [],
};

export const fetchApplicableTemplates = createAsyncThunk(
  "agreementInstances/applicable",
  async (
    { recipientType, recipientId }: { recipientType: string; recipientId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.agreements}/applicable`,
        { params: { recipientType, recipientId } }
      );
      return response.data as AgreementApplicableTemplate[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchInstancesByRecipient = createAsyncThunk(
  "agreementInstances/byRecipient",
  async (
    { recipientType, recipientId }: { recipientType: string; recipientId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.agreements}/by-recipient`,
        { params: { recipientType, recipientId } }
      );
      return response.data as AgreementInstance[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createAgreementInstance = createAsyncThunk(
  "agreementInstances/create",
  async (payload: Record<string, unknown>, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreements}/instances`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Agreement draft created.",
          type: "success",
        })
      );
      return response.data as AgreementInstance;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: error.response?.data?.message || "Unable to create agreement.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateInstanceContent = createAsyncThunk(
  "agreementInstances/updateContent",
  async (
    {
      instanceId,
      customContentHtml,
      actorId,
    }: { instanceId: string; customContentHtml: string; actorId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().put(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/content`,
        { customContentHtml },
        { params: { actorId } }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Customizations saved.",
          type: "success",
        })
      );
      return response.data as AgreementInstance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const adminSignInstance = createAsyncThunk(
  "agreementInstances/adminSign",
  async (
    { instanceId, payload }: { instanceId: string; payload: Record<string, unknown> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/admin-sign`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Admin signature applied.",
          type: "success",
        })
      );
      return response.data as AgreementInstance;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to apply signature.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const previewAgreementInstance = createAsyncThunk(
  "agreementInstances/preview",
  async (instanceId: string, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/preview`
      );
      return response.data as { mergedHtml: string };
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchInstanceEvents = createAsyncThunk(
  "agreementInstances/events",
  async (instanceId: string, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/events`
      );
      return response.data as AgreementEvent[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const sendAgreementInstance = createAsyncThunk(
  "agreementInstances/send",
  async (
    { instanceId, payload }: { instanceId: string; payload: AgreementSendPayload },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/send`,
        payload,
        { timeout: 120000 }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Agreement sent successfully.",
          type: "success",
        })
      );
      return response.data as AgreementSendResult;
    } catch (error: any) {
      const timedOut =
        error?.code === "ECONNABORTED" ||
        String(error?.message || "").toLowerCase().includes("timeout");
      dispatch(
        enqueueSnackbarMessage({
          message: timedOut
            ? "Send is taking longer than expected. Check agreement history — the email may already have been sent."
            : error.response?.data?.message || "Unable to send agreement.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const sendAgreementManual = createAsyncThunk(
  "agreementInstances/sendManual",
  async (
    {
      instanceId,
      payload,
    }: {
      instanceId: string;
      payload: {
        sendMethod: "MANUAL_LINK" | "MANUAL_PDF";
        notes?: string;
        expiresAt?: string;
        actorId: string;
        referenceMaterialIds?: string[];
      };
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/send-manual`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: response.data?.message || "Agreement marked as sent manually.",
          type: "success",
        })
      );
      return response.data as AgreementSendResult;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: error.response?.data?.message || "Unable to mark agreement as sent.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const generateSigningLink = createAsyncThunk(
  "agreementInstances/signingLink",
  async (
    { instanceId, actorId, regenerate = true }: { instanceId: string; actorId: string; regenerate?: boolean },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/signing-link`,
        null,
        { params: { actorId, regenerate } }
      );
      return response.data as AgreementSendResult & { signingUrl: string };
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: error.response?.data?.message || "Unable to generate signing link.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const uploadSignedAgreementPdf = createAsyncThunk(
  "agreementInstances/uploadSignedPdf",
  async (
    {
      instanceId,
      file,
      actorId,
      notes,
    }: { instanceId: string; file: File; actorId: string; notes?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/upload-signed-pdf`,
        formData,
        { params: { actorId, notes }, headers: { "Content-Type": "multipart/form-data" } }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Signed PDF uploaded.",
          type: "success",
        })
      );
      return response.data as AgreementInstance;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: error.response?.data?.message || "Unable to upload signed PDF.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const clearAdminSignature = createAsyncThunk(
  "agreementInstances/clearAdminSignature",
  async (
    { instanceId, actorId }: { instanceId: string; actorId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/clear-admin-signature`,
        null,
        { params: { actorId } }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Admin signature cleared — agreement returned to draft.",
          type: "success",
        })
      );
      return response.data as AgreementInstance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateAgreementStatus = createAsyncThunk(
  "agreementInstances/updateStatus",
  async (
    {
      instanceId,
      status,
      reason,
      actorId,
    }: { instanceId: string; status: string; reason?: string; actorId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().put(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/status`,
        { status, reason, actorId }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Status updated.",
          type: "success",
        })
      );
      return response.data as AgreementInstance;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: error.response?.data?.message || "Unable to update status.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const resendAgreementInstance = createAsyncThunk(
  "agreementInstances/resend",
  async (
    { instanceId, actorId, sendEmail = true }: { instanceId: string; actorId: string; sendEmail?: boolean },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/resend`,
        null,
        { params: { actorId, sendEmail } }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: sendEmail ? "Agreement resent via email." : "New signing link generated.",
          type: "success",
        })
      );
      return response.data as AgreementSendResult;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to resend agreement.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const cancelAgreementInstance = createAsyncThunk(
  "agreementInstances/cancel",
  async (
    { instanceId, actorId }: { instanceId: string; actorId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/cancel`,
        null,
        { params: { actorId } }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Agreement cancelled.",
          type: "success",
        })
      );
      return response.data as AgreementInstance;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to cancel agreement.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteAgreementInstance = createAsyncThunk(
  "agreementInstances/delete",
  async (
    { instanceId, actorId }: { instanceId: string; actorId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await APIService.getInstance().delete(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}`,
        { params: { actorId } }
      );
      dispatch(
        enqueueSnackbarMessage({
          message: "Agreement deleted.",
          type: "success",
        })
      );
      return instanceId;
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: error.response?.data?.message || "Unable to delete agreement.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAgreementPdfBlob = async (instanceId: string): Promise<Blob> => {
  const response = await APIService.getInstance().get(
    `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/pdf`,
    { responseType: "blob" }
  );
  return new Blob([response.data], { type: "application/pdf" });
};

export const validateAgreementInstance = createAsyncThunk(
  "agreementInstances/validate",
  async (instanceId: string, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/validate`
      );
      return response.data as AgreementValidationResult;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const bulkSendAgreements = createAsyncThunk(
  "agreementInstances/bulkSend",
  async (payload: AgreementBulkSendPayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.agreements}/bulk-send`,
        payload
      );
      dispatch(
        enqueueSnackbarMessage({
          message: `Bulk send complete: ${response.data.successCount} sent.`,
          type: "success",
        })
      );
      return response.data as {
        successCount: number;
        failureCount: number;
        errors: string[];
      };
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Bulk send failed.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

export const exportAgreementHistory = async (
  recipientType: string,
  recipientId: string
): Promise<void> => {
  const response = await APIService.getInstance().get(
    `${AppConfig.serviceUrls.agreements}/history/export`,
    { params: { recipientType, recipientId }, responseType: "blob" }
  );
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `agreement-history-${recipientId}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportInstanceEvents = async (instanceId: string): Promise<void> => {
  const response = await APIService.getInstance().get(
    `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/events/export`,
    { responseType: "blob" }
  );
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `agreement-events-${instanceId}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const downloadAgreementPdf = createAsyncThunk(
  "agreementInstances/downloadPdf",
  async (
    { instanceId, fileName }: { instanceId: string; fileName: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/pdf`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      dispatch(
        enqueueSnackbarMessage({
          message: "PDF downloaded.",
          type: "success",
        })
      );
    } catch (error: any) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Unable to download PDF.",
          type: "error",
        })
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

const agreementInstanceSlice = createSlice({
  name: "agreementInstances",
  initialState,
  reducers: {
    clearActiveInstance(state) {
      state.activeInstance = null;
      state.previewHtml = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicableTemplates.fulfilled, (state, action) => {
        state.applicableTemplates = action.payload;
      })
      .addCase(fetchInstancesByRecipient.fulfilled, (state, action) => {
        state.instances = action.payload;
        state.state = State.success;
      })
      .addCase(createAgreementInstance.pending, (state) => {
        state.submitState = State.loading;
      })
      .addCase(createAgreementInstance.rejected, (state) => {
        state.submitState = State.failed;
      })
      .addCase(createAgreementInstance.fulfilled, (state, action) => {
        state.activeInstance = action.payload;
        state.submitState = State.success;
      })
      .addCase(updateInstanceContent.fulfilled, (state, action) => {
        state.activeInstance = action.payload;
      })
      .addCase(adminSignInstance.fulfilled, (state, action) => {
        state.activeInstance = action.payload;
      })
      .addCase(sendAgreementInstance.fulfilled, (state, action) => {
        state.activeInstance = action.payload.instance;
        const updated = action.payload.instance;
        state.instances = state.instances.map((i) => (i.id === updated.id ? updated : i));
      })
      .addCase(sendAgreementManual.fulfilled, (state, action) => {
        const updated = action.payload.instance;
        state.activeInstance = updated;
        state.instances = state.instances.map((i) => (i.id === updated.id ? updated : i));
      })
      .addCase(generateSigningLink.fulfilled, (state, action) => {
        if (action.payload.instance) {
          const updated = action.payload.instance;
          state.instances = state.instances.map((i) => (i.id === updated.id ? updated : i));
          if (state.activeInstance?.id === updated.id) state.activeInstance = updated;
        }
      })
      .addCase(uploadSignedAgreementPdf.fulfilled, (state, action) => {
        const updated = action.payload;
        state.instances = state.instances.map((i) => (i.id === updated.id ? updated : i));
        if (state.activeInstance?.id === updated.id) state.activeInstance = updated;
      })
      .addCase(clearAdminSignature.fulfilled, (state, action) => {
        const updated = action.payload;
        state.instances = state.instances.map((i) => (i.id === updated.id ? updated : i));
        if (state.activeInstance?.id === updated.id) state.activeInstance = updated;
      })
      .addCase(updateAgreementStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        state.instances = state.instances.map((i) => (i.id === updated.id ? updated : i));
        if (state.activeInstance?.id === updated.id) state.activeInstance = updated;
      })
      .addCase(resendAgreementInstance.fulfilled, (state, action) => {
        const updated = action.payload.instance;
        state.instances = state.instances.map((i) => (i.id === updated.id ? updated : i));
        if (state.activeInstance?.id === updated.id) state.activeInstance = updated;
      })
      .addCase(cancelAgreementInstance.fulfilled, (state, action) => {
        const updated = action.payload;
        state.instances = state.instances.map((i) => (i.id === updated.id ? updated : i));
      })
      .addCase(deleteAgreementInstance.fulfilled, (state, action) => {
        state.instances = state.instances.filter((i) => i.id !== action.payload);
      })
      .addCase(previewAgreementInstance.fulfilled, (state, action) => {
        state.previewHtml = action.payload.mergedHtml;
      })
      .addCase(fetchInstanceEvents.fulfilled, (state, action) => {
        state.events = action.payload;
      });
  },
});

export const { clearActiveInstance } = agreementInstanceSlice.actions;
export default agreementInstanceSlice.reducer;
