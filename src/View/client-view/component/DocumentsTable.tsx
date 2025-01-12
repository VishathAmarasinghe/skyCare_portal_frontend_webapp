import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { IconButton, Box, Stack } from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useAppDispatch, useAppSelector } from "@slices/store";
import {
  ClientDocuments,
  deleteClientDocument,
} from "@slices/clientSlice/client";
import { useConfirmationModalContext } from "../../../context/DialogContext";
import { ConfirmationType } from "../../../types/types";

const CustomToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarFilterButton />
    <GridToolbarQuickFilter placeholder="Search documents" />
  </GridToolbarContainer>
);

interface DocumentTableProps {
  selectedClientDocument: ClientDocuments | null;
  setSelectedClientDocument: React.Dispatch<
    React.SetStateAction<ClientDocuments | null>
  >;
}

const DocumentsTable = ({
  selectedClientDocument,
  setSelectedClientDocument,
}: DocumentTableProps) => {
  const [documents, setDocuments] = useState<ClientDocuments[]>([]);
  const clientSlice = useAppSelector((state) => state?.clients);
  const { showConfirmation } = useConfirmationModalContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setDocuments(clientSlice?.clientDocuments);
  }, [clientSlice?.State, clientSlice?.submitState, clientSlice?.updateState]);

  const columns: GridColDef[] = [
    {
      field: "clientDocumentID",
      headerName: "Document ID",
      width: 150,
    },
    {
      field: "documentName",
      headerName: "Document Name",
      flex: 1,
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      width: 150,
    },
    {
      field: "urlLink",
      headerName: "URL",
      width: 150,
      renderCell: (params) => {
        const url = params.row.urlLink; // The URL string from the row data
        return (
          url!="" && url!=null &&
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: "#1976d2", textDecoration: "underline" }}
          >
            Open Link
          </a>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {
            params?.row?.documentName!="Document Linked" ?
            <IconButton
            aria-label="view"
            onClick={() => {
              setSelectedClientDocument(params?.row);
            }}
          >
            <RemoveRedEyeOutlinedIcon />
          </IconButton> : null
          }
          
          <IconButton
            aria-label="delete"
            onClick={() => {
              showConfirmation(
                "Delete Document",
                "Are you sure you want to delete this document? This action cannot be undone.",
                "accept" as ConfirmationType,
                () =>
                  dispatch(deleteClientDocument(params?.row?.clientDocumentID)),
                "Delete Now",
                "Cancel"
              );
            }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={documents}
        columns={columns}
        getRowId={(row) => row.clientDocumentID}
        density="compact"
        pagination
        pageSizeOptions={[5, 10, 20]}
        paginationModel={{ pageSize: 5, page: 0 }}
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

export default DocumentsTable;
