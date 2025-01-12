import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { CarePlanBillablesWithCarePlan, fetchCarePlanBillablesWithCarePlan } from "@slices/carePlanSlice/carePlan";
import { State } from "../../../../types/types";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter placeholder="Search Care Plan Bills" />
    </GridToolbarContainer>
  );
}

const CarePlanBillings = () => {
  const carePlanSlice = useAppSelector((state) => state.carePlans);
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const clientID = searchParams.get("clientID");
  const [carePlanBills, setCarePlanBills] = useState<CarePlanBillablesWithCarePlan[]>([]);

  useEffect(() => {
    dispatch(fetchCarePlanBillablesWithCarePlan());
  }, [dispatch]);

  useEffect(() => {
    if (carePlanSlice?.carePlanBillableList) {
      const filteredBills = carePlanSlice?.carePlanBillableList.filter(
        (bill) => bill?.carePlan?.clientID === clientID
      );      
      setCarePlanBills(filteredBills);
    }
  }, [carePlanSlice?.carePlanBillableList, clientID]);

  const columns: GridColDef[] = [
    { field: "carePlanID", headerName: "Care Plan ID", width: 150, align: "left" },
    { field: "carePlanTitle", headerName: "Care Plan Title", flex:1, align: "left" },
    { field: "billID", headerName: "Bill ID", width: 100, align: "left" },
    { field: "name", headerName: "Bill Name", flex:1, align: "left" },
    {
      field: "amount",
      headerName: "Amount",
      width: 130,
      align: "right",
      renderCell: (params) => (
        <Chip
          size="small"
          label={`$${params.value.toFixed(2)}`}
          sx={{
            backgroundColor: "#E0F7FA",
            fontWeight: "bold",
          }}
        />
      ),
    },
  ];

  const rows = carePlanBills.map((bill) => ({
    id: bill.carePlanBilables.billID,
    carePlanID: bill.carePlan.careplanID,
    carePlanTitle: bill.carePlan.title,
    billID: bill.carePlanBilables.billID,
    name: bill.carePlanBilables.name,
    amount: bill.carePlanBilables.amount,
  }));

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        density="compact"
        pagination
        loading={carePlanSlice.state === State.loading}
        pageSizeOptions={[10,15, 20]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        slots={{
          toolbar: CustomToolbar,
        }}
        sx={{
          height: "100%",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "white",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "white",
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
        }}
      />
    </Box>
  );
};

export default CarePlanBillings;
