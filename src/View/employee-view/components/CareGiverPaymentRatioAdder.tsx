import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Stack, TextField } from "@mui/material";
import { useAppSelector } from "@slices/store";
import { CareGiverPayments } from "@slices/careGiverSlice/careGiver";
import { State } from "../../../types/types";

interface CareGiverPaymentRatioAdderProps {
  careGiverPayments: CareGiverPayments[];
  setCareGiverPayments: (value: CareGiverPayments[]) => void;
  modalOpenState: boolean;
}

const CareGiverPaymentRatioAdder = ({
  modalOpenState,
  careGiverPayments,
  setCareGiverPayments,
}: CareGiverPaymentRatioAdderProps) => {
  const [payments, setPayments] = useState<
    { paymentTypeID: string; paymentName: string; amount: number }[]
  >([]);

  const careGiverSlice = useAppSelector((state) => state.careGivers);

  useEffect(() => {
    if (!modalOpenState) {
      setPayments([]);
      setCareGiverPayments([]);
    }
  }, [modalOpenState]);

  useEffect(() => {
    const validPaymentArray = careGiverSlice?.careGiverPaymentTypes?.filter(
      (payment) => payment?.state === "Active"
    );

    const createdPaymentArray = validPaymentArray?.map((payment) => {
      return {
        paymentTypeID: payment.paymentTypeID,
        paymentName: payment.paymentName,
        amount: 0,
      };
    });

    const careGiverPaymentArray: CareGiverPayments[] = createdPaymentArray?.map(
      (payments) => {
        return {
          careGiverID: "",
          paymentTypeID: payments.paymentTypeID,
          amount: 0,
        };
      }
    );
    if (careGiverSlice?.selectedCareGiver?.careGiverPayments) {
      careGiverPaymentArray.forEach((payment) => {
        const matchingPayment =
          careGiverSlice?.selectedCareGiver?.careGiverPayments.find(
            (careGiverPayment) =>
              careGiverPayment.paymentTypeID === payment.paymentTypeID
          );
        if (matchingPayment) {
          payment.amount = matchingPayment.amount; // Update amount if matching payment exists
        }
      });

      // Update careGiverPaymentArray with corresponding values from selectedCareGiver.careGiverPayments
      createdPaymentArray.forEach((payment) => {
        const matchingPayment =
          careGiverSlice?.selectedCareGiver?.careGiverPayments.find(
            (careGiverPayment) =>
              careGiverPayment.paymentTypeID === payment.paymentTypeID
          );
        if (matchingPayment) {
          payment.amount = matchingPayment.amount; // Update amount if matching payment exists
        }
      });
    }
    setCareGiverPayments(careGiverPaymentArray);
    setPayments(createdPaymentArray);
  }, [careGiverSlice.supportWorkerState]);

  const handleAmountChange = (id: string, value: string) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.paymentTypeID === id
          ? { ...payment, amount: Number(value) }
          : payment
      )
    );
    const payment = careGiverPayments?.find(
      (payment) => payment?.paymentTypeID === id
    );
    if (payment) {
      payment.amount = Number(value);
    }
    setCareGiverPayments([...careGiverPayments]);
  };

  const columns: GridColDef[] = [
    { field: "paymentTypeID", headerName: "Payment Type ID", width: 150 },
    { field: "paymentName", headerName: "Payment Name", flex: 1 },
    {
      field: "amount",
      headerName: "Amount",
      width: 150,
      renderCell: (params) => (
        <Stack
          height={"100%"}
          flexDirection={"column"}
          alignItems="center"
          justifyContent="center"
        >
          <TextField
            value={params.row.amount}
            onChange={(e) =>
              handleAmountChange(params.row.paymentTypeID, e.target.value)
            }
            size="small"
            fullWidth
          />
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={payments}
        columns={columns}
        loading={careGiverSlice?.supportWorkerState === State?.loading}
        getRowId={(row) => row?.paymentTypeID}
      />
    </Box>
  );
};

export default CareGiverPaymentRatioAdder;
