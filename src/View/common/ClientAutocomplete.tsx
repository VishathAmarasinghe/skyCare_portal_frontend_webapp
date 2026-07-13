import React, { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import axios from "axios";
import { AppConfig } from "@config/config";

export interface ClientLookupOption {
  clientID: string;
  firstName: string;
  lastName: string;
  referenceNo?: string;
  displayName?: string;
}

interface ClientAutocompleteProps {
  label?: string;
  value: ClientLookupOption | null;
  onChange: (value: ClientLookupOption | null) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
  label = "Participant",
  value,
  onChange,
  disabled,
  required,
  error,
  helperText,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<ClientLookupOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value) {
      setInputValue(value.displayName || `${value.firstName} ${value.lastName}`);
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
        const res = await axios.get(`${AppConfig.serviceUrls.clients}/lookup`, {
          params: { q: inputValue.trim(), limit: 20 },
        });
        setOptions(res.data || []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <Autocomplete
      disabled={disabled}
      options={options}
      loading={loading}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInput) => setInputValue(newInput)}
      getOptionLabel={(o) =>
        `${o.displayName || `${o.firstName} ${o.lastName}`}${o.referenceNo ? ` (${o.referenceNo})` : ""}`
      }
      isOptionEqualToValue={(a, b) => a.clientID === b.clientID}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          size="small"
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
};

export default ClientAutocomplete;
