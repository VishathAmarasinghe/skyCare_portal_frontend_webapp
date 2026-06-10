import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { EmailTemplatePreview } from "../../../slices/emailTemplateSlice/emailTemplate";

interface AgreementEmailPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  preview: EmailTemplatePreview | null;
  toEmail?: string;
  ccEmails?: string;
  loading?: boolean;
}

const AgreementEmailPreviewDialog: React.FC<AgreementEmailPreviewDialogProps> = ({
  open,
  onClose,
  preview,
  toEmail,
  ccEmails,
  loading = false,
}) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Email preview</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading || !preview ? (
          <Box py={6} textAlign="center">
            <Typography color="text.secondary">Generating preview…</Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            <Box
              sx={{
                p: 2.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.grey[50],
              }}
            >
              <Typography variant="body2" mb={0.75}>
                <strong>From:</strong> {preview.fromAddress}
              </Typography>
              <Typography variant="body2" mb={0.75}>
                <strong>To:</strong> {toEmail || preview.sampleRecipient}
              </Typography>
              {ccEmails?.trim() && (
                <Typography variant="body2" mb={0.75}>
                  <strong>CC:</strong> {ccEmails}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Subject:</strong> {preview.mergedSubject}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                backgroundColor: "#f4f6f8",
                maxHeight: "65vh",
                overflow: "auto",
              }}
            >
              <Box
                sx={{
                  pointerEvents: "none",
                  backgroundColor: "white",
                  borderRadius: 1,
                  overflow: "hidden",
                  boxShadow: theme.shadows[1],
                }}
                dangerouslySetInnerHTML={{ __html: preview.fullHtml }}
              />
            </Box>

            <Box sx={{ px: 2.5, py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Preview uses the recipient and agreement details from this send. The signing link
                shown is a placeholder until the agreement is sent.
              </Typography>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgreementEmailPreviewDialog;
