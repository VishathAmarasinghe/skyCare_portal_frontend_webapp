import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
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
  useTheme,
} from "@mui/material";
import PreviewIcon from "@mui/icons-material/Preview";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { State } from "../../../types/types";
import {
  EmailTemplate,
  clearEmailPreview,
  fetchEmailPlaceholders,
  fetchEmailTemplates,
  previewEmailTemplate,
  setSelectedEmailTemplate,
  testSendEmailTemplate,
  updateEmailTemplate,
} from "../../../slices/emailTemplateSlice/emailTemplate";
import AgreementTemplateEditor from "./AgreementTemplateEditor";

const CATEGORY_LABELS: Record<string, string> = {
  AGREEMENT_INVITE: "Agreement Invitation",
  AGREEMENT_SIGNED_CONFIRM: "Signed Confirmation",
  AGREEMENT_ADMIN_NOTIFY: "Admin Notification",
  AGREEMENT_REMINDER: "Reminder",
};

const EmailTemplatesPanel: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { templates, selectedTemplate, placeholders, preview, previewState } =
    useAppSelector((state) => state.emailTemplates);
  const [editorContent, setEditorContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
    selectedTemplate ? [selectedTemplate.templateID] : []
  );

  const agreementTemplates = useMemo(
    () => templates.filter((t) => t.category?.startsWith("AGREEMENT_")),
    [templates]
  );

  const editorPlaceholders = useMemo(
    () =>
      placeholders.map((item) => ({
        token: item.token,
        category: "Email",
        description: item.description,
        exampleOutput: item.exampleOutput,
        sourceEntity: "Email",
      })),
    [placeholders]
  );

  useEffect(() => {
    dispatch(fetchEmailTemplates());
    dispatch(fetchEmailPlaceholders());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTemplate) {
      setEditorContent(selectedTemplate.content);
      setSelectionModel([selectedTemplate.templateID]);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (!selectedTemplate && agreementTemplates.length > 0) {
      dispatch(setSelectedEmailTemplate(agreementTemplates[0]));
    }
  }, [agreementTemplates, selectedTemplate, dispatch]);

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Subject template",
      flex: 1.4,
      minWidth: 200,
    },
    {
      field: "category",
      headerName: "Type",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Chip
          size="small"
          label={CATEGORY_LABELS[params.value as string] || params.value || "—"}
          sx={{
            backgroundColor: theme.palette.primary.light + "22",
            color: theme.palette.primary.main,
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: "placeholdersMetadata",
      headerName: "Placeholders",
      flex: 1.2,
      minWidth: 220,
      valueGetter: (_value, row) => row.placeholdersMetadata || "—",
    },
  ];

  const handleSave = async () => {
    if (!selectedTemplate) return;
    await dispatch(
      updateEmailTemplate({
        id: selectedTemplate.templateID,
        payload: { ...selectedTemplate, content: editorContent },
      })
    );
    dispatch(fetchEmailTemplates());
  };

  const handlePreview = async () => {
    if (!selectedTemplate) return;
    await dispatch(
      previewEmailTemplate({
        subject: selectedTemplate.title,
        bodyHtml: editorContent,
      })
    );
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    dispatch(clearEmailPreview());
  };

  const handleTestSend = async () => {
    if (!selectedTemplate || !testEmail) return;
    await dispatch(
      testSendEmailTemplate({
        recipientEmail: testEmail,
        subject: selectedTemplate.title,
        content: editorContent,
      })
    );
  };

  return (
    <Stack spacing={2} height="100%">
      <Stack spacing={0.5}>
        <Typography variant="subtitle1" fontWeight={600}>
          Agreement Email Templates
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Set the subject and body for each agreement email. Your body content is placed inside
          the branded SkyCare email layout (header, logo, footer).
        </Typography>
      </Stack>

      <Box
        sx={{
          width: "100%",
          minHeight: 280,
          height: Math.max(280, agreementTemplates.length * 52 + 56),
          maxHeight: 360,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.grey[100],
            fontWeight: 600,
          },
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
        }}
      >
        <DataGrid
          rows={agreementTemplates}
          columns={columns}
          getRowId={(row) => row.templateID}
          density="comfortable"
          disableColumnMenu
          disableRowSelectionOnClick={false}
          hideFooter={agreementTemplates.length <= 5}
          pageSizeOptions={[5, 10]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={(model) => {
            setSelectionModel(model);
            const selectedId = model[0];
            const row = agreementTemplates.find((t) => t.templateID === selectedId);
            if (row) {
              dispatch(setSelectedEmailTemplate(row));
            }
          }}
          onRowClick={(params) =>
            dispatch(setSelectedEmailTemplate(params.row as EmailTemplate))
          }
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            backgroundColor: "background.paper",
            "& .MuiDataGrid-row.Mui-selected": {
              backgroundColor: theme.palette.primary.light + "33",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        />
      </Box>

      {selectedTemplate && (
        <Stack spacing={2} sx={{ pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Edit: {CATEGORY_LABELS[selectedTemplate.category || ""] || selectedTemplate.title}
          </Typography>

          <TextField
            label="Subject template"
            size="small"
            fullWidth
            helperText="Use placeholders like [Recipient Name] or [Agreement Title]"
            value={selectedTemplate.title}
            onChange={(e) =>
              dispatch(
                setSelectedEmailTemplate({
                  ...selectedTemplate,
                  title: e.target.value,
                })
              )
            }
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Template type</InputLabel>
            <Select
              label="Template type"
              value={selectedTemplate.category || ""}
              onChange={(e) =>
                dispatch(
                  setSelectedEmailTemplate({
                    ...selectedTemplate,
                    category: e.target.value,
                  })
                )
              }
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={600}>
              Email body
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This content appears inside the branded email template. Insert placeholders from the
              dropdown in the editor toolbar.
            </Typography>
          </Stack>

          <AgreementTemplateEditor
            content={editorContent}
            onChange={setEditorContent}
            placeholders={editorPlaceholders}
            mode="email"
            minHeight={220}
          />

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {placeholders.map((item) => (
              <Chip
                key={item.token}
                size="small"
                label={item.token}
                variant="outlined"
                title={`${item.description} — e.g. ${item.exampleOutput}`}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={handlePreview}
              disabled={previewState === State.loading}
            >
              Preview final email
            </Button>
            <TextField
              size="small"
              label="Test recipient email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              sx={{ flex: 1, minWidth: 220 }}
            />
            <Button variant="outlined" onClick={handleTestSend}>
              Test Send
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </Stack>
        </Stack>
      )}

      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle>Email preview (sample data)</DialogTitle>
        <DialogContent>
          {preview && (
            <Stack spacing={2} mt={1}>
              <Box
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  p: 2,
                  backgroundColor: theme.palette.grey[50],
                }}
              >
                <Typography variant="body2">
                  <strong>From:</strong> {preview.fromAddress}
                </Typography>
                <Typography variant="body2">
                  <strong>To:</strong> {preview.sampleRecipient}
                </Typography>
                <Typography variant="body2">
                  <strong>Subject:</strong> {preview.mergedSubject}
                </Typography>
              </Box>

              <Box
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  overflow: "hidden",
                  backgroundColor: "#f4f6f8",
                }}
              >
                <Box
                  sx={{ pointerEvents: "none" }}
                  dangerouslySetInnerHTML={{ __html: preview.fullHtml }}
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                Placeholders are filled with sample values. The actual email uses real recipient
                and agreement data when sent from the agreement wizard.
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default EmailTemplatesPanel;
