import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useAppDispatch, useAppSelector } from "@slices/store";
import CreatablePersonSelect, { PersonSelection } from "../../common/CreatablePersonSelect";
import CreatableLookupSelect from "../../common/CreatableLookupSelect";
import {
  StaffTrainingRecord,
  resetStaffTrainingSubmitState,
  saveStaffTrainingRecord,
} from "@slices/staffTrainingSlice/staffTraining";
import { Employee } from "@slices/employeeSlice/employee";
import { State } from "../../../types/types";
import { getRequesterParams } from "../../../utils/registerAccess";
import {
  fetchTrainingCourses,
  fetchTrainingProviders,
  saveLookupItem,
} from "@slices/complianceLookupSlice/complianceLookup";
import { AppConfig } from "@config/config";
import { preventBackdropClose } from "../../../utils/registerDialogClose";

interface StaffTrainingModalProps {
  open: boolean;
  onClose: () => void;
  record?: StaffTrainingRecord | null;
  onSaved: () => void;
}

const emptyRecord = (): StaffTrainingRecord => ({
  employeeID: "",
  trainingCourse: "",
  provider: "",
  certificateFiled: false,
  competencyAssessed: false,
});

const buildSaveRecord = (
  form: StaffTrainingRecord,
  staffSelection: PersonSelection,
  assessorSelection: PersonSelection,
  clearCertificate: boolean
): StaffTrainingRecord => {
  const record: StaffTrainingRecord = {
    recordID: form.recordID,
    position: form.position,
    trainingCourse: form.trainingCourse,
    provider: form.provider,
    dateCompleted: form.dateCompleted,
    expiryDate: form.expiryDate,
    certificateFiled: !!form.certificateFiled,
    competencyAssessed: !!form.competencyAssessed,
    comments: form.comments,
  };

  if (staffSelection?.type === "employee" && staffSelection.employee.employeeID) {
    record.employeeID = staffSelection.employee.employeeID;
    record.staffNameManual = "";
  } else if (staffSelection?.type === "manual") {
    record.employeeID = "";
    record.staffNameManual = staffSelection.name.trim();
  }

  if (assessorSelection?.type === "employee" && assessorSelection.employee.employeeID) {
    record.assessorEmployeeID = assessorSelection.employee.employeeID;
    record.assessorNameManual = "";
  } else if (assessorSelection?.type === "manual") {
    record.assessorEmployeeID = "";
    record.assessorNameManual = assessorSelection.name.trim();
  } else {
    record.assessorEmployeeID = "";
    record.assessorNameManual = "";
  }

  if (clearCertificate) {
    record.clearCertificate = true;
  }

  return record;
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    variant="overline"
    sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: 1.1, display: "block", mb: 1 }}
  >
    {children}
  </Typography>
);

const StaffTrainingModal: React.FC<StaffTrainingModalProps> = ({
  open,
  onClose,
  record,
  onSaved,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const lookup = useAppSelector((state) => state.complianceLookup);
  const { submitState } = useAppSelector((state) => state.staffTraining);
  const [form, setForm] = useState<StaffTrainingRecord>(emptyRecord());
  const [staffSelection, setStaffSelection] = useState<PersonSelection>(null);
  const [assessorSelection, setAssessorSelection] = useState<PersonSelection>(null);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [clearCertificate, setClearCertificate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saving = submitState === State.loading;

  useEffect(() => {
    if (open) {
      dispatch(resetStaffTrainingSubmitState());
      dispatch(fetchTrainingCourses());
      dispatch(fetchTrainingProviders());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({ ...record });
      if (record.employeeID) {
        setStaffSelection({
          type: "employee",
          employee: {
            employeeID: record.employeeID,
            firstName: record.employeeName?.split(" ")[0] || "",
            lastName: record.employeeName?.split(" ").slice(1).join(" ") || "",
          } as Employee,
        });
      } else if (record.staffNameManual || record.employeeName) {
        setStaffSelection({
          type: "manual",
          name: record.staffNameManual || record.employeeName || "",
        });
      } else {
        setStaffSelection(null);
      }
      if (record.assessorEmployeeID) {
        setAssessorSelection({
          type: "employee",
          employee: {
            employeeID: record.assessorEmployeeID,
            firstName: record.assessorName?.split(" ")[0] || "",
            lastName: record.assessorName?.split(" ").slice(1).join(" ") || "",
          } as Employee,
        });
      } else if (record.assessorNameManual || record.assessorName) {
        setAssessorSelection({
          type: "manual",
          name: record.assessorNameManual || record.assessorName || "",
        });
      } else {
        setAssessorSelection(null);
      }
      setCertificate(null);
      setClearCertificate(false);
    } else {
      setForm(emptyRecord());
      setStaffSelection(null);
      setAssessorSelection(null);
      setCertificate(null);
      setClearCertificate(false);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, record]);

  useEffect(() => {
    if (submitState !== State.success) return;
    onSaved();
    dispatch(resetStaffTrainingSubmitState());
    onClose();
  }, [submitState, onSaved, onClose, dispatch]);

  const requester = getRequesterParams(auth.roles, auth.userInfo?.userID);

  const createCourse = async (title: string) => {
    await dispatch(
      saveLookupItem({
        url: AppConfig.serviceUrls.trainingCourseTypes,
        item: { lookupID: "", title, status: "Active" },
        isUpdate: false,
      })
    );
    dispatch(fetchTrainingCourses());
  };

  const createProvider = async (title: string) => {
    await dispatch(
      saveLookupItem({
        url: AppConfig.serviceUrls.trainingProviders,
        item: { lookupID: "", title, status: "Active" },
        isUpdate: false,
      })
    );
    dispatch(fetchTrainingProviders());
  };

  const hasExistingCertificate = !!record?.hasCertificate && !clearCertificate;
  const hasPendingCertificate = !!certificate;

  const removeCertificate = () => {
    if (certificate) {
      setCertificate(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (!hasExistingCertificate) {
        setForm((f) => ({ ...f, certificateFiled: false }));
      }
      return;
    }
    if (hasExistingCertificate) {
      setClearCertificate(true);
      setForm((f) => ({ ...f, certificateFiled: false }));
    }
  };

  const canSave =
    !!form.trainingCourse &&
    ((staffSelection?.type === "employee" && !!staffSelection.employee.employeeID) ||
      (staffSelection?.type === "manual" && !!staffSelection.name.trim()));

  const handleSave = () => {
    if (!canSave || !staffSelection || saving) return;
    const payload = buildSaveRecord(form, staffSelection, assessorSelection, clearCertificate);
    dispatch(
      saveStaffTrainingRecord({
        record: payload,
        certificate,
        isUpdate: !!record?.recordID,
        requesterRole: requester.requesterRole,
        requesterEmployeeId: requester.requesterEmployeeId,
      })
    );
  };

  return (
    <Dialog
      open={open}
      onClose={preventBackdropClose(onClose)}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 520,
          maxWidth: "100%",
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: "grey.50",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <SchoolOutlinedIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {record ? "Edit training record" : "Add training record"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Search existing options or type a new name — new providers and courses are saved automatically.
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 3, overflowX: "hidden" }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SectionLabel>Staff details</SectionLabel>
          </Grid>
          <Grid item xs={12} md={6}>
            <CreatablePersonSelect
              label="Staff name"
              value={staffSelection}
              onChange={setStaffSelection}
              required
            />
            {staffSelection?.type === "employee" && staffSelection.employee.employeeID && (
              <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: "block" }}>
                Linked to employee {staffSelection.employee.employeeID}
              </Typography>
            )}
            {staffSelection?.type === "manual" && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                Manual entry — not linked to an employee record
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Position"
              fullWidth
              value={form.position || ""}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              placeholder="e.g. Support Worker"
            />
          </Grid>

          <Grid item xs={12}>
            {/* <Divider /> */}
          </Grid>

          <Grid item xs={12}>
            <SectionLabel>Training information</SectionLabel>
          </Grid>
          <Grid item xs={12} md={6}>
            <CreatableLookupSelect
              label="Training course"
              value={form.trainingCourse}
              options={lookup.trainingCourses}
              onChange={(v) => setForm({ ...form, trainingCourse: v })}
              onCreateNew={createCourse}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CreatableLookupSelect
              label="Provider"
              value={form.provider || ""}
              options={lookup.trainingProviders}
              onChange={(v) => setForm({ ...form, provider: v })}
              onCreateNew={createProvider}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Date completed"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.dateCompleted || ""}
              onChange={(e) => setForm({ ...form, dateCompleted: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Expiry date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.expiryDate || ""}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            {/* <Divider /> */}
          </Grid>

          <Grid item xs={12}>
            <SectionLabel>Assessment & certificate</SectionLabel>
          </Grid>
          <Grid item xs={12} md={6}>
            <CreatablePersonSelect
              label="Assessor"
              value={assessorSelection}
              onChange={setAssessorSelection}
            />
            {assessorSelection?.type === "employee" && assessorSelection.employee.employeeID && (
              <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: "block" }}>
                Linked to employee {assessorSelection.employee.employeeID}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                minHeight: 56,
                px: 2,
                py: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                flexWrap: "wrap",
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={!!form.certificateFiled}
                    onChange={(e) =>
                      setForm({ ...form, certificateFiled: e.target.checked })
                    }
                  />
                }
                label="Certificate filed"
                sx={{ flex: 1, m: 0, minWidth: 140 }}
              />
              <Tooltip title="Upload certificate">
                <IconButton component="label" color="primary" size="medium" disabled={saving}>
                  <UploadFileOutlinedIcon />
                  <input
                    ref={fileInputRef}
                    hidden
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setCertificate(file);
                      setClearCertificate(false);
                      if (file) setForm((f) => ({ ...f, certificateFiled: true }));
                    }}
                  />
                </IconButton>
              </Tooltip>
              {hasPendingCertificate && (
                <Chip
                  size="small"
                  label={certificate?.name}
                  onDelete={removeCertificate}
                  deleteIcon={<DeleteOutlineIcon />}
                  sx={{ maxWidth: 180 }}
                />
              )}
              {!hasPendingCertificate && hasExistingCertificate && (
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label="Certificate on file"
                  onDelete={removeCertificate}
                  deleteIcon={<DeleteOutlineIcon />}
                />
              )}
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!form.competencyAssessed}
                  onChange={(e) =>
                    setForm({ ...form, competencyAssessed: e.target.checked })
                  }
                />
              }
              label="Competency assessed"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Comments"
              fullWidth
              multiline
              minRows={3}
              value={form.comments || ""}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              placeholder="Optional notes for audit or follow-up"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: "grey.50",
        }}
      >
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSave || saving}
          sx={{ minWidth: 140 }}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {saving ? "Saving…" : "Save record"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StaffTrainingModal;
