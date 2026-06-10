import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AppConfig } from "../../config/config";
import PublicSignaturePad from "./PublicSignaturePad";
import AgreementHtmlContent, { getAgreementHtmlSnapshot } from "../common/AgreementHtmlContent";
import ReferenceMaterialViewerDialog from "../common/ReferenceMaterialViewerDialog";
import { injectRecipientSignaturePreview } from "../../utils/agreementSignaturePreview";
import { stripInteractiveAgreementMarkup } from "../../utils/agreementCheckboxMarkup";
import { canPreviewReferenceMaterial } from "../../utils/referenceMaterialPreview";

interface AgreementReferenceMaterialSummary {
  id: string;
  title: string;
  description?: string;
  originalFilename?: string;
  mimeType?: string;
}

interface PublicDocument {
  templateName?: string;
  versionNumber?: number;
  recipientName?: string;
  organizationName?: string;
  mergedHtml?: string;
  status?: string;
  expiresAt?: string;
  alreadySigned?: boolean;
  expired?: boolean;
  cancelled?: boolean;
  emailVerificationRequired?: boolean;
  consentText?: string;
  referenceMaterials?: AgreementReferenceMaterialSummary[];
}

const PublicSignPage: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<PublicDocument | null>(null);
  const [consent, setConsent] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signatureType, setSignatureType] = useState<"DRAWN" | "UPLOADED">("DRAWN");
  const [signed, setSigned] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [downloadingReferenceId, setDownloadingReferenceId] = useState<string | null>(null);
  const [selectedReferenceMaterial, setSelectedReferenceMaterial] =
    useState<AgreementReferenceMaterialSummary | null>(null);
  const [viewingMaterialUrl, setViewingMaterialUrl] = useState<string | null>(null);
  const [viewingMaterialLoading, setViewingMaterialLoading] = useState(false);
  const [viewingMaterialError, setViewingMaterialError] = useState<string | null>(null);
  const viewingMaterialUrlRef = useRef<string | null>(null);
  const agreementContentRef = useRef<HTMLDivElement | null>(null);
  const [checkboxHtml, setCheckboxHtml] = useState<string | null>(null);

  const loadDocument = async (email?: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${AppConfig.serviceUrls.publicAgreements}/${token}`, {
        params: email ? { email } : undefined,
      });
      const data = response.data as PublicDocument;
      setDocument(data);
      setEmailVerified(!data.emailVerificationRequired);
      setSigned(data.alreadySigned || false);
      setCheckboxHtml(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "This signing link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, [token]);

  useEffect(() => {
    const previousBodyOverflow = window.document.body.style.overflow;
    const previousHtmlOverflow = window.document.documentElement.style.overflow;
    window.document.body.style.overflow = "auto";
    window.document.documentElement.style.overflow = "auto";

    return () => {
      window.document.body.style.overflow = previousBodyOverflow;
      window.document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const displayHtml = useMemo(() => {
    const base = checkboxHtml ?? document?.mergedHtml ?? "";
    if (signed || !signatureData) {
      return base;
    }
    return injectRecipientSignaturePreview(base, signatureData);
  }, [checkboxHtml, document?.mergedHtml, signatureData, signed]);

  const handleVerifyEmail = () => {
    loadDocument(verifyEmail);
  };

  const handleSign = async () => {
    if (!token || !signatureData || !consent) return;
    setSubmitting(true);
    setError(null);
    try {
      const snapshot = getAgreementHtmlSnapshot(agreementContentRef.current);
      const markedHtml = stripInteractiveAgreementMarkup(
        injectRecipientSignaturePreview(snapshot || displayHtml, signatureData)
      );
      await axios.post(`${AppConfig.serviceUrls.publicAgreements}/${token}/sign`, {
        signatureBase64: signatureData,
        signatureType,
        consentAccepted: consent,
        markedHtml,
      });
      setSigned(true);
      await loadDocument(verifyEmail || undefined);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to submit signature. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    if (!token) return;
    setDownloading(true);
    setError(null);
    try {
      if (signed || !signatureData) {
        const response = await axios.get(`${AppConfig.serviceUrls.publicAgreements}/${token}/pdf`, {
          responseType: "blob",
        });
        downloadBlob(
          new Blob([response.data], { type: "application/pdf" }),
          signed ? "signed-agreement.pdf" : "agreement.pdf"
        );
      } else {
        const response = await axios.post(
          `${AppConfig.serviceUrls.publicAgreements}/${token}/pdf/preview`,
          { signatureBase64: signatureData },
          { responseType: "blob" }
        );
        downloadBlob(new Blob([response.data], { type: "application/pdf" }), "agreement-preview.pdf");
      }
    } catch {
      setError("Unable to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const showMobileSignBar =
    isMobile && emailVerified && !signed && !document?.expired && !document?.cancelled;

  const fetchReferenceMaterialBlob = async (material: AgreementReferenceMaterialSummary) => {
    if (!token) {
      throw new Error("Invalid signing link");
    }
    const response = await axios.get(
      `${AppConfig.serviceUrls.publicAgreements}/${token}/reference-materials/${material.id}`,
      { responseType: "blob" }
    );
    return new Blob([response.data], {
      type: material.mimeType || response.headers["content-type"] || "application/octet-stream",
    });
  };

  const revokeViewingMaterialUrl = () => {
    if (viewingMaterialUrlRef.current) {
      window.URL.revokeObjectURL(viewingMaterialUrlRef.current);
      viewingMaterialUrlRef.current = null;
    }
    setViewingMaterialUrl(null);
  };

  const handleCloseReferenceMaterialViewer = () => {
    revokeViewingMaterialUrl();
    setSelectedReferenceMaterial(null);
    setViewingMaterialError(null);
    setViewingMaterialLoading(false);
  };

  const handleDownloadReferenceMaterial = async (material: AgreementReferenceMaterialSummary) => {
    setDownloadingReferenceId(material.id);
    setError(null);
    try {
      const blob = await fetchReferenceMaterialBlob(material);
      downloadBlob(blob, material.originalFilename || `${material.title}.pdf`);
    } catch {
      setError("Unable to download reference material.");
    } finally {
      setDownloadingReferenceId(null);
    }
  };

  const handleViewReferenceMaterial = async (material: AgreementReferenceMaterialSummary) => {
    revokeViewingMaterialUrl();
    setSelectedReferenceMaterial(material);
    setViewingMaterialError(null);

    if (!canPreviewReferenceMaterial(material)) {
      setViewingMaterialLoading(false);
      return;
    }

    setViewingMaterialLoading(true);
    try {
      const blob = await fetchReferenceMaterialBlob(material);
      const objectUrl = window.URL.createObjectURL(blob);
      viewingMaterialUrlRef.current = objectUrl;
      setViewingMaterialUrl(objectUrl);
    } catch {
      setViewingMaterialError("Unable to load reference material for preview.");
    } finally {
      setViewingMaterialLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (viewingMaterialUrlRef.current) {
        window.URL.revokeObjectURL(viewingMaterialUrlRef.current);
      }
    };
  }, []);

  const referenceMaterialsPanel =
    (document?.referenceMaterials?.length ?? 0) > 0 ? (
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: 2,
          p: { xs: 1.25, sm: 1.5 },
          mt: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <AttachFileOutlinedIcon color="action" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={600}>
            Reference materials
          </Typography>
        </Stack>
        <Stack spacing={1}>
          {document?.referenceMaterials?.map((material) => (
            <Stack
              key={material.id}
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
              sx={{
                p: 1,
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                backgroundColor: "background.default",
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
                {material.originalFilename && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {material.originalFilename}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "center" } }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={
                    viewingMaterialLoading && selectedReferenceMaterial?.id === material.id ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <VisibilityOutlinedIcon />
                    )
                  }
                  onClick={() => handleViewReferenceMaterial(material)}
                  disabled={viewingMaterialLoading && selectedReferenceMaterial?.id === material.id}
                >
                  View
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={
                    downloadingReferenceId === material.id ? (
                      <CircularProgress size={14} />
                    ) : (
                      <DownloadOutlinedIcon />
                    )
                  }
                  onClick={() => handleDownloadReferenceMaterial(material)}
                  disabled={downloadingReferenceId === material.id}
                >
                  Download
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Paper>
    ) : null;

  const downloadLabel = signed ? "Download PDF" : signatureData ? "Download preview" : "Download";

  const documentPanel = (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        overflow: { xs: "visible", md: "hidden" },
        width: "100%",
        maxWidth: "100%",
        height: { xs: "auto", md: "calc(100dvh - 200px)" },
        maxHeight: { xs: "none", md: "calc(100dvh - 200px)" },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={1}
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 1.25,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="flex-start" spacing={1} minWidth={0}>
          <DescriptionOutlinedIcon color="action" fontSize="small" sx={{ mt: 0.25, flexShrink: 0 }} />
          <Box minWidth={0}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ wordBreak: "break-word", whiteSpace: "normal" }}
            >
              {document?.templateName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>
              v{document?.versionNumber}
              {document?.expiresAt && !signed
                ? ` · Expires ${new Date(document.expiresAt).toLocaleDateString()}`
                : ""}
            </Typography>
          </Box>
        </Stack>
        {isMobile ? (
          <Tooltip title={downloadLabel}>
            <span>
              <Button
                size="small"
                variant="outlined"
                fullWidth
                startIcon={downloading ? <CircularProgress size={14} /> : <DownloadOutlinedIcon />}
                onClick={handleDownload}
                disabled={downloading || (!signed && !signatureData && !document?.mergedHtml)}
              >
                PDF
              </Button>
            </span>
          </Tooltip>
        ) : (
          <Button
            size="small"
            variant="outlined"
            startIcon={downloading ? <CircularProgress size={14} /> : <DownloadOutlinedIcon />}
            onClick={handleDownload}
            disabled={downloading || (!signed && !signatureData && !document?.mergedHtml)}
            sx={{ flexShrink: 0, alignSelf: { sm: "center" } }}
          >
            {downloadLabel}
          </Button>
        )}
      </Stack>

      <Box
        sx={{
          flex: { xs: "none", md: 1 },
          minHeight: { md: 0 },
          overflowY: { xs: "visible", md: "auto" },
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <AgreementHtmlContent
          ref={agreementContentRef}
          html={displayHtml}
          interactive={emailVerified && !signed && !document?.expired && !document?.cancelled}
          onContentChange={setCheckboxHtml}
          styleOptions={{ compactMobile: true }}
          sx={{
            p: { xs: 1.25, sm: 2.5 },
            backgroundColor: "#fff",
            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
            lineHeight: 1.55,
          }}
        />
        {referenceMaterialsPanel && (
          <Box sx={{ px: { xs: 1.25, sm: 2.5 }, pb: { xs: 1.25, sm: 2.5 } }}>
            {referenceMaterialsPanel}
          </Box>
        )}
      </Box>
    </Paper>
  );

  const signaturePanel = !signed ? (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: { xs: 2, sm: 2.5 },
        height: { md: "fit-content" },
        maxHeight: { md: "calc(100dvh - 200px)" },
        overflowY: { md: "auto" },
        position: { md: "sticky" },
        top: { md: 16 },
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Sign agreement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {document?.recipientName
              ? `Hi ${document.recipientName}, review the agreement and add your signature.`
              : "Review the agreement and add your signature."}
          </Typography>
        </Box>

        <Divider />

        {!signed && (
          <Alert severity="info" icon={false} sx={{ py: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              Tap the ☐ tick boxes in the agreement to select Yes/No and other options before signing.
            </Typography>
          </Alert>
        )}

        <PublicSignaturePad
          onSignature={(data, type) => {
            setSignatureData(data);
            if (data) setSignatureType(type);
          }}
        />

        {signatureData && (
          <Alert severity="info" icon={false} sx={{ py: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              Your signature is shown in the agreement preview
              {isDesktop ? " on the left" : " above"}.
            </Typography>
          </Alert>
        )}

        <FormControlLabel
          control={<Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />}
          label={
            <Typography variant="body2" lineHeight={1.5}>
              {document?.consentText ||
                "I have read and understood this agreement and agree to sign it electronically."}
            </Typography>
          }
          sx={{ alignItems: "flex-start", mx: 0 }}
        />

        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={!consent || !signatureData || submitting}
          onClick={handleSign}
          sx={{ display: { xs: "none", sm: "inline-flex" } }}
        >
          {submitting ? "Submitting…" : "Complete signing"}
        </Button>
      </Stack>
    </Paper>
  ) : (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: { xs: 2.5, sm: 3 },
        textAlign: "center",
        height: { md: "fit-content" },
        position: { md: "sticky" },
        top: { md: 16 },
      }}
    >
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 52, mb: 1 }} />
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Successfully signed
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2.5}>
        Thank you{document?.recipientName ? `, ${document.recipientName}` : ""}. A confirmation email
        has been sent.
      </Typography>
      <Button
        variant="contained"
        fullWidth
        size="large"
        startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <DownloadOutlinedIcon />}
        onClick={handleDownload}
        disabled={downloading}
      >
        Download signed PDF
      </Button>
    </Paper>
  );

  if (loading) {
    return (
      <Box minHeight="100dvh" display="flex" alignItems="center" justifyContent="center">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Loading agreement…
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100dvh"
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.grey[50],
        overflow: { xs: "auto", md: "hidden" },
        height: { md: "100dvh" },
        width: "100%",
      }}
    >
      <Box
        component="header"
        sx={{
          py: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Container maxWidth="xl" disableGutters={!isDesktop}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={0.5}
          >
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {document?.organizationName || "SkyCare"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Electronic Service Agreement
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Box
        component="main"
        sx={{
          flex: { xs: "0 0 auto", md: 1 },
          minHeight: { md: 0 },
          py: { xs: 1.5, md: 2 },
          px: { xs: 1, sm: 2, md: 3 },
          overflow: { xs: "auto", md: "hidden" },
          pb: {
            xs: showMobileSignBar ? "calc(88px + env(safe-area-inset-bottom, 0px))" : 1.5,
            md: 2,
          },
        }}
      >
        <Container maxWidth="xl" disableGutters sx={{ height: { md: "100%" }, maxWidth: "100%" }}>
          <Stack spacing={2} sx={{ height: { md: "100%" } }}>
            {error && <Alert severity="error">{error}</Alert>}

            {document?.expired && (
              <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
                <ErrorOutlineIcon color="warning" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  This link has expired
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please contact your administrator to request a new signing link.
                </Typography>
              </Paper>
            )}

            {document?.cancelled && (
              <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
                <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Agreement cancelled
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This agreement is no longer available for signing.
                </Typography>
              </Paper>
            )}

            {document?.emailVerificationRequired && !emailVerified && !document?.expired && !document?.cancelled && (
              <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, maxWidth: 480, mx: "auto", width: "100%" }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Verify your identity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hi {document.recipientName}, enter the email address this agreement was sent to.
                  </Typography>
                  <TextField
                    label="Email address"
                    size="small"
                    fullWidth
                    type="email"
                    autoComplete="email"
                    value={verifyEmail}
                    onChange={(e) => setVerifyEmail(e.target.value)}
                  />
                  <Button variant="contained" fullWidth onClick={handleVerifyEmail} disabled={!verifyEmail}>
                    Continue
                  </Button>
                </Stack>
              </Paper>
            )}

            {emailVerified && !document?.expired && !document?.cancelled && (
              <Grid
                container
                spacing={{ xs: 1.5, sm: 2, md: 3 }}
                sx={{
                  flex: { md: 1 },
                  minHeight: { md: 0 },
                  alignItems: { md: "flex-start" },
                  width: "100%",
                  maxWidth: "100%",
                  m: 0,
                }}
              >
                <Grid
                  item
                  xs={12}
                  md={signed ? 8 : 7}
                  lg={signed ? 8 : 8}
                  sx={{ display: "flex", width: "100%", maxWidth: "100%", px: { xs: 0, sm: 0.5 } }}
                >
                  {documentPanel}
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={signed ? 4 : 5}
                  lg={signed ? 4 : 4}
                  sx={{ width: "100%", maxWidth: "100%", px: { xs: 0, sm: 0.5 } }}
                >
                  {signaturePanel}
                </Grid>
              </Grid>
            )}
          </Stack>
        </Container>
      </Box>

      {showMobileSignBar && (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: theme.zIndex.appBar + 1,
            px: 1.5,
            pt: 1.25,
            pb: "calc(12px + env(safe-area-inset-bottom, 0px))",
            borderTop: 1,
            borderColor: "divider",
            backgroundColor: "background.paper",
            boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
          }}
        >
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!consent || !signatureData || submitting}
            onClick={handleSign}
          >
            {submitting ? "Submitting…" : "Complete signing"}
          </Button>
          {!signatureData && (
            <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={0.75}>
              Add your signature above to continue
            </Typography>
          )}
        </Box>
      )}

      {!showMobileSignBar && (
      <Box
        component="footer"
        sx={{
          py: 1.5,
          px: 2,
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
          Powered by SkyCare Portal · Secure electronic signing
        </Typography>
      </Box>
      )}

      <ReferenceMaterialViewerDialog
        open={selectedReferenceMaterial != null}
        onClose={handleCloseReferenceMaterialViewer}
        material={
          selectedReferenceMaterial
            ? {
                title: selectedReferenceMaterial.title,
                mimeType: selectedReferenceMaterial.mimeType,
                originalFilename: selectedReferenceMaterial.originalFilename,
              }
            : null
        }
        fileUrl={viewingMaterialUrl}
        loading={viewingMaterialLoading}
        error={viewingMaterialError}
        onDownload={
          selectedReferenceMaterial
            ? () => handleDownloadReferenceMaterial(selectedReferenceMaterial)
            : undefined
        }
      />
    </Box>
  );
};

export default PublicSignPage;
