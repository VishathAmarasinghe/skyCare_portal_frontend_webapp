import React, { useMemo } from "react";
import { Autocomplete, Box, Chip, TextField, Typography, createFilterOptions } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const CREATE_PREFIX = "__create__:";

export interface LookupOption {
  lookupID?: string;
  title: string;
}

interface CreatableLookupSelectProps {
  label: string;
  value: string;
  options: LookupOption[];
  onChange: (value: string) => void;
  onCreateNew?: (title: string) => Promise<string | void>;
  required?: boolean;
  placeholder?: string;
}

type StringOption = string;

const filter = createFilterOptions<StringOption>();

const CreatableLookupSelect: React.FC<CreatableLookupSelectProps> = ({
  label,
  value,
  options,
  onChange,
  onCreateNew,
  required,
  placeholder,
}) => {
  const optionTitles = useMemo(() => options.map((o) => o.title), [options]);

  return (
    <Autocomplete
      options={optionTitles}
      value={value || null}
      onChange={async (_, newValue) => {
        if (!newValue) {
          onChange("");
          return;
        }
        if (newValue.startsWith(CREATE_PREFIX)) {
          const title = newValue.slice(CREATE_PREFIX.length);
          if (onCreateNew) await onCreateNew(title);
          onChange(title);
          return;
        }
        onChange(newValue);
      }}
      filterOptions={(opts, params) => {
        const filtered = filter(opts, params);
        const input = params.inputValue.trim();
        if (
          input &&
          onCreateNew &&
          !opts.some((o) => o.toLowerCase() === input.toLowerCase())
        ) {
          filtered.push(`${CREATE_PREFIX}${input}`);
        }
        return filtered;
      }}
      getOptionLabel={(option) =>
        option.startsWith(CREATE_PREFIX)
          ? `Add "${option.slice(CREATE_PREFIX.length)}"`
          : option
      }
      isOptionEqualToValue={(a, b) => a === b}
      renderOption={(props, option) => {
        const isCreate = option.startsWith(CREATE_PREFIX);
        return (
          <Box component="li" {...props} key={option}>
            {isCreate ? (
              <Chip
                icon={<AddCircleOutlineIcon />}
                label={`Add "${option.slice(CREATE_PREFIX.length)}"`}
                size="small"
                color="primary"
                variant="outlined"
              />
            ) : (
              <Typography variant="body2">{option}</Typography>
            )}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          placeholder={placeholder || "Search or type to add new"}
        />
      )}
    />
  );
};

export default CreatableLookupSelect;
