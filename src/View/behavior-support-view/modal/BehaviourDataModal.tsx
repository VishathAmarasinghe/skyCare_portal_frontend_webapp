import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@slices/store";
import ClientAutocomplete, { ClientLookupOption } from "../../common/ClientAutocomplete";
import PersonAutocomplete from "../../common/PersonAutocomplete";
import {
  BehaviourDataRecord,
  resetBehaviorSupportSubmitState,
  saveBehaviourData,
} from "@slices/behaviorSupportSlice/behaviorSupport";
import { Employee } from "@slices/employeeSlice/employee";
import { State } from "../../../types/types";
import { getRequesterParams, isAdminUser } from "../../../utils/registerAccess";
import { preventBackdropClose } from "../../../utils/registerDialogClose";

interface BehaviourDataModalProps {
  open: boolean;
  onClose: () => void;
  record?: BehaviourDataRecord | null;
  onSaved: () => void;
}

type BehaviourDataFieldErrors = {
  client?: string;
  recordDate?: string;
  recordTime?: string;
  behaviourObserved?: string;
};

const BehaviourDataModal: React.FC<BehaviourDataModalProps> = ({ open, onClose, record, onSaved }) => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const lookup = useAppSelector((state) => state.complianceLookup);
  const { submitState } = useAppSelector((state) => state.behaviorSupport);
  const [form, setForm] = useState<BehaviourDataRecord>({ clientID: "", staffEmployeeID: "" });
  const [client, setClient] = useState<ClientLookupOption | null>(null);
  const [staff, setStaff] = useState<Employee | null>(null);
  const [errors, setErrors] = useState<BehaviourDataFieldErrors>({});
  const isAdmin = isAdminUser(auth.roles);
  const requester = getRequesterParams(auth.roles, auth.userInfo?.userID);

  useEffect(() => {
    if (open) {
      dispatch(resetBehaviorSupportSubmitState());
      setErrors({});
      if (record) {
        setForm({ ...record });
        setClient(record.clientID ? { clientID: record.clientID, firstName: "", lastName: "", displayName: record.participantName } : null);
      } else {
        setForm({
          clientID: "",
          staffEmployeeID: isAdmin ? "" : requester.requesterEmployeeId,
          recordDate: new Date().toISOString().slice(0, 10),
          recordTime: new Date().toTimeString().slice(0, 5),
        });
        setClient(null);
        if (!isAdmin) {
          setStaff({ employeeID: requester.requesterEmployeeId, firstName: "", lastName: "" } as Employee);
        } else {
          setStaff(null);
        }
      }
    }
  }, [open, record, isAdmin, requester.requesterEmployeeId]);

  useEffect(() => {
    if (submitState !== State.success) return;
    onSaved();
    dispatch(resetBehaviorSupportSubmitState());
    onClose();
  }, [submitState, onClose, onSaved, dispatch]);

  const clearError = (field: keyof BehaviourDataFieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = () => {
    const nextErrors: BehaviourDataFieldErrors = {};
    if (!client?.clientID) nextErrors.client = "Participant is required";
    if (!form.recordDate?.trim()) nextErrors.recordDate = "Date is required";
    if (!form.recordTime?.trim()) nextErrors.recordTime = "Time is required";
    if (!form.behaviourObserved?.trim()) nextErrors.behaviourObserved = "Behaviour observed is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    dispatch(
      saveBehaviourData({
        record: {
          ...form,
          clientID: client!.clientID,
          staffEmployeeID: isAdmin ? staff?.employeeID || form.staffEmployeeID : requester.requesterEmployeeId,
        },
        isUpdate: !!record?.recordID,
        ...requester,
      })
    );
  };

  return (
    <Dialog open={open} onClose={preventBackdropClose(onClose)} maxWidth="md" fullWidth>
      <DialogTitle>{record ? "Edit behaviour data" : "Add behaviour data"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <ClientAutocomplete
              value={client}
              onChange={(value) => {
                setClient(value);
                if (value?.clientID) clearError("client");
              }}
              required
              error={!!errors.client}
              helperText={errors.client}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="Date"
              type="date"
              size="small"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.recordDate || ""}
              onChange={(e) => {
                setForm({ ...form, recordDate: e.target.value });
                if (e.target.value.trim()) clearError("recordDate");
              }}
              error={!!errors.recordDate}
              helperText={errors.recordDate}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="Time"
              type="time"
              size="small"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.recordTime || ""}
              onChange={(e) => {
                setForm({ ...form, recordTime: e.target.value });
                if (e.target.value.trim()) clearError("recordTime");
              }}
              error={!!errors.recordTime}
              helperText={errors.recordTime}
            />
          </Grid>
          {isAdmin && (
            <Grid item xs={12} md={6}>
              <PersonAutocomplete label="Staff" value={staff} onChange={setStaff} />
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <TextField select label="Intensity" size="small" fullWidth value={form.intensity || ""}
              onChange={(e) => setForm({ ...form, intensity: e.target.value })}>
              {lookup.intensities.map((i) => (
                <MenuItem key={i.lookupID} value={i.title}>{i.title}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Behaviour observed"
              size="small"
              fullWidth
              required
              multiline
              minRows={2}
              value={form.behaviourObserved || ""}
              onChange={(e) => {
                setForm({ ...form, behaviourObserved: e.target.value });
                if (e.target.value.trim()) clearError("behaviourObserved");
              }}
              error={!!errors.behaviourObserved}
              helperText={errors.behaviourObserved}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Antecedent (trigger)" size="small" fullWidth multiline minRows={2}
              value={form.antecedent || ""} onChange={(e) => setForm({ ...form, antecedent: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Staff response / strategy" size="small" fullWidth multiline minRows={2}
              value={form.staffResponse || ""} onChange={(e) => setForm({ ...form, staffResponse: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Restrictive practice used" size="small" fullWidth
              value={form.restrictivePracticeUsed || ""} onChange={(e) => setForm({ ...form, restrictivePracticeUsed: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Duration" size="small" fullWidth
              value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel control={<Switch checked={!!form.followUpRequired}
              onChange={(e) => setForm({ ...form, followUpRequired: e.target.checked })} />}
              label="Follow-up required" />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Outcome" size="small" fullWidth multiline minRows={2}
              value={form.outcome || ""} onChange={(e) => setForm({ ...form, outcome: e.target.value })} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BehaviourDataModal;
