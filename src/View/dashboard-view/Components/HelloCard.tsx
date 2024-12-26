import React from "react";
import { Stack, Typography, useTheme } from "@mui/material";
import hellocard from "../../../assets/images/helloCard.png";
import { useAppSelector } from "../../../slices/store";

const HelloCard = () => {
  const theme = useTheme();
  const authUser = useAppSelector((state) => state.auth.userInfo);
  const loggedUser = useAppSelector((state) => state?.employees?.logedEMployee);
  return (
    <Stack
      width="100%"
      flexDirection="row"
      padding={2}
      borderRadius={2}
      justifyContent={"space-between"}
      sx={{ backgroundColor: theme.palette.primary.main }}
    >
      <Stack>
        <Typography variant="h5" color="white" fontWeight={700}>
          Hello {loggedUser?.firstName}
        </Typography>
        <Typography variant="h6" color="white">
          Welcome to SkyCare Portal
        </Typography>
      </Stack>
      <Stack width={"5%"}>
        <img src={hellocard} alt="HelloCard" />
      </Stack>
    </Stack>
  );
};

export default HelloCard;
