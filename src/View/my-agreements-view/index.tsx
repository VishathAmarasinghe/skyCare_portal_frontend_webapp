import { Stack } from "@mui/material";
import React from "react";
import RecipientAgreementsPanel from "../employee-view/components/RecipientAgreementsPanel";
import { APPLICATION_CLIENT } from "../../config/config";
import { useAppSelector } from "../../slices/store";

const MyAgreementsView = () => {
  const roles = useAppSelector((state) => state.auth.roles);
  const recipientType = roles.includes(APPLICATION_CLIENT) ? "CLIENT" : "WORKER";

  return (
    <Stack width="100%" height="100%">
      <RecipientAgreementsPanel recipientType={recipientType} />
    </Stack>
  );
};

export default MyAgreementsView;
