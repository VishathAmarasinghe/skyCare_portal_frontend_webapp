import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Stack,
  InputAdornment,
  IconButton,
  useTheme,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import companyLogo from "../../assets/images/app_logo.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import {
  resetSubmitState,
  sendOTP,
  validateOTP,
} from "../../slices/oTPSlice/oTP";
import { emailRegex } from "../../constants/index";
import { State } from "../../types/types";
import { resetPassword } from "../../slices/authSlice/auth";
import { enqueueSnackbarMessage } from "../../slices/commonSlice/common";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const [step, setStep] = useState(1); // Tracks the current step
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const otpSlice = useAppSelector((state) => state.otp);
  const authSlice = useAppSelector((state) => state.auth);

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  useEffect(() => {
    if (otpSlice?.submitState === State.success) {
      handleNextStep();
      dispatch(resetSubmitState());
    }
  }, [otpSlice?.submitState]);

  useEffect(() => {
    if (otpSlice?.validateState === State.success) {
      handleNextStep();
      dispatch(resetSubmitState());
    }
  }, [otpSlice?.validateState]);

  useEffect(() => {
    if (authSlice?.passwordResetState === State.success) {
      navigate("/");
    }
  }, [authSlice?.passwordResetState]);

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handeGetOTP = () => {
    if (emailRegex.test(email)) {
      dispatch(sendOTP({ email: email }));
    }
  };

  const handleVerifyOTP = () => {
    if (otp != "") {
      dispatch(validateOTP({ email: email, OTP: otp }));
    }
  };

  const handleSubmit = () => {
    if (password === confirmPassword) {
      if (password.length >= 6) {
        dispatch(
          resetPassword({ email: email, password: password, employeeID: "" })
        );
      }
    } else {
      dispatch(
        enqueueSnackbarMessage({
          message: "Passwords do not match",
          type: "error",
        })
      );
    }
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        padding: 2,
      }}
    >
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Card
          data-aos="fade-up"
          data-aos-duration="500"
          sx={{ boxShadow: 3, borderRadius: 3 }}
        >
          <CardContent>
            <Stack spacing={3} alignItems="center">
              {/* Company Logo */}
              <Box sx={{ textAlign: "center", marginBottom: 1 }}>
                <img
                  src={companyLogo}
                  alt="Company Logo"
                  style={{ maxWidth: "250px", width: "100%" }}
                />
              </Box>

              {/* Step Content */}
              {step === 1 && (
                <Stack spacing={2} sx={{ width: "100%" }}>
                  <Typography variant="h6" fontWeight={600} align="center">
                    Reset Your Password
                  </Typography>
                  <Typography variant="body2" align="center">
                    Enter your email to receive an OTP for resetting your
                    password.
                  </Typography>
                  <TextField
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handeGetOTP}
                    disabled={!email || otpSlice?.submitState === State.loading} // Disable button when loading or email is empty
                    startIcon={
                      otpSlice?.submitState === State.loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : null
                    } // Show spinner as startIcon
                  >
                    {otpSlice?.submitState === State.loading
                      ? "Sending OTP..."
                      : "Send OTP"}{" "}
                    {/* Change text based on loading state */}
                  </Button>
                </Stack>
              )}

              {step === 2 && (
                <Stack spacing={2} sx={{ width: "100%" }}>
                  <Typography variant="h6" fontWeight={600} align="center">
                    Verify OTP
                  </Typography>
                  <Typography variant="body2" align="center">
                    Enter the OTP sent to your email to proceed.
                  </Typography>
                  <TextField
                    fullWidth
                    label="Enter OTP"
                    variant="outlined"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleVerifyOTP}
                    disabled={!otp}
                  >
                    Verify OTP
                  </Button>
                  <Button
                    fullWidth
                    variant="text"
                    size="large"
                    onClick={handlePreviousStep}
                  >
                    Back
                  </Button>
                </Stack>
              )}

              {step === 3 && (
                <Stack spacing={2} sx={{ width: "100%" }}>
                  <Typography variant="h6" fontWeight={600} align="center">
                    Reset Password
                  </Typography>
                  <Typography variant="body2" align="center">
                    Enter and confirm your new password.
                  </Typography>
                  <TextField
                    fullWidth
                    label="New Password"
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={!password || !confirmPassword}
                  >
                    Reset Password
                  </Button>
                  <Button
                    fullWidth
                    variant="text"
                    size="large"
                    onClick={handlePreviousStep}
                  >
                    Back
                  </Button>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ForgetPassword;
