import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Box, IconButton, Stack, useTheme } from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  getSingleShiftNoteByShiftID,
  updateShiftNote,
} from "../../../slices/shiftNoteSliceName/shiftNote";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { ConfirmationType, State } from "../../../types/types";
import { useConfirmationModalContext } from "../../../context/DialogContext";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter placeholder="Search" />
    </GridToolbarContainer>
  );
}

interface ClientTableProps {
  isNoteModalVisible: boolean;
  setIsNoteModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setPureNew: React.Dispatch<React.SetStateAction<boolean>>;
}

const ShiftNoteTable = ({
  isNoteModalVisible,
  setIsNoteModalVisible,
  setPureNew,
}: ClientTableProps) => {
  const shiftNoteSlice = useAppSelector((state) => state.shiftNotes);
  const [shiftNotes, setShiftNotes] = useState<updateShiftNote[]>([]);
  const dispatch = useAppDispatch();
  const { showConfirmation } = useConfirmationModalContext();
  const theme = useTheme();

  useEffect(() => {
    setShiftNotes(shiftNoteSlice.shiftNotes);
  }, [shiftNoteSlice.state]);

  const handleDeleteNote = (noteID: string) => {
    showConfirmation(
      "Delete Note",
      "Are you sure you want to delete this Note? This action cannot be undone.",
      "accept" as ConfirmationType,
      () => {},
      "Delete",
      "Cancel"
    );
  };

  const initialColumns: GridColDef[] = [
    { field: "noteID", headerName: "Note ID", flex: 1, align: "left" },
    { field: "title", headerName: "Title", align: "left", flex: 2 },
    {
      field: "shiftStartDate",
      headerName: "Start Date",
      align: "left",
      flex: 1,
    },
    {
      field: "shiftStartTime",
      headerName: "Start Time",
      align: "left",
      flex: 1,
    },
    {
      field: "shiftEndDate",
      headerName: "End Date",
      align: "left",
      flex: 1,
    },
    {
      field: "shiftEndTime",
      headerName: "End Time",
      align: "left",
      flex: 1,
    },
    {
      field: "recurrentAppointmentID",
      headerName: "Recurrent Appointment",
      align: "center",
      flex: 1,
    },
    {
      field: "careGiverID",
      headerName: "Care Giver ID",
      align: "left",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      headerAlign: "left",
      renderCell: (params) => (
        <Stack
          width={"100%"}
          flexDirection={"row"}
          justifyContent="space-between"
        >
          <IconButton
            aria-label="view"
            onClick={() => {
              dispatch(getSingleShiftNoteByShiftID(params.row?.noteID));
              setIsNoteModalVisible(true);
              setPureNew(false);
            }}
          >
            <RemoveRedEyeOutlinedIcon />
          </IconButton>
          {/* <IconButton
            aria-label="deleteNote"
            onClick={() => handleDeleteNote(params.row.noteID)}
          >
            <DeleteOutlineIcon />
          </IconButton> */}
        </Stack>
      ),
    },
  ];

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DataGrid
        rows={shiftNotes}
        columns={initialColumns}
        getRowId={(row) => row.noteID}
        density="compact"
        pagination
        loading={shiftNoteSlice.state === State.loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 15 },
          },
        }}
        slots={{
          toolbar: CustomToolbar,
        }}
        sx={{
          flexGrow: 1,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.grey[200],
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
        }}
      />
    </Box>
  );
};

export default ShiftNoteTable;
