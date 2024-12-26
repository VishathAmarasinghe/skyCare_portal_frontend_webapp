import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  deleteNotes,
  fetchSingleNote,
  Notes,
} from "../../../slices/notesSliceName/notes";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { ConfirmationType, State } from "../../../types/types";
import { useConfirmationModalContext } from "../../../context/DialogContext";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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
}

const NotesTable = ({
  isNoteModalVisible,
  setIsNoteModalVisible,
}: ClientTableProps) => {
  const noteDetails = useAppSelector((state) => state.notes);
  const [notes, setNotes] = useState<Notes[]>([]);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { showConfirmation } = useConfirmationModalContext();

  useEffect(() => {
    setNotes(noteDetails.notes);
  }, [noteDetails.State]);

  const handleDeleteNote = (noteID: string) => {
    showConfirmation(
      "Delete Note",
      "Are you sure you want to delete this Note? This action cannot be undone.",
      "accept" as ConfirmationType,
      () => dispatch(deleteNotes({ noteID: noteID })),
      "Delete",
      "Cancel"
    );
  };

  const initialColumns: GridColDef[] = [
    { field: "noteID", headerName: "Note ID", width: 100, align: "left" },
    { field: "title", headerName: "Title", align: "left", width: 280 },
    {
      field: "createdBy",
      headerName: "Created By",
      align: "left",
      headerAlign: "left",
      renderCell: (params) => (
        <Chip
          size="small"
          avatar={
            <Avatar>{params.row.createdBy.charAt(0).toUpperCase()}</Avatar>
          }
          label={params.value}
          variant="outlined"
        />
      ),
    },
    {
      field: "noteType",
      headerName: "Note Type",
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          variant="outlined"
          sx={{
            backgroundColor:
              params.value === "Internal Note" ? "#A6C8FF" : "#4CAF50",
          }}
        />
      ),
    },
    {
      field: "description",
      headerName: "Description",
      headerAlign: "left",
      align: "left",
      flex: 1,
      renderCell: (params) => (
        <Stack
          width={"100%"}
          height={"100%"}
          alignItems={"center"}
          flexDirection={"row"}
        >
          <Tooltip
            title={params.value}
            children={
              <Typography variant="body2" noWrap>
                {params.value}
              </Typography>
            }
          />
        </Stack>
      ),
    },
    {
      field: "sharedGroup",
      headerName: "Shared Group",
      width: 150,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      headerAlign: "left",
      renderCell: (params) => {
        const navigate = useNavigate();
        return (
          <Stack width={"100%"} flexDirection={"row"}>
            <IconButton
              aria-label="view"
              onClick={() => {
                dispatch(fetchSingleNote(params.row?.noteID));
                setIsNoteModalVisible(true);
              }}
            >
              <RemoveRedEyeOutlinedIcon />
            </IconButton>

            <IconButton
              aria-label="deleteNote"
              onClick={() => {
                handleDeleteNote(params.row.noteID);
              }}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={notes}
        columns={initialColumns}
        getRowId={(row) => row.noteID}
        density="compact"
        pagination
        loading={noteDetails.State === State.loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5 },
          },
        }}
        slots={{
          toolbar: CustomToolbar,
        }}
        sx={{
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

export default NotesTable;
