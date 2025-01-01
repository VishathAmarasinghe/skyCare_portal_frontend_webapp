import { Stack } from "@mui/material";
import React, { useState } from "react";
import CareGiverPaymentRatioAdder from "../CareGiverPaymentRatioAdder";
import { CareGiverPayments } from "@slices/careGiverSlice/careGiver";

const CareGiverPaymentInfo = () => {
  const [IsCareGiverAddModalVisible, setIsCareGiverAddModalVisible] =
    useState<boolean>(true);
  const [careGiverPayments, setCareGiverPayments] = useState<
    CareGiverPayments[]
  >([]);

  return (
    <Stack>
      <CareGiverPaymentRatioAdder
        modalOpenState={IsCareGiverAddModalVisible}
        careGiverPayments={careGiverPayments}
        setCareGiverPayments={setCareGiverPayments}
        isEditable={false}
      />
    </Stack>
  );
};

export default CareGiverPaymentInfo;
