import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
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
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  AgreementTemplate,
  createAgreementTemplate,
  createAgreementTemplateVersion,
  fetchAgreementTemplateVersion,
  fetchAgreementTemplates,
  fetchPlaceholderCatalog,
  previewAgreementTemplateVersion,
  publishAgreementTemplateVersion,
  updateAgreementTemplateVersion,
} from "../../../slices/agreementTemplateSlice/agreementTemplate";
import AgreementTemplateEditor from "./AgreementTemplateEditor";
import AgreementHtmlContent from "../../common/AgreementHtmlContent";
import { CARE_GIVER_TYPES, isVisibleAgreementTemplate } from "../../../constants";

interface AgreementTemplatesPanelProps {
  deepLinkTemplateId?: string | null;
  deepLinkVersionId?: string | null;
}

const AgreementTemplatesPanel: React.FC<AgreementTemplatesPanelProps> = ({
  deepLinkTemplateId,
  deepLinkVersionId,
}) => {
  const dispatch = useAppDispatch();
  const { templates, selectedVersion, previewHtml, placeholders } = useAppSelector(
    (state) => state.agreementTemplates
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AgreementTemplate | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [changeNotes, setChangeNotes] = useState("");
  const [newTemplate, setNewTemplate] = useState({
    templateKey: "",
    displayName: "",
    audience: "WORKER",
    careGiverType: "Contractor",
    initialContentHtml: "<p>New agreement template</p>",
  });

  const flatPlaceholders = useMemo(
    () => placeholders.flatMap((category) => category.items),
    [placeholders]
  );

  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  useEffect(() => {
    dispatch(fetchAgreementTemplates());
    dispatch(fetchPlaceholderCatalog(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (!deepLinkTemplateId || !templates.length || deepLinkHandled) return;
    const template = templates.find((t) => t.id === deepLinkTemplateId);
    if (template) {
      setDeepLinkHandled(true);
      openEditor(template, deepLinkVersionId || undefined);
    }
  }, [deepLinkTemplateId, deepLinkVersionId, templates, deepLinkHandled]);

  const visibleTemplates = useMemo(
    () => templates.filter(isVisibleAgreementTemplate),
    [templates]
  );

  const columns: GridColDef[] = [
    { field: "templateKey", headerName: "Key", flex: 1 },
    { field: "displayName", headerName: "Name", flex: 1.2 },
    { field: "audience", headerName: "Audience", width: 100 },
    { field: "careGiverType", headerName: "Care Giver Type", width: 140 },
    {
      field: "publishedVersionNumber",
      headerName: "Published",
      width: 100,
      valueGetter: (_value, row) =>
        row.publishedVersionNumber ? `v${row.publishedVersionNumber}` : "—",
    },
  ];

  const openEditor = async (template: AgreementTemplate, preferredVersionId?: string) => {
    setSelectedTemplate(template);
    let versionId = preferredVersionId;

    if (!versionId) {
      versionId =
        template.versions?.find((v) => v.status === "DRAFT")?.id ||
        template.publishedVersionId;
    }

    if (!versionId) {
      const created = await dispatch(
        createAgreementTemplateVersion({ templateId: template.id, changeNotes: "New draft" })
      ).unwrap();
      versionId = created.id;
    } else if (
      !preferredVersionId &&
      template.versions?.every((v) => v.status !== "DRAFT") &&
      template.publishedVersionId
    ) {
      const created = await dispatch(
        createAgreementTemplateVersion({
          templateId: template.id,
          changeNotes: "Draft from published version",
        })
      ).unwrap();
      versionId = created.id;
    }

    const version = await dispatch(fetchAgreementTemplateVersion(versionId)).unwrap();
    setEditorContent(version.contentHtml);
    setChangeNotes(version.changeNotes || "");
    setEditorOpen(true);
  };

  const handleSaveDraft = async () => {
    if (!selectedVersion) return;
    await dispatch(
      updateAgreementTemplateVersion({
        versionId: selectedVersion.id,
        payload: { contentHtml: editorContent, changeNotes },
      })
    );
  };

  const handlePublish = async () => {
    if (!selectedVersion) return;
    await dispatch(
      updateAgreementTemplateVersion({
        versionId: selectedVersion.id,
        payload: { contentHtml: editorContent, changeNotes },
      })
    );
    await dispatch(publishAgreementTemplateVersion(selectedVersion.id));
    setEditorOpen(false);
    dispatch(fetchAgreementTemplates());
  };

  const handlePreview = async () => {
    if (!selectedVersion) return;
    await dispatch(
      updateAgreementTemplateVersion({
        versionId: selectedVersion.id,
        payload: { contentHtml: editorContent, changeNotes },
      })
    );
    await dispatch(previewAgreementTemplateVersion(selectedVersion.id));
    setPreviewOpen(true);
  };

  const handleCreate = async () => {
    await dispatch(createAgreementTemplate(newTemplate));
    setCreateOpen(false);
    dispatch(fetchAgreementTemplates());
  };

  return (
    <Stack spacing={2} height="100%">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight={600}>
          Agreement Templates
        </Typography>
        <Button variant="contained" size="small" onClick={() => setCreateOpen(true)}>
          New Template
        </Button>
      </Stack>
      <Box height={360}>
        <DataGrid
          rows={visibleTemplates}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(params) => openEditor(params.row as AgreementTemplate)}
          disableRowSelectionOnClick={false}
          pageSizeOptions={[5, 10]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
        />
      </Box>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Agreement Template</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Template Key"
              value={newTemplate.templateKey}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, templateKey: e.target.value })
              }
              placeholder="worker_contractor"
            />
            <TextField
              label="Display Name"
              value={newTemplate.displayName}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, displayName: e.target.value })
              }
            />
            <FormControl>
              <InputLabel>Audience</InputLabel>
              <Select
                label="Audience"
                value={newTemplate.audience}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, audience: e.target.value })
                }
              >
                <MenuItem value="WORKER">Worker</MenuItem>
                <MenuItem value="CLIENT">Client</MenuItem>
              </Select>
            </FormControl>
            {newTemplate.audience === "WORKER" && (
              <FormControl>
                <InputLabel>Care Giver Type</InputLabel>
                <Select
                  label="Care Giver Type"
                  value={newTemplate.careGiverType}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, careGiverType: e.target.value })
                  }
                >
                  {CARE_GIVER_TYPES.filter((type) => type !== "Not specified").map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Edit Template — {selectedTemplate?.displayName} ({selectedVersion?.status})
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Change notes"
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              size="small"
            />
            <AgreementTemplateEditor
              content={editorContent}
              onChange={setEditorContent}
              placeholders={flatPlaceholders}
              templateId={selectedTemplate?.id}
              minHeight={400}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorOpen(false)}>Close</Button>
          <Button onClick={handlePreview}>Preview</Button>
          <Button onClick={handleSaveDraft}>Save Draft</Button>
          <Button variant="contained" onClick={handlePublish}>
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Merged Preview (sample data)</DialogTitle>
        <DialogContent>
          <AgreementHtmlContent
            html={previewHtml || ""}
            sx={{ border: "1px solid #eee", borderRadius: 1, p: 2, mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AgreementTemplatesPanel;
