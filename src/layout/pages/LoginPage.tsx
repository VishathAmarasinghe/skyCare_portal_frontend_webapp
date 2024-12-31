import React, { useState } from "react";
import {
  Stack,
  Button,
  Typography,
  TextField,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LoginImage from "../../assets/images/loginImage.png";
import CompanyLogo from "../../assets/images/app_logo.png";
import { emailRegex } from "../../constants/index";
import { useAppDispatch } from "../../slices/store";
import { login } from "../../slices/authSlice/auth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleClickShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  // Validate email using a regex pattern
  const validateEmail = (email: string) => {
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Validate email and password
    let valid = true;
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email.");
      valid = false;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    }

    if (valid) {
      // Handle login submission logic
      console.log("Email:", email);
      console.log("Password:", password);
      dispatch(login({ email, password }));
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#E7F6FC",
        minHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
        margin: "auto",
      }}
    >
      <Stack width={"90%"} flexDirection={"column"}>
        <Stack
          mb={1}
          width={"100%"}
          height={"50px"}
          alignItems="flex-end"
        ></Stack>
        <Stack
          mb={10}
          width="100%"
          sx={{
            flexDirection: {
              xs: "column", // Stacked layout for mobile
              sm: "column", // Stacked layout for small screens
              md: "row", // Row layout for medium and large screens
              lg: "row",
              xl: "row",
            },
            justifyContent: "space-around",
            alignItems: "center",
            gap: 4, // Adds space between the two sections
          }}
        >
          {/* Login Form */}
          <Stack
            data-aos="fade-up"
            data-aos-duration="500"
            spacing={3}
            sx={{
              backgroundColor: "white",
              padding: 4,
              borderRadius: 2,
              boxShadow: 3,
              width: { xs: "100%", sm: "400px", md: "400px" }, // Responsive width
            }}
          >
            {/* Header Text */}
            <Typography variant="h4" align="center" sx={{ fontWeight: "bold" }}>
              Login
            </Typography>
            <img
              src={CompanyLogo}
              alt="Login Illustration"
              style={{
                maxWidth: "250px",
                objectFit: "contain",
                margin: "auto",
              }}
            />

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={3} p={2}>
                {/* Email Field */}
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  error={!!emailError}
                  helperText={emailError}
                />

                {/* Password Field */}
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  error={!!passwordError}
                  helperText={passwordError}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />

                {/* Forgot Password Link */}
                <Typography
                  variant="body2"
                  align="right"
                  onClick={() => navigate("/reset-password")}
                  sx={{
                    cursor: "pointer",
                    textDecoration: "underline",
                    color: "#1976d2",
                  }}
                >
                  Forgot Password?
                </Typography>

                {/* Submit Button */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  type="submit"
                >
                  Login
                </Button>
              </Stack>
            </form>
          </Stack>

          {/* Large Image Section */}
          <Stack
            spacing={2}
            sx={{
              display: { xs: "none", sm: "block" }, // Hide on mobile, show on larger screens
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              data-aos="fade-up"
              data-aos-duration="500"
              src={LoginImage} // Placeholder image, replace with your actual image
              alt="Login Illustration"
              style={{
                width: "100%",
                maxWidth: "350px", // Adjust max width
                objectFit: "contain",
              }}
            />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default LoginPage;
