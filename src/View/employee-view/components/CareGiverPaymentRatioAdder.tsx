import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Stack, TextField } from "@mui/material";
import { useAppSelector } from "../../../slices/store";
import { CareGiverPayments } from "../../../slices/careGiverSlice/careGiver";
import { State } from "../../../types/types";

interface CareGiverPaymentRatioAdderProps {
  careGiverPayments: CareGiverPayments[];
  setCareGiverPayments: (value: CareGiverPayments[]) => void;
  modalOpenState: boolean;
  isEditable: boolean;
}

interface Payment {
  paymentTypeID: string;
  paymentName: string;
  amount: string; // Temporarily store as string for intermediate input
}

const CareGiverPaymentRatioAdder = ({
  modalOpenState,
  careGiverPayments,
  setCareGiverPayments,
  isEditable,
}: CareGiverPaymentRatioAdderProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);

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

    const createdPaymentArray = validPaymentArray?.map((payment) => ({
      paymentTypeID: payment.paymentTypeID,
      paymentName: payment.paymentName,
      amount: "0.0",
    }));

    const careGiverPaymentArray: CareGiverPayments[] = createdPaymentArray?.map(
      (payment) => ({
        careGiverID: "",
        paymentTypeID: payment.paymentTypeID,
        amount: 0,
      })
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

      createdPaymentArray.forEach((payment) => {
        const matchingPayment =
          careGiverSlice?.selectedCareGiver?.careGiverPayments.find(
            (careGiverPayment) =>
              careGiverPayment.paymentTypeID === payment.paymentTypeID
          );
        if (matchingPayment) {
          payment.amount = matchingPayment.amount.toFixed(1); // Ensure formatted amount
        }
      });
    }
    setCareGiverPayments(careGiverPaymentArray);
    setPayments(createdPaymentArray);
  }, [careGiverSlice.supportWorkerState]);

  const handleAmountChange = (id: string, value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setPayments((prev) =>
        prev.map((payment) =>
          payment.paymentTypeID === id ? { ...payment, amount: value } : payment
        )
      );
    }
  };

  const finalizeAmount = (id: string) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.paymentTypeID === id
          ? {
              ...payment,
              amount: payment.amount.endsWith(".")
                ? `${payment.amount}0`
                : parseFloat(payment.amount || "0").toFixed(1),
            }
          : payment
      )
    );

    const payment = careGiverPayments.find(
      (payment) => payment.paymentTypeID === id
    );
    if (payment) {
      payment.amount = parseFloat(
        payments.find((p) => p.paymentTypeID === id)?.amount || "0"
      );
    }

    setCareGiverPayments([...careGiverPayments]);
  };

  const columns: GridColDef[] = [
    { field: "paymentTypeID", headerName: "Payment Type ID", width: 150 },
    { field: "paymentName", headerName: "Payment Name", flex: 1 },
    {
      field: "amount",
      headerName: "Amount (AUD)",
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
            onBlur={() => finalizeAmount(params.row.paymentTypeID)}
            size="small"
            fullWidth
            inputProps={{
              inputMode: "decimal",
              pattern: "[0-9]*[.,]?[0-9]*",
              readOnly: isEditable,
            }}
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
        loading={careGiverSlice?.supportWorkerState === State.loading}
        getRowId={(row) => row.paymentTypeID}
      />
    </Box>
  );
};

export default CareGiverPaymentRatioAdder;
