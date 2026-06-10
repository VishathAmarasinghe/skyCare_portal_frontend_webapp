import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  AgreementAssignment,
  fetchAgreementAssignments,
  fetchAgreementTemplates,
  saveAgreementAssignments,
} from "../../../slices/agreementTemplateSlice/agreementTemplate";
import { CARE_GIVER_TYPES, isVisibleAgreementTemplate } from "../../../constants";

const AssignmentRulesPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { templates, assignments } = useAppSelector((state) => state.agreementTemplates);
  const [localRules, setLocalRules] = useState<AgreementAssignment[]>([]);

  useEffect(() => {
    dispatch(fetchAgreementTemplates());
    dispatch(fetchAgreementAssignments());
  }, [dispatch]);

  useEffect(() => {
    if (assignments.length > 0) {
      setLocalRules(assignments);
    } else {
      setLocalRules(
        CARE_GIVER_TYPES.filter((t) => t !== "Not specified").map((type, index) => ({
          templateId: "",
          ruleType: "MATCH_CARE_GIVER_TYPE",
          careGiverType: type,
          priority: index + 1,
        }))
      );
    }
  }, [assignments]);

  const workerTemplates = templates.filter(
    (t) => t.audience === "WORKER" && isVisibleAgreementTemplate(t)
  );

  const updateRule = (index: number, templateId: string) => {
    const next = [...localRules];
    next[index] = { ...next[index], templateId };
    setLocalRules(next);
  };

  const handleSave = () => {
    dispatch(saveAgreementAssignments(localRules.filter((rule) => rule.templateId)));
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600}>
        Assignment Rules
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Map each care giver type to the agreement template used when sending.
      </Typography>
      {localRules.map((rule, index) => (
        <FormControl key={rule.careGiverType} size="small" fullWidth>
          <InputLabel>{rule.careGiverType}</InputLabel>
          <Select
            label={rule.careGiverType}
            value={rule.templateId}
            onChange={(e) => updateRule(index, e.target.value)}
          >
            <MenuItem value="">— Select template —</MenuItem>
            {workerTemplates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.displayName} ({template.templateKey})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
      <Button variant="contained" onClick={handleSave}>
        Save Assignment Rules
      </Button>
    </Stack>
  );
};

export default AssignmentRulesPanel;
