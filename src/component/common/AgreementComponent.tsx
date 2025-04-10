import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Stack,
  useTheme,
} from "@mui/material";

interface AgreementComponentProps {
  isAgreed: boolean;
  setIsAgreed: React.Dispatch<React.SetStateAction<boolean>>;
}

const AgreementComponent = ({
  isAgreed,
  setIsAgreed,
}: AgreementComponentProps) => {
  const theme = useTheme();

  const handleAgreeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAgreed(event.target.checked);
  };

  return (
    <Stack
      spacing={3}
      height={300}
      sx={{
        backgroundColor: theme.palette.background.default,
        padding: 3,
        borderRadius: 2,
        justifyContent: "center",
      }}
    >
      <Typography variant="h6" align="center" color="text.primary">
        Terms and Conditions
      </Typography>

      <Typography variant="body2" color="text.secondary">
        By uploading your documents and submitting personal information, you
        acknowledge that all the details provided are accurate and authentic to
        the best of your knowledge.
        <br />
        <br />
        By proceeding, you express your willingness to engage with{" "}
        <strong>SkyCare Solutions Pvt. Ltd.</strong> for potential employment or
        collaboration opportunities. You understand that the information you
        provide will be used solely for the purpose of verification, onboarding,
        and further communication related to your engagement with the company.
        <br />
        <br />
        We encourage you to review these documents carefully before submitting.
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={isAgreed}
            onChange={handleAgreeChange}
            color="primary"
          />
        }
        label={
          <Typography variant="body2">
            I agree to the Terms and Conditions
          </Typography>
        }
      />
    </Stack>
  );
};

export default AgreementComponent;
