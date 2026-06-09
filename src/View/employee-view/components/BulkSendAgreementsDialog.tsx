import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { bulkSendAgreements } from "../../../slices/agreementInstanceSlice/agreementInstance";
import { fetchEmailTemplates } from "../../../slices/emailTemplateSlice/emailTemplate";
import { fetchApplicableTemplates } from "../../../slices/agreementInstanceSlice/agreementInstance";

interface BulkSendAgreementsDialogProps {
  open: boolean;
  onClose: () => void;
  recipientType: "WORKER" | "CLIENT";
  recipientIds: string[];
  adminEmployeeId: string;
  onComplete: () => void;
}

const recipientLabel = (type: "WORKER" | "CLIENT", count: number) =>
  type === "CLIENT"
    ? `${count} selected client(s)`
    : `${count} selected worker(s)`;

const BulkSendAgreementsDialog: React.FC<BulkSendAgreementsDialogProps> = ({
  open,
  onClose,
  recipientType,
  recipientIds,
  adminEmployeeId,
  onComplete,
}) => {
  const dispatch = useAppDispatch();
  const { templates: emailTemplates } = useAppSelector((state) => state.emailTemplates);
  const [templateKey, setTemplateKey] = useState("");
  const [emailTemplateId, setEmailTemplateId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(
    null
  );

  useEffect(() => {
    if (open) {
      dispatch(fetchEmailTemplates());
      if (recipientIds[0]) {
        dispatch(
          fetchApplicableTemplates({ recipientType, recipientId: recipientIds[0] })
        );
      }
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setExpiryDate(d.toISOString().slice(0, 10));
      setResult(null);
      setTemplateKey("");
      setEmailTemplateId("");
    }
  }, [open, recipientIds, recipientType, dispatch]);

  const { applicableTemplates } = useAppSelector((state) => state.agreementInstances);

  useEffect(() => {
    if (applicableTemplates.length && !templateKey) {
      setTemplateKey(applicableTemplates[0].templateKey);
    }
    const invite = emailTemplates.find((t) => t.category === "AGREEMENT_INVITE") || emailTemplates[0];
    if (invite && !emailTemplateId) {
      setEmailTemplateId(invite.templateID);
    }
  }, [applicableTemplates, emailTemplates, templateKey, emailTemplateId]);

  const handleSend = async () => {
    setSubmitting(true);
    try {
      const response = await dispatch(
        bulkSendAgreements({
          recipientType,
          recipientIds,
          templateKey,
          emailTemplateId,
          expiresAt: expiryDate ? `${expiryDate}T23:59:59` : undefined,
          sentBy: adminEmployeeId,
          adminEmployeeId,
        })
      ).unwrap();
      setResult({
        success: response.successCount,
        failed: response.failureCount,
        errors: response.errors,
      });
      if (response.failureCount === 0) {
        onComplete();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Bulk send agreements</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography variant="body2" color="text.secondary">
            Send to {recipientLabel(recipientType, recipientIds.length)}. Uses your saved admin
            signature for each.
          </Typography>
          <FormControl size="small" fullWidth>
            <InputLabel>Agreement template</InputLabel>
            <Select
              label="Agreement template"
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value)}
            >
              {applicableTemplates.map((t) => (
                <MenuItem key={t.templateKey} value={t.templateKey}>
                  {t.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Email template</InputLabel>
            <Select
              label="Email template"
              value={emailTemplateId}
              onChange={(e) => setEmailTemplateId(e.target.value)}
            >
              {emailTemplates.map((t) => (
                <MenuItem key={t.templateID} value={t.templateID}>
                  {t.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Link expiry"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
          {result && (
            <Alert severity={result.failed > 0 ? "warning" : "success"}>
              Sent: {result.success} · Failed: {result.failed}
              {result.errors.length > 0 && (
                <Typography variant="caption" component="div" mt={1}>
                  {result.errors.slice(0, 3).join(" · ")}
                </Typography>
              )}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<SendOutlinedIcon />}
          disabled={!templateKey || !emailTemplateId || submitting || recipientIds.length === 0}
          onClick={handleSend}
        >
          {submitting ? "Sending…" : "Send all"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkSendAgreementsDialog;
