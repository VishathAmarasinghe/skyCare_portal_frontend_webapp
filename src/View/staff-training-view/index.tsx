import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "@slices/store";
import RegisterPageHeader from "../common/RegisterPageHeader";
import RegisterExportToolbar from "../common/RegisterExportToolbar";
import StaffTrainingFilterBar from "./components/StaffTrainingFilterBar";
import StaffTrainingModal from "./modal/StaffTrainingModal";
import {
  deleteStaffTrainingRecord,
  downloadStaffTrainingCertificate,
  exportStaffTrainingCsv,
  fetchStaffTrainingRecords,
  StaffTrainingFilters,
  StaffTrainingRecord,
} from "@slices/staffTrainingSlice/staffTraining";
import {
  fetchTrainingCourses,
  fetchTrainingProviders,
} from "@slices/complianceLookupSlice/complianceLookup";
import { fetchOrganizationSetting } from "@slices/organizationSlice/organization";
import { getRequesterParams, isAdminUser } from "../../utils/registerAccess";
import { exportRowsToPdf } from "../../utils/exportRegisterPdf";
import { useConfirmationModalContext } from "../../context/DialogContext";
import { ConfirmationType } from "../../types/types";

const boolLabel = (value?: boolean) => (value ? "Yes" : "No");

const ellipsisCell = (value: unknown) => (
  <Tooltip title={String(value ?? "")} placement="top-start">
    <Typography variant="body2" noWrap sx={{ width: "100%" }}>
      {value ? String(value) : "—"}
    </Typography>
  </Tooltip>
);

const StaffTrainingView = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const { records, loading } = useAppSelector((state) => state.staffTraining);
  const lookup = useAppSelector((state) => state.complianceLookup);
  const organization = useAppSelector((state) => state.organization.organization);
  const isAdmin = isAdminUser(auth.roles);
  const requester = getRequesterParams(auth.roles, auth.userInfo?.userID);

  const [filters, setFilters] = useState<StaffTrainingFilters>({
    expiryStatus: "ALL",
    ...requester,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<StaffTrainingRecord | null>(null);

  const load = useCallback(() => {
    dispatch(fetchStaffTrainingRecords({ ...filters, ...requester }));
  }, [dispatch, filters, requester.requesterEmployeeId, requester.requesterRole]);

  const { showConfirmation } = useConfirmationModalContext();

  const confirmDeleteRecord = useCallback(
    (record: StaffTrainingRecord) => {
      showConfirmation(
        "Delete training record",
        `Are you sure you want to delete the training record for "${record.employeeName || "this worker"}"? This action cannot be undone.`,
        "accept" as ConfirmationType,
        () => {
          dispatch(
            deleteStaffTrainingRecord({
              recordID: record.recordID!,
              requesterRole: requester.requesterRole,
            })
          ).then(load);
        },
        "Delete",
        "Cancel"
      );
    },
    [dispatch, load, requester.requesterRole, showConfirmation]
  );

  useEffect(() => {
    dispatch(fetchTrainingCourses());
    dispatch(fetchTrainingProviders());
    dispatch(fetchOrganizationSetting());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "employeeName",
        headerName: "Staff Name",
        width: 120,
        renderCell: (params) => ellipsisCell(params.value),
      },
      {
        field: "position",
        headerName: "Position",
        width: 100,
        renderCell: (params) => ellipsisCell(params.value),
      },
      {
        field: "trainingCourse",
        headerName: "Training Course",
        flex: 1,
        minWidth: 130,
        renderCell: (params) => ellipsisCell(params.value),
      },
      {
        field: "provider",
        headerName: "Provider",
        width: 100,
        renderCell: (params) => ellipsisCell(params.value),
      },
      { field: "dateCompleted", headerName: "Date Completed", width: 108 },
      { field: "expiryDate", headerName: "Expiry Date", width: 100 },
      {
        field: "certificateFiled",
        headerName: "Certificate Filed",
        width: 108,
        valueGetter: (v) => boolLabel(v),
      },
      {
        field: "competencyAssessed",
        headerName: "Competency Assessed",
        width: 128,
        valueGetter: (v) => boolLabel(v),
      },
      {
        field: "assessorName",
        headerName: "Assessor",
        width: 110,
        renderCell: (params) => ellipsisCell(params.value),
      },
      {
        field: "comments",
        headerName: "Comments",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => ellipsisCell(params.value),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: isAdmin ? 118 : 56,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              gap: 0.25,
            }}
          >
            {params.row.hasCertificate && (
              <IconButton
                size="small"
                onClick={() =>
                  downloadStaffTrainingCertificate(params.row.recordID, requester as Record<string, string>)
                }
              >
                <DownloadOutlinedIcon fontSize="small" />
              </IconButton>
            )}
            {isAdmin && (
              <>
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditRecord(params.row);
                    setModalOpen(true);
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => confirmDeleteRecord(params.row)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        ),
      },
    ],
    [confirmDeleteRecord, isAdmin, requester]
  );

  const pdfColumns = [
    { header: "Staff Name", key: "employeeName" },
    { header: "Position", key: "position" },
    { header: "Training Course", key: "trainingCourse" },
    { header: "Provider", key: "provider" },
    { header: "Date Completed", key: "dateCompleted" },
    { header: "Expiry Date", key: "expiryDate" },
    { header: "Certificate Filed", key: "certificateFiled" },
    { header: "Competency Assessed", key: "competencyAssessed" },
    { header: "Assessor", key: "assessorName" },
    { header: "Comments", key: "comments" },
  ];

  const pdfRows = records.map((row) => ({
    ...row,
    certificateFiled: boolLabel(row.certificateFiled),
    competencyAssessed: boolLabel(row.competencyAssessed),
  }));

  return (
    <Stack sx={{ p: 2, height: "100%", overflow: "hidden", maxWidth: "100%" }}>
      <RegisterPageHeader
        title="Staff Training Register"
        subtitle="Track mandatory training, certificates, and competency assessments"
        showAdd={isAdmin}
        onAdd={() => {
          setEditRecord(null);
          setModalOpen(true);
        }}
      />
      <StaffTrainingFilterBar
        filters={filters}
        onChange={setFilters}
        onApply={load}
        onReset={() => {
          setFilters({ expiryStatus: "ALL", ...requester });
          setTimeout(load, 0);
        }}
        courses={lookup.trainingCourses}
        providers={lookup.trainingProviders}
        showStaffFilter={isAdmin}
      />
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          border: "1px solid",
          borderColor: "divider",
          p: 1,
          minHeight: 420,
          overflow: "hidden",
        }}
      >
        <Box sx={{ height: "100%", width: "100%" }}>
          <DataGrid
            rows={records}
            columns={columns}
            getRowId={(r) => r.recordID || ""}
            loading={loading}
            density="compact"
            disableRowSelectionOnClick
            slots={{
              toolbar: () => (
                <RegisterExportToolbar
                  onExportCsv={() => exportStaffTrainingCsv({ ...filters, ...requester })}
                  onExportPdf={() =>
                    exportRowsToPdf("Staff Training Register", pdfColumns, pdfRows as unknown as Record<string, unknown>[], {
                      companyName: organization?.name,
                      logoUrl: organization?.logoUrl,
                    })
                  }
                />
              ),
            }}
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
              },
            }}
          />
        </Box>
      </Paper>
      <StaffTrainingModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditRecord(null);
        }}
        record={editRecord}
        onSaved={load}
      />
    </Stack>
  );
};

export default StaffTrainingView;
