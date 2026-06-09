import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import LinkIcon from "@mui/icons-material/Link";
import ReplayIcon from "@mui/icons-material/Replay";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  AgreementInstance,
  clearAdminSignature,
  fetchInstanceEvents,
  generateSigningLink,
  resendAgreementInstance,
  sendAgreementManual,
  updateAgreementStatus,
  uploadSignedAgreementPdf,
} from "../../../slices/agreementInstanceSlice/agreementInstance";

const STATUS_OPTIONS = [
  "DRAFT",
  "ADMIN_SIGNED",
  "SENT",
  "VIEWED",
  "SIGNED",
  "EXPIRED",
  "CANCELLED",
];

const sendMethodLabel = (method?: string) => {
  switch (method) {
    case "SYSTEM_EMAIL":
      return "System email";
    case "MANUAL_LINK":
      return "Manual link";
    case "MANUAL_PDF":
      return "Manual PDF";
    default:
      return method || "—";
  }
};

interface AgreementInstanceManageDialogProps {
  open: boolean;
  onClose: () => void;
  instance: AgreementInstance | null;
  actorId: string;
  onUpdated: () => void;
}

const AgreementInstanceManageDialog: React.FC<AgreementInstanceManageDialogProps> = ({
  open,
  onClose,
  instance,
  actorId,
  onUpdated,
}) => {
  const dispatch = useAppDispatch();
  const { events } = useAppSelector((state) => state.agreementInstances);
  const [tab, setTab] = useState(0);
  const [signingUrl, setSigningUrl] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && instance?.id) {
      dispatch(fetchInstanceEvents(instance.id));
      setSigningUrl("");
      setManualNotes("");
      setUploadFile(null);
      setNewStatus(instance.status);
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setExpiryDate(d.toISOString().slice(0, 10));
    }
  }, [open, instance?.id, dispatch]);

  if (!instance) return null;

  const copyLink = async (url: string) => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
  };

  const handleGenerateLink = async (regenerate = true) => {
    setBusy(true);
    try {
      const result = await dispatch(
        generateSigningLink({ instanceId: instance.id, actorId, regenerate })
      ).unwrap();
      setSigningUrl(result.signingUrl);
      onUpdated();
    } finally {
      setBusy(false);
    }
  };

  const handleManualSend = async (method: "MANUAL_LINK" | "MANUAL_PDF") => {
    setBusy(true);
    try {
      const result = await dispatch(
        sendAgreementManual({
          instanceId: instance.id,
          payload: {
            sendMethod: method,
            notes: manualNotes,
            expiresAt: expiryDate ? `${expiryDate}T23:59:59` : undefined,
            actorId,
          },
        })
      ).unwrap();
      if (result.signingUrl) setSigningUrl(result.signingUrl);
      onUpdated();
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async (sendEmail: boolean) => {
    setBusy(true);
    try {
      const result = await dispatch(
        resendAgreementInstance({ instanceId: instance.id, actorId, sendEmail })
      ).unwrap();
      if (result.signingUrl) setSigningUrl(result.signingUrl);
      onUpdated();
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setBusy(true);
    try {
      await dispatch(
        uploadSignedAgreementPdf({
          instanceId: instance.id,
          file: uploadFile,
          actorId,
          notes: uploadNotes,
        })
      ).unwrap();
      onUpdated();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const handleStatusUpdate = async () => {
    setBusy(true);
    try {
      await dispatch(
        updateAgreementStatus({
          instanceId: instance.id,
          status: newStatus,
          reason: statusReason,
          actorId,
        })
      ).unwrap();
      onUpdated();
    } finally {
      setBusy(false);
    }
  };

  const handleClearAdminSign = async () => {
    setBusy(true);
    try {
      await dispatch(clearAdminSignature({ instanceId: instance.id, actorId })).unwrap();
      onUpdated();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage agreement
        <Typography variant="caption" display="block" color="text.secondary">
          {instance.templateName} · {instance.recipientName}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            <Chip label={instance.status} size="small" color="primary" variant="outlined" />
            <Chip label={`Delivery: ${sendMethodLabel(instance.sendMethod)}`} size="small" variant="outlined" />
            {instance.signedViaUpload && (
              <Chip label="Signed via upload" size="small" color="success" variant="outlined" />
            )}
          </Stack>

          {instance.manualSendNotes && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              {instance.manualSendNotes}
            </Alert>
          )}

          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
            <Tab label="Manual send & link" />
            <Tab label="Upload signed PDF" />
            <Tab label="Resend / re-link" />
            <Tab label="Status & admin" />
            <Tab label={`Audit (${events.length})`} />
          </Tabs>

          {tab === 0 && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Use when you deliver the agreement outside the system email (download PDF, SMS, WhatsApp, etc.).
              </Typography>
              <TextField
                label="Notes (optional)"
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="e.g. Handed printed copy to worker on 6 Jun"
              />
              <TextField
                label="Link expiry"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                sx={{ maxWidth: 220 }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {instance.canMarkManualSent && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<LinkIcon />}
                      disabled={busy}
                      onClick={() => handleManualSend("MANUAL_LINK")}
                    >
                      Mark sent — share link manually
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={busy}
                      onClick={() => handleManualSend("MANUAL_PDF")}
                    >
                      Mark sent — PDF delivered offline
                    </Button>
                  </>
                )}
                {instance.canCopySigningLink && (
                  <Button
                    variant="contained"
                    startIcon={<LinkIcon />}
                    disabled={busy}
                    onClick={() => handleGenerateLink(true)}
                  >
                    Generate / copy signing link
                  </Button>
                )}
              </Stack>
              {signingUrl && (
                <Alert
                  severity="success"
                  action={
                    <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => copyLink(signingUrl)}>
                      Copy
                    </Button>
                  }
                >
                  <Typography variant="caption" sx={{ wordBreak: "break-all" }}>
                    {signingUrl}
                  </Typography>
                </Alert>
              )}
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Upload a PDF signed by the worker (e.g. scanned or signed offline).
              </Typography>
              <Button variant="outlined" component="label" startIcon={<UploadFileOutlinedIcon />}>
                Choose PDF
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </Button>
              {uploadFile && (
                <Typography variant="caption">{uploadFile.name}</Typography>
              )}
              <TextField
                label="Notes"
                size="small"
                fullWidth
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
              />
              <Button
                variant="contained"
                disabled={!uploadFile || !instance.canUploadSignedPdf || busy}
                onClick={handleUpload}
              >
                Upload & mark signed
              </Button>
            </Stack>
          )}

          {tab === 2 && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Regenerate signing link or resend the system email invitation.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {instance.canResend && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<ReplayIcon />}
                      disabled={busy}
                      onClick={() => handleResend(true)}
                    >
                      Resend email
                    </Button>
                    <Button variant="outlined" disabled={busy} onClick={() => handleResend(false)}>
                      New link only (no email)
                    </Button>
                  </>
                )}
                {instance.canCopySigningLink && (
                  <Button variant="outlined" disabled={busy} onClick={() => handleGenerateLink(true)}>
                    Regenerate link
                  </Button>
                )}
              </Stack>
              {signingUrl && (
                <Alert
                  severity="success"
                  action={
                    <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => copyLink(signingUrl)}>
                      Copy
                    </Button>
                  }
                >
                  <Typography variant="caption" sx={{ wordBreak: "break-all" }}>
                    {signingUrl}
                  </Typography>
                </Alert>
              )}
            </Stack>
          )}

          {tab === 3 && (
            <Stack spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={!instance.canUpdateStatus}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Reason for change"
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              />
              <Button
                variant="outlined"
                disabled={!instance.canUpdateStatus || busy || newStatus === instance.status}
                onClick={handleStatusUpdate}
              >
                Update status
              </Button>
              <Divider />
              {instance.canClearAdminSignature && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Re-sign admin
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Clears the admin signature and returns the agreement to draft so you can sign again (e.g. after
                    template changes).
                  </Typography>
                  <Button color="warning" variant="outlined" disabled={busy} onClick={handleClearAdminSign}>
                    Clear admin signature
                  </Button>
                </Box>
              )}
            </Stack>
          )}

          {tab === 4 && (
            <Stack spacing={0.5} sx={{ maxHeight: 280, overflow: "auto" }}>
              {events.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No audit events yet.
                </Typography>
              ) : (
                events.map((event) => (
                  <Box key={event.id} sx={{ py: 0.75, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="body2" fontWeight={600}>
                      {event.eventType.replace(/_/g, " ")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {event.createdAt ? new Date(event.createdAt).toLocaleString() : ""}
                      {event.actorId ? ` · ${event.actorId}` : ""}
                    </Typography>
                  </Box>
                ))
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgreementInstanceManageDialog;
