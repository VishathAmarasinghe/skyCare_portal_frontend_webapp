import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Autocomplete, Avatar, Box, Chip, TextField } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import axios from "axios";
import { AppConfig, FILE_DOWNLOAD_BASE_URL } from "@config/config";
import { Employee } from "@slices/employeeSlice/employee";

const MANUAL_PREFIX = "__manual__:";

export type PersonSelection =
  | { type: "employee"; employee: Employee }
  | { type: "manual"; name: string }
  | null;

interface CreatablePersonSelectProps {
  label: string;
  value: PersonSelection;
  onChange: (value: PersonSelection) => void;
  roleFilter?: string;
  required?: boolean;
}

type OptionItem =
  | { kind: "employee"; employee: Employee }
  | { kind: "manual"; name: string };

const employeeLabel = (employee: Employee) =>
  `${employee.firstName} ${employee.lastName}`.trim();

const CreatablePersonSelect: React.FC<CreatablePersonSelectProps> = ({
  label,
  value,
  onChange,
  roleFilter,
  required,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const displayLabel = useMemo(() => {
    if (!value) return "";
    if (value.type === "employee") return employeeLabel(value.employee);
    return value.name;
  }, [value]);

  useEffect(() => {
    setInputValue(displayLabel);
  }, [displayLabel]);

  useEffect(() => {
    if (inputValue.trim().length < 1) {
      setEmployees([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          q: inputValue.trim(),
          limit: 20,
        };
        if (roleFilter) params.role = roleFilter;
        const res = await axios.get(`${AppConfig.serviceUrls.employees}/lookup`, {
          params,
        });
        setEmployees(res.data || []);
      } catch {
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, roleFilter]);

  const commitInput = useCallback(
    (raw: string, knownEmployees: Employee[] = employees) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        onChange(null);
        return;
      }

      if (value?.type === "employee") {
        const selectedLabel = employeeLabel(value.employee);
        if (selectedLabel.toLowerCase() === trimmed.toLowerCase()) {
          return;
        }
      }

      const pools = [
        ...knownEmployees,
        ...(value?.type === "employee" ? [value.employee] : []),
      ];
      const match = pools.find(
        (e) => employeeLabel(e).toLowerCase() === trimmed.toLowerCase()
      );
      if (match?.employeeID) {
        onChange({ type: "employee", employee: match });
        return;
      }

      if (value?.type === "manual" && value.name === trimmed) {
        return;
      }

      onChange({ type: "manual", name: trimmed });
    },
    [employees, onChange, value]
  );

  const options: OptionItem[] = useMemo(() => {
    const items: OptionItem[] = employees.map((e) => ({
      kind: "employee" as const,
      employee: e,
    }));
    const trimmed = inputValue.trim();
    const exists = employees.some(
      (e) => employeeLabel(e).toLowerCase() === trimmed.toLowerCase()
    );
    if (trimmed.length > 0 && !exists) {
      items.push({ kind: "manual", name: trimmed });
    }
    return items;
  }, [employees, inputValue]);

  const selectedOption: OptionItem | string | null = useMemo(() => {
    if (!value) return null;
    if (value.type === "employee") {
      return { kind: "employee", employee: value.employee };
    }
    return value.name;
  }, [value]);

  const optionKey = (opt: OptionItem) =>
    opt.kind === "employee"
      ? opt.employee.employeeID
      : `${MANUAL_PREFIX}${opt.name}`;

  const optionLabel = (opt: OptionItem) =>
    opt.kind === "employee" ? employeeLabel(opt.employee) : `Add "${opt.name}"`;

  return (
    <Autocomplete<OptionItem, false, false, true>
      freeSolo
      selectOnFocus
      handleHomeEndKeys
      clearOnBlur={false}
      options={options}
      loading={loading}
      value={selectedOption}
      inputValue={inputValue}
      onInputChange={(_, v, reason) => {
        setInputValue(v);
        if (reason === "clear") {
          onChange(null);
        }
      }}
      onChange={(_, newValue) => {
        if (newValue === null) {
          onChange(null);
          return;
        }
        if (typeof newValue === "string") {
          commitInput(newValue);
          return;
        }
        if (newValue.kind === "employee" && newValue.employee.employeeID) {
          onChange({ type: "employee", employee: newValue.employee });
          setInputValue(employeeLabel(newValue.employee));
        } else if (newValue.kind === "manual") {
          onChange({ type: "manual", name: newValue.name });
        }
      }}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : optionLabel(option)
      }
      isOptionEqualToValue={(a, b) => {
        if (typeof a === "string" || typeof b === "string") {
          return a === b;
        }
        return optionKey(a) === optionKey(b);
      }}
      filterOptions={(x) => x}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={optionKey(option)}>
          {option.kind === "employee" ? (
            <Chip
              avatar={
                <Avatar
                  src={
                    option.employee.profile_photo
                      ? `${FILE_DOWNLOAD_BASE_URL}${option.employee.profile_photo}`
                      : undefined
                  }
                />
              }
              label={optionLabel(option)}
              size="small"
              variant="outlined"
            />
          ) : (
            <Chip
              icon={<AddCircleOutlineIcon />}
              label={optionLabel(option)}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          placeholder="Search staff or type a new name"
          onBlur={(event) => {
            const nativeBlur = params.inputProps?.onBlur as
              | ((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void)
              | undefined;
            nativeBlur?.(event);
            commitInput(inputValue);
          }}
        />
      )}
    />
  );
};

export default CreatablePersonSelect;
