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
  RpRegisterRecord,
  saveRpRegister,
} from "@slices/behaviorSupportSlice/behaviorSupport";
import { Employee } from "@slices/employeeSlice/employee";
import { State } from "../../../types/types";
import { getRequesterParams } from "../../../utils/registerAccess";
import { preventBackdropClose } from "../../../utils/registerDialogClose";

interface RpRegisterModalProps {
  open: boolean;
  onClose: () => void;
  record?: RpRegisterRecord | null;
  onSaved: () => void;
}

const RpRegisterModal: React.FC<RpRegisterModalProps> = ({ open, onClose, record, onSaved }) => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const lookup = useAppSelector((state) => state.complianceLookup);
  const { submitState } = useAppSelector((state) => state.behaviorSupport);
  const [form, setForm] = useState<RpRegisterRecord>({ clientID: "" });
  const [client, setClient] = useState<ClientLookupOption | null>(null);
  const [practitioner, setPractitioner] = useState<Employee | null>(null);
  const [clientError, setClientError] = useState("");
  const requester = getRequesterParams(auth.roles, auth.userInfo?.userID);

  useEffect(() => {
    if (!open) return;
    dispatch(resetBehaviorSupportSubmitState());
    setClientError("");
    if (record) {
      setForm({ ...record, incidentIds: record.incidentIds || [] });
      setClient(record.clientID ? { clientID: record.clientID, firstName: "", lastName: "", displayName: record.participantName, referenceNo: record.ndisNumber } : null);
    } else if (open) {
      setForm({ clientID: "", incidentIds: [] });
      setClient(null);
      setPractitioner(null);
    }
  }, [open, record]);

  useEffect(() => {
    if (client?.referenceNo) setForm((f) => ({ ...f, ndisNumber: client.referenceNo }));
  }, [client]);

  useEffect(() => {
    if (submitState !== State.success) return;
    onSaved();
    dispatch(resetBehaviorSupportSubmitState());
    onClose();
  }, [submitState, onClose, onSaved, dispatch]);

  const handleSave = () => {
    if (!client?.clientID) {
      setClientError("Participant is required");
      return;
    }
    setClientError("");
    dispatch(saveRpRegister({
      record: { ...form, clientID: client.clientID, practitionerEmployeeID: practitioner?.employeeID, incidentIds: form.incidentIds || [] },
      isUpdate: !!record?.registerID,
      ...requester,
    }));
  };

  return (
    <Dialog open={open} onClose={preventBackdropClose(onClose)} maxWidth="md" fullWidth>
      <DialogTitle>{record ? "Edit RP register" : "Add RP register entry"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <ClientAutocomplete
              value={client}
              onChange={(value) => {
                setClient(value);
                if (value?.clientID) setClientError("");
              }}
              required
              error={!!clientError}
              helperText={clientError}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="NDIS number" size="small" fullWidth value={form.ndisNumber || ""}
              onChange={(e) => setForm({ ...form, ndisNumber: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select label="Restrictive practice type" size="small" fullWidth value={form.restrictivePracticeType || ""}
              onChange={(e) => setForm({ ...form, restrictivePracticeType: e.target.value })}>
              {lookup.rpTypes.map((t) => <MenuItem key={t.lookupID} value={t.title}>{t.title}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select label="Authorisation status" size="small" fullWidth value={form.authorisationStatus || ""}
              onChange={(e) => setForm({ ...form, authorisationStatus: e.target.value })}>
              {lookup.authStatuses.map((s) => <MenuItem key={s.lookupID} value={s.title}>{s.title}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select label="Authorising body" size="small" fullWidth value={form.authorisingBody || ""}
              onChange={(e) => setForm({ ...form, authorisingBody: e.target.value })}>
              {lookup.authBodies.map((b) => <MenuItem key={b.lookupID} value={b.title}>{b.title}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}><PersonAutocomplete label="Practitioner" value={practitioner} onChange={setPractitioner} /></Grid>
          <Grid item xs={6} md={3}>
            <TextField label="Date authorised" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }}
              value={form.dateAuthorised || ""} onChange={(e) => setForm({ ...form, dateAuthorised: e.target.value })} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField label="Review date" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }}
              value={form.reviewDate || ""} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Description of practice" size="small" fullWidth multiline minRows={2}
              value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel control={<Switch checked={!!form.behaviourSupportPlanCurrent}
              onChange={(e) => setForm({ ...form, behaviourSupportPlanCurrent: e.target.checked })} />} label="BSP current" />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel control={<Switch checked={!!form.reductionStrategyInPlace}
              onChange={(e) => setForm({ ...form, reductionStrategyInPlace: e.target.checked })} />} label="Reduction strategy" />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel control={<Switch checked={!!form.staffTrained}
              onChange={(e) => setForm({ ...form, staffTrained: e.target.checked })} />} label="Staff trained" />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Incident IDs (comma-separated)" size="small" fullWidth
              value={(form.incidentIds || []).join(", ")}
              onChange={(e) => setForm({ ...form, incidentIds: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Comments" size="small" fullWidth multiline minRows={2}
              value={form.comments || ""} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
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

export default RpRegisterModal;
