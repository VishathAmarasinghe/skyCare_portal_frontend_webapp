import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, Avatar, Box, Chip, TextField } from "@mui/material";
import axios from "axios";
import { AppConfig, FILE_DOWNLOAD_BASE_URL } from "@config/config";
import { Employee } from "@slices/employeeSlice/employee";

interface PersonAutocompleteProps {
  label: string;
  value: Employee | null;
  onChange: (value: Employee | null) => void;
  roleFilter?: string;
  disabled?: boolean;
  required?: boolean;
}

const PersonAutocomplete: React.FC<PersonAutocompleteProps> = ({
  label,
  value,
  onChange,
  roleFilter,
  disabled,
  required,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value) {
      setInputValue(`${value.firstName} ${value.lastName}`);
    }
  }, [value]);

  useEffect(() => {
    if (inputValue.trim().length < 1) {
      setOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { q: inputValue.trim(), limit: 20 };
        if (roleFilter) params.role = roleFilter;
        const res = await axios.get(`${AppConfig.serviceUrls.employees}/lookup`, { params });
        setOptions(res.data || []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, roleFilter]);

  const getLabel = useMemo(
    () => (option: Employee) => `${option.firstName} ${option.lastName}`,
    []
  );

  return (
    <Autocomplete
      disabled={disabled}
      options={options}
      loading={loading}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInput) => setInputValue(newInput)}
      getOptionLabel={getLabel}
      isOptionEqualToValue={(a, b) => a.employeeID === b.employeeID}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.employeeID}>
          <Chip
            avatar={
              <Avatar
                src={
                  option.profile_photo
                    ? `${FILE_DOWNLOAD_BASE_URL}${option.profile_photo}`
                    : undefined
                }
              />
            }
            label={getLabel(option)}
            size="small"
            variant="outlined"
          />
        </Box>
      )}
      renderInput={(params) => (
        <TextField {...params} label={label} required={required} size="small" />
      )}
    />
  );
};

export default PersonAutocomplete;
