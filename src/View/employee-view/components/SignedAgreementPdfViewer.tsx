import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

interface SignedAgreementPdfViewerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  title?: string;
  onDownload?: () => void;
  large?: boolean;
}

const SignedAgreementPdfViewer: React.FC<SignedAgreementPdfViewerProps> = ({
  open,
  onClose,
  pdfUrl,
  title = "Signed Agreement",
  onDownload,
  large = false,
}) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const paperSx = large
    ? {
        borderRadius: 2,
        display: "flex",
        flexDirection: "column" as const,
        width: { xs: "95vw", md: "80vw" },
        maxWidth: { xs: "95vw", md: "80vw" },
        height: { xs: "90vh", md: "80vh" },
        maxHeight: { xs: "90vh", md: "80vh" },
        m: { xs: 1, md: 2 },
      }
    : { borderRadius: 2 };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={large ? false : "lg"} PaperProps={{ sx: paperSx }}>
      <DialogTitle sx={{ flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          flex: large ? 1 : undefined,
          minHeight: large ? 0 : undefined,
          height: large ? undefined : "75vh",
          p: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {pdfUrl ? (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
            </Worker>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%" flex={1}>
            <Typography color="text.secondary">Loading PDF…</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, flexShrink: 0 }}>
        <Button onClick={onClose}>Close</Button>
        {onDownload && (
          <Button variant="contained" startIcon={<DownloadOutlinedIcon />} onClick={onDownload}>
            Download
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SignedAgreementPdfViewer;
