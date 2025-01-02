import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { Divider } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  ChangePasswordDTO,
  Employee,
  EmployeeBasicInfoUpdater,
  updateEmployeeBasicInfo,
  updateUserPassword,
} from "../../../slices/employeeSlice/employee";
import { FILE_DOWNLOAD_BASE_URL } from "../../../config/config";

interface ProfileDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const UploadInput = styled("input")({
  display: "none",
});

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ open, setOpen }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const employeeSlice = useAppSelector((state) => state.employees);
  const [currentUserInfo, setCurrentUserInfo] = useState<Employee | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    null
  );
  const [updatedUserInfo, setUpdatedUserInfo] = useState<Partial<Employee>>({});
  const [uploadedProfilePhoto, setUploadedProfilePhoto] = useState<File | null>(
    null
  );
  const dispatch = useAppDispatch();
  const [passwordUpdater, setPasswordUpdater] =
    useState<EmployeeBasicInfoUpdater>({
      employeeID: "",
      email: "",
      firstName: "",
      lastName: "",
      currentPassword: "",
      newPassword: "",
    });
  const [confirmPassword, setConfirmPassword] = useState<string>(""); // Separate state for confirm password
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (employeeSlice.logedEMployee) {
      setCurrentUserInfo(employeeSlice.logedEMployee);
      setUpdatedUserInfo(employeeSlice.logedEMployee);
      setPasswordUpdater((prev) => ({
        ...prev,
        employeeID: employeeSlice.logedEMployee?.employeeID || "",
        email: employeeSlice.logedEMployee?.email || "",
        firstName: employeeSlice.logedEMployee?.firstName || "",
        lastName: employeeSlice.logedEMployee?.lastName || "",
      }));
    }
  }, [employeeSlice.logedEMployee]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
        setUpdatedUserInfo({
          ...updatedUserInfo,
          profile_photo: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordUpdate = () => {
    if (!validatePasswords()) {
      return; // Do not proceed if passwords are invalid
    }
    // Log password payload without confirmPassword
    const { currentPassword, newPassword } = passwordUpdater;
    const updatePasswordPayload: ChangePasswordDTO = {
      employeeID: employeeSlice.logedEMployee?.employeeID || "",
      currentPassword: currentPassword,
      newPassword: newPassword,
    };
    dispatch(updateUserPassword(updatePasswordPayload));
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordUpdater((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
    }));
    setConfirmPassword("");
    setIsEditMode(false);
    setShowPasswordFields(false);
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
    if (!newOpen) {
      setIsEditMode(false); // Reset edit mode when closing drawer
      setShowPasswordFields(false); // Reset password fields visibility
    }
  };

  const handleInputChange = (
    field: keyof Employee,
    value: string | string[]
  ) => {
    setUpdatedUserInfo({ ...updatedUserInfo, [field]: value });
  };

  const handlePasswordChange = (
    field: keyof EmployeeBasicInfoUpdater,
    value: string
  ) => {
    setPasswordUpdater((prev) => ({ ...prev, [field]: value }));
  };

  const validatePasswords = () => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!passwordUpdater.currentPassword) {
      errors.currentPassword = "Current password is required.";
    }

    if (!passwordUpdater.newPassword) {
      errors.newPassword = "New password is required.";
    }

    if (passwordUpdater.newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setPasswordErrors(errors);

    // Return true if no errors exist
    return Object.values(errors).every((error) => !error);
  };

  const handleSaveProfile = () => {
    // Handle saving basic information

    if (showPasswordFields) {
      if (!validatePasswords()) {
        return; // Do not proceed if passwords are invalid
      }
      // Log password payload without confirmPassword
      const { currentPassword, newPassword } = passwordUpdater;

    }
    const updatedUserInfoPayload = {
      ...updatedUserInfo,
      employeeID: currentUserInfo?.employeeID || "",
    };

    if (updatedUserInfoPayload?.firstName!=""  && updatedUserInfoPayload?.lastName!="" && updatedUserInfoPayload?.email!="") {
      dispatch(
        updateEmployeeBasicInfo({
          employeeData: {employeeID: currentUserInfo?.employeeID || "", 
            firstName: updatedUserInfoPayload?.firstName!, 
            lastName: updatedUserInfoPayload?.lastName!, 
            email: updatedUserInfoPayload?.email!,
            currentPassword:"",
            newPassword:""
          },
          profilePhoto: uploadedProfilePhoto,
        })
      );
    }
    // Update the current user info state
    setCurrentUserInfo({ ...currentUserInfo, ...updatedUserInfo } as Employee);
    setIsEditMode(false);
    setShowPasswordFields(false);
  };

  return (
    <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
      <Box sx={{ width: 300, p: 2 }} role="presentation">
        {/* Header with Edit Toggle */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Profile</Typography>
          <Button
            variant="outlined"
            onClick={() => {
              if (isEditMode) handleSaveProfile();
              setIsEditMode(!isEditMode);
            }}
          >
            {isEditMode ? "Save" : "Edit"}
          </Button>
        </Box>

        {/* Profile Picture */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <label htmlFor="upload-photo">
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: "auto",
                bgcolor: "grey.300",
                cursor: isEditMode ? "pointer" : "default",
              }}
              src={
                profilePhotoPreview ||
                (currentUserInfo?.profile_photo
                  ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                      currentUserInfo.profile_photo
                    )}`
                  : undefined)
              }
            />
          </label>
          {isEditMode && (
            <UploadInput
              accept="image/*"
              id="upload-photo"
              type="file"
              onChange={handleFileUpload}
            />
          )}
          <Typography variant="body2" sx={{ mt: 1 }}>
            {isEditMode ? "Click to upload photo" : "Profile Picture"}
          </Typography>
        </Box>

        {/* Editable Fields */}
        <Box component="form" sx={{ "& .MuiTextField-root": { mb: 2 } }}>
          <TextField
            label="First Name"
            fullWidth
            InputProps={{ readOnly: !isEditMode }}
            value={updatedUserInfo.firstName || ""}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
          />
          <TextField
            label="Last Name"
            fullWidth
            InputProps={{ readOnly: !isEditMode }}
            value={updatedUserInfo.lastName || ""}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
          />
          <TextField
            label="Email"
            fullWidth
            InputProps={{ readOnly: !isEditMode }}
            value={updatedUserInfo.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </Box>

        {/* Change Password Section */}
        <Box sx={{ textAlign: "center" }}>
          <Divider sx={{ mb: 2 }}></Divider>
          {!showPasswordFields ? (
            <Button
              variant="contained"
              onClick={() => setShowPasswordFields(true)}
              sx={{ mt: 2 }}
            >
              Change Password
            </Button>
          ) : (
            <Box>
              <TextField
                label="Current Password"
                type="password"
                fullWidth
                sx={{ mb: 2 }}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword}
                value={passwordUpdater.currentPassword}
                onChange={(e) =>
                  handlePasswordChange("currentPassword", e.target.value)
                }
              />
              <TextField
                label="New Password"
                type="password"
                fullWidth
                sx={{ mb: 2 }}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword}
                value={passwordUpdater.newPassword}
                onChange={(e) =>
                  handlePasswordChange("newPassword", e.target.value)
                }
              />
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                sx={{ mb: 2 }}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                onClick={handlePasswordUpdate}
                sx={{ width: "100%" }}
                variant="contained"
              >
                Save Passowrd
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default ProfileDrawer;
