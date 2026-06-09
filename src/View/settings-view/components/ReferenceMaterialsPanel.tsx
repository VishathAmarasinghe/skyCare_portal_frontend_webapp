import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import axios from "axios";
import { AppConfig } from "../../../config/config";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  AgreementReferenceMaterial,
  deactivateReferenceMaterial,
  downloadReferenceMaterialAdmin,
  fetchReferenceMaterials,
  uploadReferenceMaterial,
} from "../../../slices/agreementReferenceMaterialSlice/agreementReferenceMaterial";
import ReferenceMaterialViewerDialog from "../../common/ReferenceMaterialViewerDialog";
import { canPreviewReferenceMaterial } from "../../../utils/referenceMaterialPreview";

const audienceOptions = [
  { value: "BOTH", label: "Workers & clients" },
  { value: "WORKER", label: "Workers only" },
  { value: "CLIENT", label: "Clients only" },
];

const ReferenceMaterialsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const { materials, loading } = useAppSelector((state) => state.agreementReferenceMaterials);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("BOTH");
  const [careGiverType, setCareGiverType] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<AgreementReferenceMaterial | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        window.URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    dispatch(fetchReferenceMaterials(undefined));
  }, [dispatch]);

  const revokePreviewUrl = () => {
    if (previewUrlRef.current) {
      window.URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  };

  const handleClosePreview = () => {
    revokePreviewUrl();
    setSelectedMaterial(null);
    setPreviewError(null);
    setPreviewLoading(false);
  };

  const handleViewMaterial = async (material: AgreementReferenceMaterial) => {
    revokePreviewUrl();
    setSelectedMaterial(material);
    setPreviewError(null);

    if (!canPreviewReferenceMaterial(material)) {
      setPreviewLoading(false);
      return;
    }

    setPreviewLoading(true);
    try {
      const response = await axios.get(
        `${AppConfig.serviceUrls.agreementReferenceMaterials}/${material.id}/download`,
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], {
        type: material.mimeType || response.headers["content-type"] || "application/octet-stream",
      });
      const objectUrl = window.URL.createObjectURL(blob);
      previewUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
    } catch {
      setPreviewError("Unable to load reference material for preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return;
    setUploading(true);
    try {
      await dispatch(
        uploadReferenceMaterial({
          file,
          title: title.trim(),
          description: description.trim() || undefined,
          audience,
          careGiverType: careGiverType.trim() || undefined,
          sortOrder: Number(sortOrder) || 0,
          createdBy: auth.userInfo?.userID,
        })
      ).unwrap();
      setTitle("");
      setDescription("");
      setFile(null);
      setSortOrder("0");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle1" fontWeight={600}>
          Reference Materials
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Upload supporting documents (Staff Handbook, Position Description, etc.) that admins can attach when sending agreements.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Upload material
        </Typography>
        <Stack spacing={1.5}>
          <TextField
            label="Title"
            size="small"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Staff Handbook"
          />
          <TextField
            label="Description (optional)"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Audience</InputLabel>
              <Select label="Audience" value={audience} onChange={(e) => setAudience(e.target.value)}>
                {audienceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Care giver type (optional)"
              size="small"
              fullWidth
              value={careGiverType}
              onChange={(e) => setCareGiverType(e.target.value)}
              placeholder="e.g. Sub Contractor"
            />
            <TextField
              label="Sort order"
              size="small"
              type="number"
              sx={{ minWidth: 120 }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
            <Button variant="outlined" component="label" startIcon={<UploadFileOutlinedIcon />}>
              Choose file
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Button>
            {file && (
              <Typography variant="caption" color="text.secondary">
                {file.name}
              </Typography>
            )}
            <Box flex={1} />
            <Button
              variant="contained"
              disabled={!file || !title.trim() || uploading}
              onClick={handleUpload}
            >
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Available materials
        </Typography>
        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        ) : materials.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No reference materials uploaded yet.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {materials.map((material) => (
              <Stack
                key={material.id}
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ sm: "center" }}
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box flex={1} minWidth={0}>
                  <Typography variant="body2" fontWeight={600}>
                    {material.title}
                  </Typography>
                  {material.description && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {material.description}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap mt={0.5}>
                    <Chip size="small" label={material.audience} variant="outlined" />
                    {material.careGiverType && (
                      <Chip size="small" label={material.careGiverType} variant="outlined" />
                    )}
                    {material.originalFilename && (
                      <Chip size="small" label={material.originalFilename} variant="outlined" />
                    )}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      onClick={() => handleViewMaterial(material)}
                      disabled={previewLoading && selectedMaterial?.id === material.id}
                    >
                      {previewLoading && selectedMaterial?.id === material.id ? (
                        <CircularProgress size={16} />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton
                      size="small"
                      onClick={() =>
                        downloadReferenceMaterialAdmin(material.id, material.originalFilename)
                      }
                    >
                      <DownloadOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove">
                    <IconButton
                      size="small"
                      onClick={() => dispatch(deactivateReferenceMaterial(material.id))}
                    >
                      <DeleteOutlineIcon fontSize="small" color="error" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      <ReferenceMaterialViewerDialog
        open={selectedMaterial != null}
        onClose={handleClosePreview}
        material={
          selectedMaterial
            ? {
                title: selectedMaterial.title,
                mimeType: selectedMaterial.mimeType,
                originalFilename: selectedMaterial.originalFilename,
              }
            : null
        }
        fileUrl={previewUrl}
        loading={previewLoading}
        error={previewError}
        onDownload={
          selectedMaterial
            ? () => downloadReferenceMaterialAdmin(selectedMaterial.id, selectedMaterial.originalFilename)
            : undefined
        }
      />
    </Stack>
  );
};

export default ReferenceMaterialsPanel;
