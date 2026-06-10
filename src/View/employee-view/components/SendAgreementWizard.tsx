import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import PreviewOutlinedIcon from "@mui/icons-material/PreviewOutlined";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { State } from "../../../types/types";
import {
  adminSignInstance,
  AgreementValidationResult,
  clearActiveInstance,
  createAgreementInstance,
  downloadAgreementPdf,
  fetchInstanceEvents,
  previewAgreementInstance,
  sendAgreementInstance,
  sendAgreementManual,
  updateInstanceContent,
  validateAgreementInstance,
} from "../../../slices/agreementInstanceSlice/agreementInstance";
import {
  fetchEmailTemplates,
  previewEmailTemplate,
} from "../../../slices/emailTemplateSlice/emailTemplate";
import {
  createAgreementTemplateVersion,
  fetchPlaceholderCatalog,
} from "../../../slices/agreementTemplateSlice/agreementTemplate";
import { fetchReferenceMaterials } from "../../../slices/agreementReferenceMaterialSlice/agreementReferenceMaterial";
import AgreementTemplateEditor from "../../settings-view/components/AgreementTemplateEditor";
import SignatureModal from "../../incident-view/components/SignatureModal";
import SignedAgreementPdfViewer from "./SignedAgreementPdfViewer";
import AgreementEmailPreviewDialog from "./AgreementEmailPreviewDialog";
import AgreementHtmlContent from "../../common/AgreementHtmlContent";
import { APIService } from "../../../utils/apiService";
import { AppConfig } from "../../../config/config";

interface SendAgreementWizardProps {
  open: boolean;
  onClose: () => void;
  recipientType: "WORKER" | "CLIENT";
  recipientId: string;
  templateKey?: string;
  adminEmployeeId: string;
  onComplete: () => void;
}

const steps = ["Review document", "Sign & download", "Deliver agreement"];

type DeliveryMethod = "SYSTEM_EMAIL" | "MANUAL_LINK" | "MANUAL_PDF";

const formatEventLabel = (eventType: string) =>
  eventType
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

const SendAgreementWizard: React.FC<SendAgreementWizardProps> = ({
  open,
  onClose,
  recipientType,
  recipientId,
  templateKey,
  adminEmployeeId,
  onComplete,
}) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { activeInstance, previewHtml, submitState, events, applicableTemplates } =
    useAppSelector((state) => state.agreementInstances);
  const { placeholders } = useAppSelector((state) => state.agreementTemplates);
  const { templates: emailTemplates, preview: emailPreview, previewState } = useAppSelector(
    (state) => state.emailTemplates
  );
  const { materials: referenceMaterials } = useAppSelector(
    (state) => state.agreementReferenceMaterials
  );

  const [activeStep, setActiveStep] = useState(0);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [customContent, setCustomContent] = useState("");
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [templateRedirecting, setTemplateRedirecting] = useState(false);
  const [emailTemplateId, setEmailTemplateId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [ccEmails, setCcEmails] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [sending, setSending] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("SYSTEM_EMAIL");
  const [manualNotes, setManualNotes] = useState("");
  const [deliverSuccess, setDeliverSuccess] = useState<{ message?: string; signingUrl?: string } | null>(
    null
  );
  const [validation, setValidation] = useState<AgreementValidationResult | null>(null);
  const [selectedReferenceMaterialIds, setSelectedReferenceMaterialIds] = useState<string[]>([]);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);

  const flatPlaceholders = useMemo(
    () => placeholders.flatMap((c) => c.items),
    [placeholders]
  );

  const matchedTemplate = useMemo(
    () => applicableTemplates.find((t) => t.templateKey === activeInstance?.templateKey),
    [applicableTemplates, activeInstance?.templateKey]
  );

  useEffect(() => {
    if (open) {
      dispatch(fetchPlaceholderCatalog(undefined));
      dispatch(fetchEmailTemplates());
      initWizard();
    } else {
      dispatch(clearActiveInstance());
      setActiveStep(0);
      setPdfDialogOpen(false);
      setAuditOpen(false);
      setDeliverSuccess(null);
      setDeliveryMethod("SYSTEM_EMAIL");
      setManualNotes("");
      setSelectedReferenceMaterialIds([]);
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
        setPdfPreviewUrl(null);
      }
    }
  }, [open]);

  useEffect(() => {
    if (activeInstance?.recipientEmail) {
      setRecipientEmail(activeInstance.recipientEmail);
    }
  }, [activeInstance?.recipientEmail]);

  useEffect(() => {
    const invite =
      emailTemplates.find((t) => t.category === "AGREEMENT_INVITE") || emailTemplates[0];
    if (invite && !emailTemplateId) {
      setEmailTemplateId(invite.templateID);
      setEmailSubject(invite.title);
      setEmailBody(invite.content);
    }
  }, [emailTemplates, emailTemplateId]);

  useEffect(() => {
    if (emailSubject || emailBody) {
      dispatch(
        previewEmailTemplate({
          subject: emailSubject,
          bodyHtml: emailBody,
          sampleRecipientName: activeInstance?.recipientName,
          sampleRecipientEmail: recipientEmail,
          tokenOverrides: {
            "[Recipient Name]": activeInstance?.recipientName || "",
            "[Agreement Title]": activeInstance?.templateName || "",
            "[Expiry Date]": expiryDate
              ? new Date(expiryDate).toLocaleDateString("en-AU", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "",
            "[Signing URL]": "https://skycare.au/sign/preview-link",
          },
        })
      );
    }
  }, [
    emailSubject,
    emailBody,
    dispatch,
    activeInstance?.recipientName,
    activeInstance?.templateName,
    recipientEmail,
    expiryDate,
  ]);

  useEffect(() => {
    if (open) {
      dispatch(
        fetchReferenceMaterials({
          recipientType,
          careGiverType: matchedTemplate?.careGiverType,
        })
      );
    }
  }, [open, recipientType, matchedTemplate?.careGiverType, dispatch]);

  const defaultExpiry = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    if (!expiryDate) setExpiryDate(defaultExpiry);
  }, [defaultExpiry, expiryDate]);

  useEffect(() => {
    if (activeInstance?.id) {
      dispatch(previewAgreementInstance(activeInstance.id));
      dispatch(fetchInstanceEvents(activeInstance.id));
    }
  }, [activeInstance?.id, activeInstance?.hasCustomContent, activeInstance?.hasAdminSignature]);

  const initWizard = async () => {
    setInitializing(true);
    try {
      await dispatch(
        createAgreementInstance({
          recipientType,
          recipientId,
          templateKey,
          createdBy: adminEmployeeId,
        })
      ).unwrap();
    } finally {
      setInitializing(false);
    }
  };

  const refreshPdfPreview = async (instanceId: string) => {
    setPdfLoading(true);
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.agreements}/instances/${instanceId}/pdf`,
        { responseType: "blob" }
      );
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
      setPdfPreviewUrl(URL.createObjectURL(new Blob([response.data], { type: "application/pdf" })));
    } catch {
      setPdfPreviewUrl(null);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleOpenPdfPreview = async () => {
    if (!activeInstance?.id) return;
    setPdfDialogOpen(true);
    await refreshPdfPreview(activeInstance.id);
  };

  const handleClosePdfPreview = () => {
    setPdfDialogOpen(false);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  };

  const handleSaveCustomize = async () => {
    if (!activeInstance) return;
    await dispatch(
      updateInstanceContent({
        instanceId: activeInstance.id,
        customContentHtml: customContent,
        actorId: adminEmployeeId,
      })
    );
    setCustomizeOpen(false);
    dispatch(previewAgreementInstance(activeInstance.id));
    dispatch(fetchInstanceEvents(activeInstance.id));
  };

  const handleSignature = async (signatureData: string | null) => {
    if (!activeInstance || !signatureData) return;
    await dispatch(
      adminSignInstance({
        instanceId: activeInstance.id,
        payload: {
          adminEmployeeId,
          signatureBase64: signatureData,
          saveForReuse: true,
          signatureType: "DRAWN",
        },
      })
    );
    setSignatureOpen(false);
    dispatch(previewAgreementInstance(activeInstance.id));
    dispatch(fetchInstanceEvents(activeInstance.id));
  };

  const handleReuseSignature = async () => {
    if (!activeInstance) return;
    await dispatch(
      adminSignInstance({
        instanceId: activeInstance.id,
        payload: {
          adminEmployeeId,
          reuseSavedSignature: true,
          saveForReuse: true,
          signatureType: "SAVED",
        },
      })
    );
    dispatch(previewAgreementInstance(activeInstance.id));
    dispatch(fetchInstanceEvents(activeInstance.id));
  };

  const handleCustomizeTemplate = async () => {
    if (!matchedTemplate) return;
    setTemplateRedirecting(true);
    try {
      const version = await dispatch(
        createAgreementTemplateVersion({
          templateId: matchedTemplate.templateId,
          changeNotes: `Draft from send wizard — ${activeInstance?.recipientName || recipientId}`,
        })
      ).unwrap();
      onClose();
      navigate(
        `/settings?agreementTemplates=1&templateId=${matchedTemplate.templateId}&versionId=${version.id}`
      );
    } finally {
      setTemplateRedirecting(false);
    }
  };

  const handleDownload = async () => {
    if (!activeInstance) return;
    await dispatch(
      downloadAgreementPdf({
        instanceId: activeInstance.id,
        fileName: `${activeInstance.templateKey}-${activeInstance.id}.pdf`,
      })
    );
    dispatch(fetchInstanceEvents(activeInstance.id));
  };

  const handleContinueToSend = async () => {
    if (!activeInstance?.hasAdminSignature) return;
    const result = await dispatch(validateAgreementInstance(activeInstance.id)).unwrap();
    setValidation(result);
    setDeliverSuccess(null);
    setActiveStep(2);
  };

  const copySigningUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
  };

  const parseCcEmails = (value: string) =>
    value
      .split(/[,;]/)
      .map((email) => email.trim())
      .filter(Boolean);

  const handleOpenEmailPreview = async () => {
    await dispatch(
      previewEmailTemplate({
        subject: emailSubject,
        bodyHtml: emailBody,
        sampleRecipientName: activeInstance?.recipientName,
        sampleRecipientEmail: recipientEmail,
        tokenOverrides: {
          "[Recipient Name]": activeInstance?.recipientName || "",
          "[Agreement Title]": activeInstance?.templateName || "",
          "[Expiry Date]": expiryDate
            ? new Date(expiryDate).toLocaleDateString("en-AU", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "",
          "[Signing URL]": "https://skycare.au/sign/preview-link",
        },
      })
    );
    setEmailPreviewOpen(true);
  };

  const handleDeliver = async () => {
    if (!activeInstance) return;
    if (deliveryMethod === "SYSTEM_EMAIL" && (!emailTemplateId || !recipientEmail)) return;

    setSending(true);
    try {
      let result;
      if (deliveryMethod === "SYSTEM_EMAIL") {
        result = await dispatch(
          sendAgreementInstance({
            instanceId: activeInstance.id,
            payload: {
              emailTemplateId,
              recipientEmail,
              ccEmails: parseCcEmails(ccEmails),
              subjectOverride: emailSubject,
              bodyHtmlOverride: emailBody,
              expiresAt: expiryDate ? `${expiryDate}T23:59:59` : undefined,
              sentBy: adminEmployeeId,
              referenceMaterialIds: selectedReferenceMaterialIds,
            },
          })
        ).unwrap();
      } else {
        result = await dispatch(
          sendAgreementManual({
            instanceId: activeInstance.id,
            payload: {
              sendMethod: deliveryMethod,
              notes: manualNotes,
              expiresAt: expiryDate ? `${expiryDate}T23:59:59` : undefined,
              actorId: adminEmployeeId,
              referenceMaterialIds: selectedReferenceMaterialIds,
            },
          })
        ).unwrap();
      }
      dispatch(fetchInstanceEvents(activeInstance.id));
      setDeliverSuccess({
        message: result.message,
        signingUrl: result.signingUrl,
      });
    } finally {
      setSending(false);
    }
  };

  const handleEmailTemplateChange = (templateId: string) => {
    setEmailTemplateId(templateId);
    const template = emailTemplates.find((t) => t.templateID === templateId);
    if (template) {
      setEmailSubject(template.title);
      setEmailBody(template.content);
    }
  };

  const dialogPaperSx = {
    borderRadius: 2,
    display: "flex",
    flexDirection: "column" as const,
    width: isLargeScreen ? "80vw" : "95vw",
    maxWidth: isLargeScreen ? "80vw" : "95vw",
    height: isLargeScreen ? "80vh" : "95vh",
    maxHeight: isLargeScreen ? "80vh" : "95vh",
    m: isLargeScreen ? 2 : 1,
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={false}
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={{ pb: 1, flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack spacing={0.25}>
              <Typography variant="h6" fontWeight={600}>
                Send Service Agreement
              </Typography>
              {activeInstance && (
                <Typography variant="caption" color="text.secondary">
                  {activeInstance.templateName} · v{activeInstance.versionNumber} ·{" "}
                  {activeInstance.recipientName}
                </Typography>
              )}
            </Stack>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: activeStep === 2 ? "auto" : "hidden",
            p: 2,
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3, flexShrink: 0 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {initializing || submitState === State.loading ? (
            <Typography color="text.secondary" textAlign="center" py={6}>
              Preparing agreement…
            </Typography>
          ) : activeStep === 2 ? (
            <Stack spacing={2.5}>
              {deliverSuccess ? (
                <Alert
                  severity="success"
                  action={
                    deliverSuccess.signingUrl ? (
                      <Button
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => copySigningUrl(deliverSuccess.signingUrl!)}
                      >
                        Copy link
                      </Button>
                    ) : undefined
                  }
                >
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {deliverSuccess.message || "Agreement delivered successfully."}
                  </Typography>
                  {deliverSuccess.signingUrl && (
                    <Typography variant="caption" sx={{ wordBreak: "break-all" }} display="block">
                      {deliverSuccess.signingUrl}
                    </Typography>
                  )}
                </Alert>
              ) : (
                <>
                  {validation && !validation.valid && (
                    <Alert severity="warning">
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Review before sending
                      </Typography>
                      {validation.unresolvedPlaceholders?.length > 0 && (
                        <Typography variant="caption" display="block">
                          Unresolved: {validation.unresolvedPlaceholders.join(", ")}
                        </Typography>
                      )}
                      {validation.warnings?.map((w) => (
                        <Typography key={w} variant="caption" display="block">
                          {w}
                        </Typography>
                      ))}
                    </Alert>
                  )}

                  {referenceMaterials.length > 0 && (
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={0.75} mb={0.5}>
                        <AttachFileOutlinedIcon fontSize="small" color="action" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Reference materials
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Select supporting documents to include with this agreement.
                      </Typography>
                      <Stack spacing={0.5}>
                        {referenceMaterials.map((material) => (
                          <FormControlLabel
                            key={material.id}
                            control={
                              <Checkbox
                                size="small"
                                checked={selectedReferenceMaterialIds.includes(material.id)}
                                onChange={(e) => {
                                  setSelectedReferenceMaterialIds((prev) =>
                                    e.target.checked
                                      ? [...prev, material.id]
                                      : prev.filter((id) => id !== material.id)
                                  );
                                }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">{material.title}</Typography>
                                {material.description && (
                                  <Typography variant="caption" color="text.secondary">
                                    {material.description}
                                  </Typography>
                                )}
                              </Box>
                            }
                            sx={{ alignItems: "flex-start", mx: 0 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <FormControl size="small" fullWidth>
                    <InputLabel>Delivery method</InputLabel>
                    <Select
                      label="Delivery method"
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                    >
                      <MenuItem value="SYSTEM_EMAIL">Send via system email</MenuItem>
                      <MenuItem value="MANUAL_LINK">Share signing link manually</MenuItem>
                      <MenuItem value="MANUAL_PDF">Delivered PDF offline (no link)</MenuItem>
                    </Select>
                  </FormControl>

                  {deliveryMethod === "SYSTEM_EMAIL" && (
                    <>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Email template</InputLabel>
                        <Select
                          label="Email template"
                          value={emailTemplateId}
                          onChange={(e) => handleEmailTemplateChange(e.target.value)}
                        >
                          {emailTemplates.map((t) => (
                            <MenuItem key={t.templateID} value={t.templateID}>
                              {t.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        label="Recipient email"
                        size="small"
                        fullWidth
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                      />
                      <TextField
                        label="CC (optional)"
                        size="small"
                        fullWidth
                        value={ccEmails}
                        onChange={(e) => setCcEmails(e.target.value)}
                        placeholder="e.g. manager@example.com, hr@example.com"
                        helperText="Separate multiple addresses with commas"
                      />
                      <TextField
                        label="Subject"
                        size="small"
                        fullWidth
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                      />
                      <AgreementTemplateEditor
                        content={emailBody}
                        onChange={setEmailBody}
                        mode="email"
                        minHeight={160}
                      />
                      <Stack direction="row" justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          startIcon={<PreviewOutlinedIcon />}
                          onClick={handleOpenEmailPreview}
                          disabled={!emailSubject && !emailBody}
                        >
                          Preview email
                        </Button>
                      </Stack>
                    </>
                  )}

                  {(deliveryMethod === "MANUAL_LINK" || deliveryMethod === "MANUAL_PDF") && (
                    <TextField
                      label="Notes (optional)"
                      size="small"
                      fullWidth
                      multiline
                      minRows={2}
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                      placeholder={
                        deliveryMethod === "MANUAL_LINK"
                          ? "e.g. Link shared via SMS"
                          : "e.g. Printed copy handed to worker"
                      }
                    />
                  )}

                  {deliveryMethod !== "MANUAL_PDF" && (
                    <TextField
                      label="Link expiry date"
                      type="date"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      sx={{ maxWidth: 220 }}
                    />
                  )}

                </>
              )}
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => {
                    setCustomContent(previewHtml || "");
                    setCustomizeOpen(true);
                  }}
                >
                  Customize for this person
                </Button>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SettingsOutlinedIcon />}
                    onClick={handleCustomizeTemplate}
                    disabled={!matchedTemplate || templateRedirecting}
                  >
                    Edit global template
                  </Button>
                  <Tooltip title="Preview PDF">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleOpenPdfPreview}
                        disabled={!activeInstance?.id}
                        sx={{
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 1,
                          width: 34,
                          height: 34,
                        }}
                        aria-label="Preview PDF"
                      >
                        <PictureAsPdfOutlinedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                {activeStep === 1 && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DrawOutlinedIcon />}
                      onClick={() => setSignatureOpen(true)}
                    >
                      {activeInstance?.hasAdminSignature ? "Re-sign" : "Draw signature"}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ReplayIcon />}
                      onClick={handleReuseSignature}
                    >
                      Use saved signature
                    </Button>
                  </>
                )}
              </Stack>

              <AgreementHtmlContent
                html={previewHtml || ""}
                sx={{
                  flex: 1,
                  minHeight: 0,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1.5,
                  p: 2,
                  overflow: "auto",
                  backgroundColor: theme.palette.background.paper,
                }}
              />

              <Box sx={{ flexShrink: 0 }}>
                <Button
                  size="small"
                  startIcon={<HistoryOutlinedIcon />}
                  onClick={() => setAuditOpen((v) => !v)}
                  sx={{ color: "text.secondary" }}
                >
                  Activity log ({events.length})
                </Button>
                <Collapse in={auditOpen}>
                  <List dense disablePadding sx={{ mt: 0.5, maxHeight: 120, overflow: "auto" }}>
                    {events.length === 0 ? (
                      <ListItem>
                        <ListItemText
                          primary="No activity yet"
                          primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                        />
                      </ListItem>
                    ) : (
                      events.map((event) => (
                        <ListItem key={event.id} disableGutters>
                          <ListItemText
                            primary={formatEventLabel(event.eventType)}
                            secondary={
                              event.createdAt
                                ? new Date(event.createdAt).toLocaleString()
                                : undefined
                            }
                            primaryTypographyProps={{ variant: "body2" }}
                            secondaryTypographyProps={{ variant: "caption" }}
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </Collapse>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, flexShrink: 0 }}>
          {activeStep === 0 && (
            <>
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="contained" onClick={() => setActiveStep(1)}>
                Continue to sign
              </Button>
            </>
          )}
          {activeStep === 1 && (
            <>
              <Button onClick={() => setActiveStep(0)}>Back</Button>
              <Button
                variant="outlined"
                startIcon={<DownloadOutlinedIcon />}
                onClick={handleDownload}
                disabled={!activeInstance?.hasAdminSignature}
              >
                Download PDF
              </Button>
              <Button
                variant="contained"
                onClick={handleContinueToSend}
                disabled={
                  !(activeInstance?.canSend ?? activeInstance?.hasAdminSignature)
                }
              >
                Continue to deliver
              </Button>
            </>
          )}
          {activeStep === 2 && (
            <>
              <Button onClick={() => setActiveStep(1)} disabled={Boolean(deliverSuccess)}>
                Back
              </Button>
              {deliverSuccess ? (
                <Button variant="contained" onClick={onComplete}>
                  Done
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<SendOutlinedIcon />}
                  onClick={handleDeliver}
                  disabled={
                    sending ||
                    !(activeInstance?.canSend ?? activeInstance?.hasAdminSignature) ||
                    (deliveryMethod === "SYSTEM_EMAIL" && (!recipientEmail || !emailTemplateId))
                  }
                >
                  {sending
                    ? "Sending…"
                    : deliveryMethod === "SYSTEM_EMAIL"
                      ? "Send via email"
                      : deliveryMethod === "MANUAL_LINK"
                        ? "Mark sent & get link"
                        : "Mark sent (offline PDF)"}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={customizeOpen} onClose={() => setCustomizeOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Customize for this person</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Typography variant="body2" color="text.secondary">
              Changes apply only to this agreement instance, not the global template.
            </Typography>
            <AgreementTemplateEditor
              content={customContent}
              onChange={setCustomContent}
              placeholders={flatPlaceholders}
              minHeight={320}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomizeOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCustomize}>
            Save & refresh preview
          </Button>
        </DialogActions>
      </Dialog>

      <SignedAgreementPdfViewer
        open={pdfDialogOpen}
        onClose={handleClosePdfPreview}
        pdfUrl={pdfLoading ? null : pdfPreviewUrl}
        title="PDF Preview"
        large
        onDownload={activeInstance?.hasAdminSignature ? handleDownload : undefined}
      />

      <AgreementEmailPreviewDialog
        open={emailPreviewOpen}
        onClose={() => setEmailPreviewOpen(false)}
        preview={emailPreview}
        toEmail={recipientEmail}
        ccEmails={ccEmails}
        loading={previewState === State.loading}
      />

      <SignatureModal
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        onSignature={handleSignature}
        title="Admin signature"
      />
    </>
  );
};

export default SendAgreementWizard;
