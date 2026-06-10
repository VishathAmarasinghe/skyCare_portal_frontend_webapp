import React, { useMemo, useState } from "react";
import {
  Chip,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import {
  DocumentComplianceInsights,
  DocumentComplianceItem,
  DocumentIssueType,
} from "../../../../slices/dashboardSlice/dashboard";
import { getCareGiverTypeLabel } from "../../../../constants";
import ExpiryTimelineChart from "./ExpiryTimelineChart";
import ExpiringByTypeChart from "./ExpiringByTypeChart";
import KpiCard from "./KpiCard";

const ISSUE_LABELS: Record<DocumentIssueType, string> = {
  EXPIRED: "Expired",
  EXPIRING: "Expiring soon",
  MISSING_REQUIRED: "Missing required",
  PENDING: "Pending review",
  NO_EXPIRY_DATE: "No expiry date",
};

const ISSUE_COLORS: Record<DocumentIssueType, "error" | "warning" | "info" | "default"> = {
  EXPIRED: "error",
  EXPIRING: "warning",
  MISSING_REQUIRED: "error",
  PENDING: "info",
  NO_EXPIRY_DATE: "warning",
};

type FilterTab =
  | "ALL"
  | "EXPIRED"
  | "EXPIRING"
  | "MISSING_REQUIRED"
  | "PENDING"
  | "NO_EXPIRY_DATE";

interface DocumentComplianceSectionProps {
  documents: DocumentComplianceInsights;
}

const DocumentComplianceSection: React.FC<DocumentComplianceSectionProps> = ({
  documents,
}) => {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<FilterTab>("ALL");
  const summary = documents.summary;

  const filteredItems = useMemo(() => {
    if (filterTab === "ALL") {
      return documents.items;
    }
    if (filterTab === "EXPIRING") {
      return documents.items.filter((item) => item.issueType === "EXPIRING");
    }
    return documents.items.filter((item) => item.issueType === filterTab);
  }, [documents.items, filterTab]);

  const openEmployeeDocuments = (employeeId: string) => {
    navigate(`/Employees/employeeInfo?employeeID=${employeeId}&tab=2`);
  };

  const columns: GridColDef<DocumentComplianceItem>[] = [
    {
      field: "employeeName",
      headerName: "Worker",
      flex: 1.2,
      minWidth: 160,
    },
    {
      field: "careGiverType",
      headerName: "Type",
      flex: 0.8,
      minWidth: 110,
      valueGetter: (_, row) => getCareGiverTypeLabel(row.careGiverType),
    },
    {
      field: "documentTypeName",
      headerName: "Document",
      flex: 1.2,
      minWidth: 160,
    },
    {
      field: "issueType",
      headerName: "Issue",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <Chip
          size="small"
          label={ISSUE_LABELS[params.value as DocumentIssueType]}
          color={ISSUE_COLORS[params.value as DocumentIssueType]}
        />
      ),
    },
    {
      field: "expDate",
      headerName: "Expiry",
      flex: 0.7,
      minWidth: 110,
      valueGetter: (_, row) => row.expDate || "—",
    },
    {
      field: "daysUntilExpiry",
      headerName: "Days",
      flex: 0.5,
      minWidth: 80,
      valueGetter: (_, row) =>
        row.daysUntilExpiry != null ? row.daysUntilExpiry : "—",
    },
  ];

  return (
    <Stack gap={2}>
      <Typography variant="h6" fontWeight={700}>
        Worker document compliance
      </Typography>

      <Stack direction="row" gap={2} flexWrap="wrap">
        <KpiCard label="Expired" value={summary.expired} accent="error.main" />
        <KpiCard
          label="Expiring in 7 days"
          value={summary.expiringIn7Days}
          accent="warning.main"
        />
        <KpiCard
          label="Expiring in 30 days"
          value={summary.expiringIn30Days}
          accent="warning.dark"
        />
        <KpiCard
          label="Missing required"
          value={summary.missingRequired}
          accent="error.dark"
        />
        <KpiCard label="Pending review" value={summary.pending} accent="info.main" />
        <KpiCard
          label="No expiry date"
          value={summary.missingExpiryDate}
          accent="grey.500"
        />
      </Stack>

      <Stack direction="row" gap={2} sx={{ minHeight: 420, alignItems: "stretch" }}>
        <Paper sx={{ p: 2.5, flex: 1, borderRadius: 2, overflow: "hidden" }} elevation={0} variant="outlined">
          <ExpiryTimelineChart expiryTimelineByWeek={documents.expiryTimelineByWeek} />
        </Paper>
        <Paper sx={{ p: 2.5, flex: 1, borderRadius: 2, overflow: "hidden" }} elevation={0} variant="outlined">
          <ExpiringByTypeChart expiringByDocumentType={documents.expiringByDocumentType} />
        </Paper>
      </Stack>

      <Paper sx={{ p: 2, borderRadius: 2 }} elevation={0} variant="outlined">
        <Typography variant="subtitle1" fontWeight={700} mb={1}>
          Needs attention now
        </Typography>
        {documents.attentionItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            All worker documents are compliant.
          </Typography>
        ) : (
          <Stack gap={1}>
            {documents.attentionItems.map((item) => (
              <Stack
                key={`${item.careGiverId}-${item.documentTypeId}`}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "grey.50",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={() => openEmployeeDocuments(item.employeeId)}
              >
                <Stack>
                  <Typography variant="body2" fontWeight={600}>
                    {item.employeeName} — {item.documentTypeName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getCareGiverTypeLabel(item.careGiverType)}
                    {item.daysUntilExpiry != null
                      ? ` · ${item.daysUntilExpiry} day(s)`
                      : ""}
                  </Typography>
                </Stack>
                <Chip
                  size="small"
                  label={ISSUE_LABELS[item.issueType]}
                  color={ISSUE_COLORS[item.issueType]}
                />
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 2 }} elevation={0} variant="outlined">
        <Tabs
          value={filterTab}
          onChange={(_, value: FilterTab) => setFilterTab(value)}
          sx={{ mb: 2 }}
          variant="scrollable"
        >
          <Tab label={`All (${documents.items.length})`} value="ALL" />
          <Tab label={`Expired (${summary.expired})`} value="EXPIRED" />
          <Tab
            label={`Expiring (${documents.items.filter((i) => i.issueType === "EXPIRING").length})`}
            value="EXPIRING"
          />
          <Tab
            label={`Missing (${summary.missingRequired})`}
            value="MISSING_REQUIRED"
          />
          <Tab label={`Pending (${summary.pending})`} value="PENDING" />
          <Tab
            label={`No expiry (${summary.missingExpiryDate})`}
            value="NO_EXPIRY_DATE"
          />
        </Tabs>

        <DataGrid
          rows={filteredItems}
          columns={columns}
          getRowId={(row) => `${row.careGiverId}-${row.documentTypeId}`}
          autoHeight
          disableRowSelectionOnClick
          onRowClick={(params) => openEmployeeDocuments(params.row.employeeId)}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            cursor: "pointer",
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "primary.main",
              color: "primary.contrastText",
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "primary.main",
              color: "primary.contrastText",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              color: "primary.contrastText",
              fontWeight: 700,
            },
            "& .MuiDataGrid-sortIcon": {
              color: "primary.contrastText",
            },
            "& .MuiDataGrid-iconButtonContainer .MuiIconButton-root": {
              color: "primary.contrastText",
            },
            "& .MuiDataGrid-columnSeparator": {
              color: "rgba(255,255,255,0.35)",
            },
          }}
        />
      </Paper>
    </Stack>
  );
};

export default DocumentComplianceSection;
