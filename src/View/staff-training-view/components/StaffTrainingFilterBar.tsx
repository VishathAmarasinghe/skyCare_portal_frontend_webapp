import React, { useState } from "react";
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
import PersonAutocomplete from "../../common/PersonAutocomplete";
import { Employee } from "@slices/employeeSlice/employee";
import { StaffTrainingFilters } from "@slices/staffTrainingSlice/staffTraining";
import { ComplianceLookupItem } from "@slices/complianceLookupSlice/complianceLookup";

interface StaffTrainingFilterBarProps {
  filters: StaffTrainingFilters;
  onChange: (filters: StaffTrainingFilters) => void;
  onApply: () => void;
  onReset: () => void;
  courses: ComplianceLookupItem[];
  providers: ComplianceLookupItem[];
  showStaffFilter?: boolean;
}

const StaffTrainingFilterBar: React.FC<StaffTrainingFilterBarProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
  courses,
  providers,
  showStaffFilter = true,
}) => {
  const [staff, setStaff] = useState<Employee | null>(null);

  const activeCount = [
    filters.employeeId,
    filters.course,
    filters.provider,
    filters.expiryStatus && filters.expiryStatus !== "ALL",
    filters.from,
    filters.to,
    filters.competencyAssessed !== "" && filters.competencyAssessed !== undefined,
    filters.certificateFiled !== "" && filters.certificateFiled !== undefined,
  ].filter(Boolean).length;

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", mb: 2, "&:before": { display: "none" } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">Filters</Typography>
          {activeCount > 0 && <Chip size="small" label={`${activeCount} active`} />}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {showStaffFilter && (
            <Grid item xs={12} md={4}>
              <PersonAutocomplete
                label="Staff"
                value={staff}
                onChange={(emp) => {
                  setStaff(emp);
                  onChange({ ...filters, employeeId: emp?.employeeID || "" });
                }}
              />
            </Grid>
          )}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Training course"
              size="small"
              fullWidth
              value={filters.course || ""}
              onChange={(e) => onChange({ ...filters, course: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              {courses.map((c) => (
                <MenuItem key={c.lookupID} value={c.title}>
                  {c.title}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Provider"
              size="small"
              fullWidth
              value={filters.provider || ""}
              onChange={(e) => onChange({ ...filters, provider: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              {providers.map((p) => (
                <MenuItem key={p.lookupID} value={p.title}>
                  {p.title}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Expiry status"
              size="small"
              fullWidth
              value={filters.expiryStatus || "ALL"}
              onChange={(e) => onChange({ ...filters, expiryStatus: e.target.value })}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="CURRENT">Current</MenuItem>
              <MenuItem value="EXPIRING_30">Expiring in 30 days</MenuItem>
              <MenuItem value="EXPIRED">Expired</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Completed from"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.from || ""}
              onChange={(e) => onChange({ ...filters, from: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Completed to"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.to || ""}
              onChange={(e) => onChange({ ...filters, to: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Certificate filed"
              size="small"
              fullWidth
              value={filters.certificateFiled === "" || filters.certificateFiled === undefined ? "" : String(filters.certificateFiled)}
              onChange={(e) =>
                onChange({
                  ...filters,
                  certificateFiled: e.target.value === "" ? "" : e.target.value === "true",
                })
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onApply}>
                Apply filters
              </Button>
              <Button variant="text" onClick={onReset}>
                Reset
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default StaffTrainingFilterBar;
