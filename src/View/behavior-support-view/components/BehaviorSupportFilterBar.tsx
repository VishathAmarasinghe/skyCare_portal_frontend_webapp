import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ClientAutocomplete, { ClientLookupOption } from "../../common/ClientAutocomplete";
import PersonAutocomplete from "../../common/PersonAutocomplete";
import { Employee } from "@slices/employeeSlice/employee";
import { BehaviorSupportFilters } from "@slices/behaviorSupportSlice/behaviorSupport";
import { ComplianceLookupItem } from "@slices/complianceLookupSlice/complianceLookup";

type TabKey = "rp" | "behaviour" | "evidence";

interface BehaviorSupportFilterBarProps {
  tab: TabKey;
  filters: BehaviorSupportFilters;
  onChange: (filters: BehaviorSupportFilters) => void;
  onApply: () => void;
  onReset: () => void;
  rpTypes: ComplianceLookupItem[];
  authStatuses: ComplianceLookupItem[];
  intensities: ComplianceLookupItem[];
}

const BehaviorSupportFilterBar: React.FC<BehaviorSupportFilterBarProps> = ({
  tab,
  filters,
  onChange,
  onApply,
  onReset,
  rpTypes,
  authStatuses,
  intensities,
}) => {
  const [client, setClient] = React.useState<ClientLookupOption | null>(null);
  const [practitioner, setPractitioner] = React.useState<Employee | null>(null);

  const activeCount = Object.values(filters).filter((v) => v !== undefined && v !== "" && v !== null).length;

  return (
    <Accordion disableGutters elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 2, "&:before": { display: "none" } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">Filters</Typography>
          {activeCount > 0 && <Chip size="small" label={`${activeCount} active`} />}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <ClientAutocomplete
              value={client}
              onChange={(c) => {
                setClient(c);
                onChange({ ...filters, clientId: c?.clientID || "" });
              }}
            />
          </Grid>
          {tab === "rp" && (
            <>
              <Grid item xs={12} md={4}>
                <TextField label="NDIS number" size="small" fullWidth value={filters.ndisNumber || ""}
                  onChange={(e) => onChange({ ...filters, ndisNumber: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select label="RP type" size="small" fullWidth value={filters.rpType || ""}
                  onChange={(e) => onChange({ ...filters, rpType: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {rpTypes.map((t) => <MenuItem key={t.lookupID} value={t.title}>{t.title}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select label="Authorisation status" size="small" fullWidth value={filters.authStatus || ""}
                  onChange={(e) => onChange({ ...filters, authStatus: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {authStatuses.map((s) => <MenuItem key={s.lookupID} value={s.title}>{s.title}</MenuItem>)}
                </TextField>
              </Grid>
            </>
          )}
          {(tab === "behaviour" || tab === "evidence") && (
            <>
              <Grid item xs={6} md={3}>
                <TextField label="From" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }}
                  value={filters.from || ""} onChange={(e) => onChange({ ...filters, from: e.target.value })} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField label="To" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }}
                  value={filters.to || ""} onChange={(e) => onChange({ ...filters, to: e.target.value })} />
              </Grid>
            </>
          )}
          {tab === "behaviour" && (
            <Grid item xs={12} md={4}>
              <TextField select label="Intensity" size="small" fullWidth value={filters.intensity || ""}
                onChange={(e) => onChange({ ...filters, intensity: e.target.value })}>
                <MenuItem value="">All</MenuItem>
                {intensities.map((i) => <MenuItem key={i.lookupID} value={i.title}>{i.title}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {tab === "evidence" && (
            <Grid item xs={12} md={4}>
              <TextField select label="RP type" size="small" fullWidth value={filters.rpType || ""}
                onChange={(e) => onChange({ ...filters, rpType: e.target.value })}>
                <MenuItem value="">All</MenuItem>
                {rpTypes.map((t) => <MenuItem key={t.lookupID} value={t.title}>{t.title}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {tab === "rp" && (
            <Grid item xs={12} md={4}>
              <PersonAutocomplete label="Practitioner" value={practitioner} onChange={setPractitioner} />
            </Grid>
          )}
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onApply}>Apply filters</Button>
              <Button variant="text" onClick={onReset}>Reset</Button>
            </Stack>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default BehaviorSupportFilterBar;
