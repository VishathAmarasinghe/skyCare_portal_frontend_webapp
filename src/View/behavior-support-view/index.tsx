import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, IconButton, Paper, Stack, Tab, Tabs } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AppConfig } from "@config/config";
import { useAppDispatch, useAppSelector } from "@slices/store";
import RegisterPageHeader from "../common/RegisterPageHeader";
import RegisterExportToolbar from "../common/RegisterExportToolbar";
import BehaviorSupportFilterBar from "./components/BehaviorSupportFilterBar";
import BehaviourDataModal from "./modal/BehaviourDataModal";
import RpRegisterModal from "./modal/RpRegisterModal";
import RpEvidenceModal from "./modal/RpEvidenceModal";
import {
  BehaviorSupportFilters,
  BehaviourDataRecord,
  deleteBehaviourData,
  deleteRpEvidence,
  deleteRpRegister,
  exportBehaviorCsv,
  fetchBehaviourData,
  fetchRpEvidence,
  fetchRpRegisters,
  RpEvidenceRecord,
  RpRegisterRecord,
} from "@slices/behaviorSupportSlice/behaviorSupport";
import {
  fetchAuthBodies,
  fetchAuthStatuses,
  fetchIntensities,
  fetchRpTypes,
} from "@slices/complianceLookupSlice/complianceLookup";
import { fetchOrganizationSetting } from "@slices/organizationSlice/organization";
import { getRequesterParams, isAdminUser, isCareGiverUser } from "../../utils/registerAccess";
import { exportRowsToPdf } from "../../utils/exportRegisterPdf";
import { useConfirmationModalContext } from "../../context/DialogContext";
import { ConfirmationType } from "../../types/types";

const BehaviorSupportView = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const bs = useAppSelector((state) => state.behaviorSupport);
  const lookup = useAppSelector((state) => state.complianceLookup);
  const organization = useAppSelector((state) => state.organization.organization);
  const isAdmin = isAdminUser(auth.roles);
  const isCg = isCareGiverUser(auth.roles);
  const requester = getRequesterParams(auth.roles, auth.userInfo?.userID);
  const { showConfirmation } = useConfirmationModalContext();

  const confirmDelete = (title: string, message: string, onConfirm: () => void) => {
    showConfirmation(
      title,
      message,
      "accept" as ConfirmationType,
      onConfirm,
      "Delete",
      "Cancel"
    );
  };

  const [tab, setTab] = useState(isCg && !isAdmin ? 1 : 0);
  const [filters, setFilters] = useState<BehaviorSupportFilters>({ ...requester });
  const [bdModal, setBdModal] = useState(false);
  const [rpModal, setRpModal] = useState(false);
  const [evModal, setEvModal] = useState(false);
  const [editBd, setEditBd] = useState<BehaviourDataRecord | null>(null);
  const [editRp, setEditRp] = useState<RpRegisterRecord | null>(null);
  const [editEv, setEditEv] = useState<RpEvidenceRecord | null>(null);

  const tabKey = tab === 0 ? "rp" : tab === 1 ? "behaviour" : "evidence";

  const load = useCallback(() => {
    const f = { ...filters, ...requester };
    if (tab === 0) dispatch(fetchRpRegisters(f));
    else if (tab === 1) dispatch(fetchBehaviourData(f));
    else dispatch(fetchRpEvidence(f));
  }, [dispatch, filters, tab, requester.requesterEmployeeId, requester.requesterRole]);

  useEffect(() => {
    dispatch(fetchRpTypes());
    dispatch(fetchAuthStatuses());
    dispatch(fetchAuthBodies());
    dispatch(fetchIntensities());
    dispatch(fetchOrganizationSetting());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const adminActions = (onEdit: () => void, onDelete: () => void) =>
    isAdmin ? (
      <Stack direction="row">
        <IconButton size="small" onClick={onEdit}><EditOutlinedIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={onDelete}><DeleteOutlineIcon fontSize="small" /></IconButton>
      </Stack>
    ) : null;

  const cgBdActions = (row: BehaviourDataRecord, onEdit: () => void) => {
    if (isAdmin) {
      return adminActions(onEdit, () =>
        confirmDelete(
          "Delete behaviour record",
          "Are you sure you want to delete this behaviour data record? This action cannot be undone.",
          () => dispatch(deleteBehaviourData({ id: row.recordID!, requesterRole: requester.requesterRole })).then(load)
        )
      );
    }
    if (isCg && row.staffEmployeeID === requester.requesterEmployeeId) {
      return <IconButton size="small" onClick={onEdit}><EditOutlinedIcon fontSize="small" /></IconButton>;
    }
    return null;
  };

  const rpColumns: GridColDef[] = useMemo(() => [
    { field: "participantName", headerName: "Participant", flex: 1, minWidth: 140 },
    { field: "ndisNumber", headerName: "NDIS", width: 110 },
    { field: "restrictivePracticeType", headerName: "RP Type", width: 140 },
    { field: "authorisationStatus", headerName: "Status", width: 120 },
    { field: "reviewDate", headerName: "Review", width: 110 },
    { field: "practitionerName", headerName: "Practitioner", width: 130 },
    {
      field: "actions", headerName: "", width: 90, sortable: false,
      renderCell: (p) => adminActions(() => { setEditRp(p.row); setRpModal(true); },
        () => dispatch(deleteRpRegister({ id: p.row.registerID, requesterRole: requester.requesterRole })).then(load)),
    },
  ], [dispatch, isAdmin, load, requester.requesterRole]);

  const bdColumns: GridColDef[] = useMemo(() => [
    { field: "recordDate", headerName: "Date", width: 100 },
    { field: "recordTime", headerName: "Time", width: 80 },
    { field: "participantName", headerName: "Participant", flex: 1, minWidth: 130 },
    { field: "behaviourObserved", headerName: "Behaviour", flex: 1, minWidth: 160 },
    { field: "intensity", headerName: "Intensity", width: 90 },
    { field: "staffInitials", headerName: "Staff", width: 70 },
    {
      field: "actions", headerName: "", width: 90, sortable: false,
      renderCell: (p) => cgBdActions(p.row, () => { setEditBd(p.row); setBdModal(true); }),
    },
  ], [isAdmin, isCg, requester.requesterEmployeeId]);

  const evColumns: GridColDef[] = useMemo(() => [
    { field: "participantName", headerName: "Participant", flex: 1, minWidth: 140 },
    { field: "restrictivePracticeType", headerName: "RP Type", width: 140 },
    { field: "baselineFrequency", headerName: "Baseline", width: 100 },
    { field: "currentFrequency", headerName: "Current", width: 100 },
    { field: "reviewDate", headerName: "Review", width: 110 },
    { field: "responsiblePersonName", headerName: "Responsible", width: 130 },
    {
      field: "actions", headerName: "", width: 90, sortable: false,
      renderCell: (p) => adminActions(
        () => { setEditEv(p.row); setEvModal(true); },
        () => confirmDelete(
          "Delete RP evidence entry",
          `Are you sure you want to delete this RP evidence record for "${p.row.participantName || "this participant"}"? This action cannot be undone.`,
          () => dispatch(deleteRpEvidence({ id: p.row.evidenceID, requesterRole: requester.requesterRole })).then(load)
        )
      ),
    },
  ], [dispatch, isAdmin, load, requester.requesterRole]);

  const rows = tab === 0 ? bs.rpRegisters : tab === 1 ? bs.behaviourData : bs.rpEvidence;
  const rowId = tab === 0 ? "registerID" : tab === 1 ? "recordID" : "evidenceID";
  const exportUrl = tab === 0
    ? AppConfig.serviceUrls.restrictivePracticeRegisters
    : tab === 1
      ? AppConfig.serviceUrls.behaviourDataRecords
      : AppConfig.serviceUrls.restrictivePracticeEvidence;

  const showAdd = (tab === 1 && (isAdmin || isCg)) || (tab !== 1 && isAdmin);

  const handleAdd = () => {
    if (tab === 0) { setEditRp(null); setRpModal(true); }
    else if (tab === 1) { setEditBd(null); setBdModal(true); }
    else { setEditEv(null); setEvModal(true); }
  };

  return (
    <Stack sx={{ p: 2, height: "100%" }}>
      <RegisterPageHeader
        title="Behavior Support & RP"
        subtitle="Restrictive practices register, behaviour data, and reduction evidence"
        showAdd={showAdd}
        onAdd={handleAdd}
      />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
        <Tab label="Restrictive Practices" />
        <Tab label="Behaviour Data" />
        <Tab label="RP Evidence" />
      </Tabs>
      <BehaviorSupportFilterBar
        tab={tabKey}
        filters={filters}
        onChange={setFilters}
        onApply={load}
        onReset={() => { setFilters({ ...requester }); setTimeout(load, 0); }}
        rpTypes={lookup.rpTypes}
        authStatuses={lookup.authStatuses}
        intensities={lookup.intensities}
      />
      <Paper elevation={0} sx={{ flex: 1, border: "1px solid", borderColor: "divider", p: 1, minHeight: 400 }}>
        <Box sx={{ height: "100%", width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={tab === 0 ? rpColumns : tab === 1 ? bdColumns : evColumns}
            getRowId={(r) => r[rowId] || Math.random().toString()}
            loading={bs.loading}
            density="compact"
            disableRowSelectionOnClick
            slots={{
              toolbar: () => (
                <RegisterExportToolbar
                  onExportCsv={() => exportBehaviorCsv(exportUrl, { ...filters, ...requester })}
                  onExportPdf={() =>
                    exportRowsToPdf(
                      tab === 0 ? "RP Register" : tab === 1 ? "Behaviour Data" : "RP Evidence",
                      (tab === 0 ? rpColumns : tab === 1 ? bdColumns : evColumns)
                        .filter((c) => c.field !== "actions")
                        .map((c) => ({ header: c.headerName || "", key: c.field || "" })),
                      rows as unknown as Record<string, unknown>[],
                      {
                        companyName: organization?.name,
                        logoUrl: organization?.logoUrl,
                      }
                    )
                  }
                />
              ),
            }}
          />
        </Box>
      </Paper>
      <BehaviourDataModal
        open={bdModal}
        onClose={() => { setBdModal(false); setEditBd(null); }}
        record={editBd}
        onSaved={load}
      />
      <RpRegisterModal
        open={rpModal}
        onClose={() => { setRpModal(false); setEditRp(null); }}
        record={editRp}
        onSaved={load}
      />
      <RpEvidenceModal
        open={evModal}
        onClose={() => { setEvModal(false); setEditEv(null); }}
        record={editEv}
        onSaved={load}
      />
    </Stack>
  );
};

export default BehaviorSupportView;
