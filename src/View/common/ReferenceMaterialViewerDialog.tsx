import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import {
  getReferenceMaterialViewMode,
  ReferenceMaterialPreviewMeta,
} from "../../utils/referenceMaterialPreview";

export interface ReferenceMaterialViewerTarget extends ReferenceMaterialPreviewMeta {
  title: string;
}

interface ReferenceMaterialViewerDialogProps {
  open: boolean;
  onClose: () => void;
  material: ReferenceMaterialViewerTarget | null;
  fileUrl: string | null;
  loading?: boolean;
  error?: string | null;
  onDownload?: () => void;
}

const ReferenceMaterialViewerDialog: React.FC<ReferenceMaterialViewerDialogProps> = ({
  open,
  onClose,
  material,
  fileUrl,
  loading = false,
  error = null,
  onDownload,
}) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const viewMode = material ? getReferenceMaterialViewMode(material) : "unsupported";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          width: { xs: "95vw", md: "80vw" },
          maxWidth: { xs: "95vw", md: "80vw" },
          height: { xs: "90vh", md: "80vh" },
          maxHeight: { xs: "90vh", md: "80vh" },
          m: { xs: 1, md: 2 },
        },
      }}
    >
      <DialogTitle sx={{ flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="h6" fontWeight={600} sx={{ wordBreak: "break-word" }}>
            {material?.title || "Reference material"}
          </Typography>
          <IconButton size="small" onClick={onClose} aria-label="Close preview">
            <CloseIcon />
          </IconButton>
        </Stack>
        {material?.originalFilename && (
          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
            {material.originalFilename}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          flex: 1,
          minHeight: 0,
          p: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "grey.100",
        }}
      >
        {loading ? (
          <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                Loading document…
              </Typography>
            </Stack>
          </Box>
        ) : error ? (
          <Box display="flex" alignItems="center" justifyContent="center" flex={1} px={3}>
            <Typography color="error" textAlign="center">
              {error}
            </Typography>
          </Box>
        ) : viewMode === "pdf" && fileUrl ? (
          <Box sx={{ flex: 1, minHeight: 0, backgroundColor: "#fff" }}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
            </Worker>
          </Box>
        ) : viewMode === "image" && fileUrl ? (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
              backgroundColor: "#fff",
            }}
          >
            <Box
              component="img"
              src={fileUrl}
              alt={material?.title || "Reference material"}
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flex={1}
            px={3}
            py={4}
            sx={{ backgroundColor: "#fff" }}
          >
            <Stack alignItems="center" spacing={1.5} maxWidth={360} textAlign="center">
              <DescriptionOutlinedIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Preview not available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This file type cannot be opened in the browser. Download the file to view it on
                your device.
              </Typography>
            </Stack>
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

export default ReferenceMaterialViewerDialog;
