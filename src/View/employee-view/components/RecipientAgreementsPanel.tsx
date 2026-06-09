import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  AgreementInstance,
  downloadAgreementPdf,
  fetchAgreementPdfBlob,
  fetchInstancesByRecipient,
} from "../../../slices/agreementInstanceSlice/agreementInstance";
import { fetchSingleCareGiverByEmployeeID } from "../../../slices/careGiverSlice/careGiver";
import SignedAgreementPdfViewer from "./SignedAgreementPdfViewer";

interface RecipientAgreementsPanelProps {
  recipientType: "WORKER" | "CLIENT";
  /** Care giver ID or client ID when known; otherwise resolved from auth user. */
  recipientId?: string;
}

const statusColor = (status: string) => {
  switch (status) {
    case "SIGNED":
      return "success";
    case "SENT":
    case "VIEWED":
      return "info";
    case "EXPIRED":
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

const canViewDocument = (instance: AgreementInstance) =>
  instance.status === "SIGNED" || instance.hasSignedPdf || instance.hasAdminSignature;

const RecipientAgreementsPanel: React.FC<RecipientAgreementsPanelProps> = ({
  recipientType,
  recipientId: recipientIdProp,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const { instances } = useAppSelector((state) => state.agreementInstances);
  const careGiver = useAppSelector((state) => state.careGivers.selectedCareGiver);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfInstance, setPdfInstance] = useState<AgreementInstance | null>(null);

  const resolvedRecipientId = useMemo(() => {
    if (recipientIdProp) {
      return recipientIdProp;
    }
    if (recipientType === "CLIENT") {
      return auth.userInfo?.userID || "";
    }
    return careGiver?.careGiverID || "";
  }, [recipientIdProp, recipientType, auth.userInfo?.userID, careGiver?.careGiverID]);

  useEffect(() => {
    if (recipientType === "WORKER" && !recipientIdProp && auth.userInfo?.userID) {
      dispatch(fetchSingleCareGiverByEmployeeID(auth.userInfo.userID));
    }
  }, [dispatch, recipientType, recipientIdProp, auth.userInfo?.userID]);

  useEffect(() => {
    if (resolvedRecipientId) {
      dispatch(fetchInstancesByRecipient({ recipientType, recipientId: resolvedRecipientId }));
    }
  }, [dispatch, recipientType, resolvedRecipientId]);

  useEffect(
    () => () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    },
    [pdfUrl]
  );

  const visibleInstances = useMemo(
    () =>
      instances.filter(
        (instance) =>
          instance.status === "SIGNED" ||
          instance.status === "SENT" ||
          instance.status === "VIEWED" ||
          instance.status === "EXPIRED"
      ),
    [instances]
  );

  const signedInstances = useMemo(
    () => visibleInstances.filter((instance) => instance.status === "SIGNED"),
    [visibleInstances]
  );

  const openPdfViewer = async (instance: AgreementInstance) => {
    try {
      const blob = await fetchAgreementPdfBlob(instance.id);
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(URL.createObjectURL(blob));
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

  const columns: GridColDef<AgreementInstance>[] = [
    { field: "templateName", headerName: "Agreement", flex: 1.2, minWidth: 180 },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          color={
            statusColor(params.value as string) as
              | "success"
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
      width: 120,
      valueGetter: (_v, row) =>
        row.signedAt ? new Date(row.signedAt).toLocaleDateString() : "—",
    },
    {
      field: "sentAt",
      headerName: "Sent",
      width: 120,
      valueGetter: (_v, row) =>
        row.sentAt ? new Date(row.sentAt).toLocaleDateString() : "—",
    },
    {
      field: "actions",
      headerName: "Document",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const row = params.row as AgreementInstance;
        if (!canViewDocument(row)) {
          return "—";
        }
        return (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={row.status === "SIGNED" ? "View signed PDF" : "View PDF"}>
              <IconButton size="small" onClick={() => openPdfViewer(row)}>
                <PictureAsPdfOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {row.status === "SIGNED" && (
              <Tooltip title="Download">
                <IconButton size="small" onClick={() => handleDownload(row)}>
                  <DownloadOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <Stack spacing={2} sx={{ p: 1, height: "100%", overflow: "auto" }}>
      <Stack spacing={0.5}>
        <Typography variant="h6" fontWeight={600} color={theme.palette.primary.main}>
          My service agreements
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and download agreements that have been sent to you.
        </Typography>
      </Stack>

      {signedInstances.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <DescriptionOutlinedIcon color="success" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Signed agreements ({signedInstances.length})
            </Typography>
          </Stack>
          <Stack spacing={1}>
            {signedInstances.map((instance) => (
              <Stack
                key={instance.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {instance.templateName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Signed{" "}
                    {instance.signedAt
                      ? new Date(instance.signedAt).toLocaleDateString()
                      : "—"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="View signed PDF">
                    <IconButton size="small" onClick={() => openPdfViewer(instance)}>
                      <PictureAsPdfOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton size="small" onClick={() => handleDownload(instance)}>
                      <DownloadOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          All agreements
        </Typography>
        <Box sx={{ width: "100%" }}>
          <DataGrid
            rows={visibleInstances}
            columns={columns}
            getRowId={(row) => row.id}
            autoHeight
            density="compact"
            disableRowSelectionOnClick
            hideFooter={visibleInstances.length <= 5}
            pageSizeOptions={[5, 10]}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            sx={{ border: "none" }}
          />
        </Box>
      </Paper>

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
        large
        onDownload={
          pdfInstance?.status === "SIGNED"
            ? () => handleDownload(pdfInstance)
            : undefined
        }
      />
    </Stack>
  );
};

export default RecipientAgreementsPanel;
