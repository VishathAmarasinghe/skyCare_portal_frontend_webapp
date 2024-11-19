import React, { useEffect, useState } from 'react';
import { Typography, Stack, useTheme } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 

interface CustomRichTextFieldProps {
  label: string;
  value: string;
  name: string;
  height?: string;
  onChange: (value: string) => void;
  error?: boolean;
  placeholder?: string;
  richTextColor?: string;
  helperText?: string;
  required?: boolean;
  id?: string;
  touched?: boolean; 
  setFieldTouched: (field: string, touched: boolean) => void;
}

const CustomRichTextField: React.FC<CustomRichTextFieldProps> = ({
  label,
  value,
  name,
  richTextColor,
  onChange,
  height = '250px',
  placeholder,
  error = false,
  helperText = '',
  required = false,
  id = 'richTextEditor',
  touched = false, 
  setFieldTouched,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const theme = useTheme();

  const showError = (error && (isFocused || touched));

  return (
    <Stack spacing={1} width="100%" my={1}>
      <Typography variant="body2" fontWeight={500} component="label" htmlFor={id}>
        {label} {required && <Typography component="span" color="red">*</Typography>}
      </Typography>
      <Stack
        sx={{
          overflow: 'hidden',
          minHeight: {height},
          maxHeight: {height},
          overflowY: 'auto',
          borderRadius: '4px',
          border: showError ? '1px solid red' :   `0.5px solid ${theme.palette.grey[200]}`,
        }}
      >
        <ReactQuill
          key={placeholder}
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          id={id}
          style={{ minHeight: '180px', height:height,overflowY:"hidden", border: 'none' }} 
          onFocus={() => setIsFocused(true)} 
          onBlur={() => {
            setIsFocused(false); 
            setFieldTouched(name, true); 
          }}
        />
      </Stack>

      {showError && ( 
        <Typography variant="caption" color="error">
          {helperText}
        </Typography>
      )}
    </Stack>
  );
};

export default CustomRichTextField;
