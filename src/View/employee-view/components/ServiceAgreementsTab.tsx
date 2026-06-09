import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import SendIcon from "@mui/icons-material/Send";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  AgreementInstance,
  cancelAgreementInstance,
  deleteAgreementInstance,
  downloadAgreementPdf,
  exportAgreementHistory,
  exportInstanceEvents,
  fetchAgreementPdfBlob,
  fetchApplicableTemplates,
  fetchInstancesByRecipient,
  resendAgreementInstance,
} from "../../../slices/agreementInstanceSlice/agreementInstance";
import SendAgreementWizard from "./SendAgreementWizard";
import AgreementInstanceManageDialog from "./AgreementInstanceManageDialog";
import SignedAgreementPdfViewer from "./SignedAgreementPdfViewer";
import { useConfirmationModalContext } from "../../../context/DialogContext";
import { ConfirmationType } from "../../../types/types";
import { isUnspecifiedCareGiverType } from "../../../constants";

interface ServiceAgreementsTabProps {
  recipientType: "WORKER" | "CLIENT";
  recipientId: string;
  recipientLabel?: string;
  careGiverType?: string | null;
}

const sendMethodLabel = (method?: string) => {
  switch (method) {
    case "SYSTEM_EMAIL":
      return "Email";
    case "MANUAL_LINK":
      return "Manual link";
    case "MANUAL_PDF":
      return "Manual PDF";
    default:
      return "—";
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case "SIGNED":
    case "ADMIN_SIGNED":
      return "success";
    case "SENT":
    case "VIEWED":
      return "info";
    case "DRAFT":
      return "warning";
    case "CANCELLED":
    case "EXPIRED":
      return "error";
    default:
      return "default";
  }
};

const dataGridSx = {
  border: "none",
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "white",
  },
  "& .MuiDataGrid-columnHeader": {
    backgroundColor: "white",
  },
  "& .MuiDataGrid-columnSeparator": {
    display: "none",
  },
  "& .MuiDataGrid-cell": {
    display: "flex",
    alignItems: "center",
  },
};

const ServiceAgreementsTab: React.FC<ServiceAgreementsTabProps> = ({
  recipientType,
  recipientId,
  recipientLabel,
  careGiverType,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { showConfirmation } = useConfirmationModalContext();
  const { applicableTemplates, instances } = useAppSelector(
    (state) => state.agreementInstances
  );
  const auth = useAppSelector((state) => state.auth);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | undefined>();
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfInstance, setPdfInstance] = useState<AgreementInstance | null>(null);
  const [manageInstance, setManageInstance] = useState<AgreementInstance | null>(null);

  const workerTypeUnspecified =
    recipientType === "WORKER" && isUnspecifiedCareGiverType(careGiverType);

  const noTemplatesMessage = workerTypeUnspecified
    ? "Set the worker's care giver type (Casual, Contractor, Full-time, or Part-time) before sending a service agreement. Not specified is only a profile status."
    : "No published agreement templates are assigned for this profile.";

  const publishedVersionFor = (instance: AgreementInstance) =>
    applicableTemplates.find((t) => t.templateKey === instance.templateKey)?.publishedVersionNumber;

  const hasNewerVersionAvailable = (instance: AgreementInstance) => {
    const published = publishedVersionFor(instance);
    return published != null && published > instance.versionNumber;
  };

  const canManageInstance = (instance: AgreementInstance) => {
    if (instance.status !== "SIGNED") return true;
    return hasNewerVersionAvailable(instance);
  };

  const canViewPdf = (instance: AgreementInstance) =>
    instance.status === "SIGNED" || instance.hasSignedPdf || instance.hasAdminSignature;

  useEffect(() => {
    if (recipientId) {
      dispatch(fetchApplicableTemplates({ recipientType, recipientId }));
      dispatch(fetchInstancesByRecipient({ recipientType, recipientId }));
    }
  }, [dispatch, recipientType, recipientId]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const openPdfViewer = async (instance: AgreementInstance) => {
    try {
      const blob = await fetchAgreementPdfBlob(instance.id);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfInstance(instance);
      setPdfViewerOpen(true);
    } catch {
      /* snackbar from slice */
    }
  };

  const handleDownload = (instance: AgreementInstance) => {
    dispatch(
      downloadAgreementPdf({
        instanceId: instance.id,
        fileName: `${instance.templateKey}-${instance.id}.pdf`,
      })
    );
  };

  const handleResend = (instance: AgreementInstance) => {
    dispatch(
      resendAgreementInstance({
        instanceId: instance.id,
        actorId: auth.userInfo?.userID || "",
      })
    ).then(() => {
      dispatch(fetchInstancesByRecipient({ recipientType, recipientId }));
    });
  };

  const handleCancel = (instance: AgreementInstance) => {
    dispatch(
      cancelAgreementInstance({
        instanceId: instance.id,
        actorId: auth.userInfo?.userID || "",
      })
    ).then(() => {
      dispatch(fetchInstancesByRecipient({ recipientType, recipientId }));
    });
  };

  const handleDelete = (instance: AgreementInstance) => {
    showConfirmation(
      "Delete agreement",
      "Permanently delete this cancelled agreement? This action cannot be undone.",
      "accept" as ConfirmationType,
      () =>
        dispatch(
          deleteAgreementInstance({
            instanceId: instance.id,
            actorId: auth.userInfo?.userID || "",
          })
        ),
      "Delete",
      "Cancel"
    );
  };

  const renderActions = (row: AgreementInstance) => (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.25,
      }}
    >
      <Tooltip title="PDF">
        <IconButton size="small" onClick={() => openPdfViewer(row)} disabled={!canViewPdf(row)}>
          <PictureAsPdfOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {row.canResend && (
        <Tooltip title="Resend">
          <IconButton size="small" onClick={() => handleResend(row)}>
            <ReplayIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {row.canCancel && (
        <Tooltip title="Cancel">
          <IconButton size="small" onClick={() => handleCancel(row)}>
            <CancelOutlinedIcon fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
      )}
      {(row.canDelete || row.status === "CANCELLED") && (
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => handleDelete(row)}>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
      )}
      {canManageInstance(row) && (
        <Tooltip title="Manage (send, upload, status)">
          <IconButton size="small" onClick={() => setManageInstance(row)}>
            <TuneOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Export audit log">
        <IconButton size="small" onClick={() => exportInstanceEvents(row.id)}>
          <FileDownloadOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const columns: GridColDef[] = [
    { field: "templateName", headerName: "Agreement", flex: 1, minWidth: 160 },
    {
      field: "versionNumber",
      headerName: "Version",
      width: 80,
      align: "center",
      headerAlign: "center",
      valueGetter: (_v, row) => `v${row.versionNumber}`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          color={
            statusColor(params.value as string) as
              | "success"
              | "warning"
              | "info"
              | "error"
              | "default"
          }
          variant="outlined"
        />
      ),
    },
    {
      field: "signedAt",
      headerName: "Signed",
      width: 100,
      align: "center",
      headerAlign: "center",
      valueGetter: (_v, row) =>
        row.signedAt
          ? new Date(row.signedAt).toLocaleDateString()
          : row.hasAdminSignature && row.updatedAt
            ? new Date(row.updatedAt).toLocaleDateString()
            : "—",
    },
    {
      field: "sentAt",
      headerName: "Sent",
      width: 100,
      align: "center",
      headerAlign: "center",
      valueGetter: (_v, row) =>
        row.sentAt ? new Date(row.sentAt).toLocaleDateString() : "—",
    },
    {
      field: "sendMethod",
      headerName: "Delivery",
      width: 110,
      align: "center",
      headerAlign: "center",
      valueGetter: (_v, row) => sendMethodLabel(row.sendMethod),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => renderActions(params.row as AgreementInstance),
    },
  ];

  const openWizard = (templateKey?: string) => {
    setSelectedTemplateKey(templateKey);
    setWizardOpen(true);
  };

  return (
    <Stack spacing={2} sx={{ p: 1, overflow: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={600} color={theme.palette.primary.main}>
            Service Agreements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {recipientLabel
              ? `Manage agreements for ${recipientLabel}`
              : "Send and download service agreements"}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={() => exportAgreementHistory(recipientType, recipientId)}
            disabled={instances.length === 0}
          >
            Export history
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<SendIcon />}
            onClick={() => openWizard()}
            disabled={applicableTemplates.length === 0}
          >
            Send Agreement
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
          <DescriptionOutlinedIcon color="action" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={600}>
            Required agreements
          </Typography>
        </Stack>
        {applicableTemplates.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {noTemplatesMessage}
          </Typography>
        ) : (
          <Stack spacing={1}>
            {applicableTemplates.map((template) => (
              <Stack
                key={template.templateId}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.default,
                }}
              >
                <Stack spacing={0.25}>
                  <Typography variant="body2" fontWeight={600}>
                    {template.displayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {template.templateKey} · v{template.publishedVersionNumber}
                    {template.careGiverType ? ` · ${template.careGiverType}` : ""}
                  </Typography>
                </Stack>
                <Button size="small" variant="outlined" onClick={() => openWizard(template.templateKey)}>
                  Send
                </Button>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Agreement history
        </Typography>
        <Box sx={{ width: "100%" }}>
          <DataGrid
            rows={instances}
            columns={columns}
            getRowId={(row) => row.id}
            density="compact"
            autoHeight
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooter={instances.length <= 5}
            pageSizeOptions={[5, 10]}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            sx={dataGridSx}
          />
        </Box>
      </Paper>

      <SendAgreementWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        recipientType={recipientType}
        recipientId={recipientId}
        templateKey={selectedTemplateKey}
        adminEmployeeId={auth.userInfo?.userID || ""}
        onComplete={() => {
          dispatch(fetchInstancesByRecipient({ recipientType, recipientId }));
          setWizardOpen(false);
        }}
      />

      <AgreementInstanceManageDialog
        open={Boolean(manageInstance)}
        onClose={() => setManageInstance(null)}
        instance={manageInstance}
        actorId={auth.userInfo?.userID || ""}
        onUpdated={() => {
          dispatch(fetchInstancesByRecipient({ recipientType, recipientId })).then((action) => {
            if (
              fetchInstancesByRecipient.fulfilled.match(action) &&
              manageInstance
            ) {
              const refreshed = action.payload.find((i) => i.id === manageInstance.id);
              if (refreshed) setManageInstance(refreshed);
            }
          });
        }}
      />

      <SignedAgreementPdfViewer
        open={pdfViewerOpen}
        onClose={() => {
          setPdfViewerOpen(false);
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
          }
        }}
        pdfUrl={pdfUrl}
        title={pdfInstance?.templateName}
        onDownload={pdfInstance ? () => handleDownload(pdfInstance) : undefined}
      />
    </Stack>
  );
};

export default ServiceAgreementsTab;
