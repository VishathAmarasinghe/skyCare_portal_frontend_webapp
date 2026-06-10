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
  resetBehaviorSupportSubmitState,
  RpEvidenceRecord,
  saveRpEvidence,
} from "@slices/behaviorSupportSlice/behaviorSupport";
import { Employee } from "@slices/employeeSlice/employee";
import { State } from "../../../types/types";
import { getRequesterParams } from "../../../utils/registerAccess";
import { preventBackdropClose } from "../../../utils/registerDialogClose";

interface RpEvidenceModalProps {
  open: boolean;
  onClose: () => void;
  record?: RpEvidenceRecord | null;
  onSaved: () => void;
}

const RpEvidenceModal: React.FC<RpEvidenceModalProps> = ({ open, onClose, record, onSaved }) => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const lookup = useAppSelector((state) => state.complianceLookup);
  const { submitState } = useAppSelector((state) => state.behaviorSupport);
  const [form, setForm] = useState<RpEvidenceRecord>({ clientID: "" });
  const [client, setClient] = useState<ClientLookupOption | null>(null);
  const [responsible, setResponsible] = useState<Employee | null>(null);
  const requester = getRequesterParams(auth.roles, auth.userInfo?.userID);

  useEffect(() => {
    if (!open) return;
    dispatch(resetBehaviorSupportSubmitState());
    if (record) {
      setForm({ ...record });
      setClient(record.clientID ? { clientID: record.clientID, firstName: "", lastName: "", displayName: record.participantName } : null);
    } else if (open) {
      setForm({ clientID: "" });
      setClient(null);
      setResponsible(null);
    }
  }, [open, record]);

  useEffect(() => {
    if (submitState !== State.success) return;
    onSaved();
    dispatch(resetBehaviorSupportSubmitState());
    onClose();
  }, [submitState, onClose, onSaved, dispatch]);

  const handleSave = () => {
    if (!client?.clientID) return;
    dispatch(saveRpEvidence({
      record: { ...form, clientID: client.clientID, responsibleEmployeeID: responsible?.employeeID },
      isUpdate: !!record?.evidenceID,
      ...requester,
    }));
  };

  return (
    <Dialog open={open} onClose={preventBackdropClose(onClose)} maxWidth="md" fullWidth>
      <DialogTitle>{record ? "Edit RP evidence" : "Add RP evidence"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}><ClientAutocomplete value={client} onChange={setClient} required /></Grid>
          <Grid item xs={12} md={6}>
            <TextField select label="Restrictive practice type" size="small" fullWidth value={form.restrictivePracticeType || ""}
              onChange={(e) => setForm({ ...form, restrictivePracticeType: e.target.value })}>
              {lookup.rpTypes.map((t) => <MenuItem key={t.lookupID} value={t.title}>{t.title}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField label="Baseline frequency" size="small" fullWidth value={form.baselineFrequency || ""}
              onChange={(e) => setForm({ ...form, baselineFrequency: e.target.value })} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField label="Current frequency" size="small" fullWidth value={form.currentFrequency || ""}
              onChange={(e) => setForm({ ...form, currentFrequency: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Review date" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }}
              value={form.reviewDate || ""} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}><PersonAutocomplete label="Responsible person" value={responsible} onChange={setResponsible} /></Grid>
          <Grid item xs={12}>
            <TextField label="Reduction goal" size="small" fullWidth multiline minRows={2}
              value={form.reductionGoal || ""} onChange={(e) => setForm({ ...form, reductionGoal: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Strategies implemented" size="small" fullWidth multiline minRows={2}
              value={form.strategiesImplemented || ""} onChange={(e) => setForm({ ...form, strategiesImplemented: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Alternative supports used" size="small" fullWidth multiline minRows={2}
              value={form.alternativeSupportsUsed || ""} onChange={(e) => setForm({ ...form, alternativeSupportsUsed: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel control={<Switch checked={!!form.staffTrainingCompleted}
              onChange={(e) => setForm({ ...form, staffTrainingCompleted: e.target.checked })} />} label="Staff training completed" />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel control={<Switch checked={!!form.behaviourDataReviewed}
              onChange={(e) => setForm({ ...form, behaviourDataReviewed: e.target.checked })} />} label="Behaviour data reviewed" />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Outcome / progress" size="small" fullWidth multiline minRows={2}
              value={form.outcomeProgress || ""} onChange={(e) => setForm({ ...form, outcomeProgress: e.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Next actions" size="small" fullWidth multiline minRows={2}
              value={form.nextActions || ""} onChange={(e) => setForm({ ...form, nextActions: e.target.value })} />
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

export default RpEvidenceModal;
