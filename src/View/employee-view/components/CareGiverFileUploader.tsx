import React, { useEffect, useState } from "react";
import { Upload, Tag, Space, DatePicker, Modal as AntModal } from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { CareGiverDocuments } from "@slices/careGiverSlice/careGiver";
import { useAppSelector } from "@slices/store";
import FileViewerWithModal from "../../../component/common/FileViewerWithModal";
import UploadIcon from "@mui/icons-material/CloudUpload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

export interface DocumentAdder {
  documentTypeID: string;
  documentName: string;
  expDateNeeded: boolean;
  uploadedDocument: string | null;
  expirationDate: string | null;
  file: File | null;
}

interface CareGiverFileUploaderProps {
  careGiverDocuments: CareGiverDocuments[];
  setCareGiverDocuments: (value: CareGiverDocuments[]) => void;
  uploadFiles: File[];
  setUploadFiles: (value: File[]) => void;
  modalOpenState: boolean;
}

const CareGiverFileUploader = ({
  modalOpenState,
  careGiverDocuments,
  setCareGiverDocuments,
  uploadFiles,
  setUploadFiles,
}: CareGiverFileUploaderProps) => {
  const [openModal, setOpenModal] = useState(false);
  const careGiverSlice = useAppSelector((state) => state.careGivers);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentAdder | null>(null);
  const [documents, setDocuments] = useState<DocumentAdder[]>([]);
  const [fileViewerState, setFileViewerState] = useState({
    isVisible: false,
    file: "" as File | string,
  });

  useEffect(() => {
    if (!modalOpenState) {
      setUploadFiles([]);
      setDocuments([]);
      setSelectedDocument(null);
      setCareGiverDocuments([]);
    }
  }, [modalOpenState]);

  useEffect(() => {
    setUploadFiles(documents.map((doc) => doc.file).filter(Boolean) as File[]);
    setCareGiverDocuments(
      documents.map((doc) => ({
        careGiverID: careGiverSlice.selectedCareGiver?.careGiverID || "",
        documentTypeID: doc.documentTypeID,
        expDate: doc.expirationDate || "",
        status: "Pending",
        document: doc.uploadedDocument || "",
      }))
    );
  }, [documents]);

  useEffect(() => {
    const createdDocArray = careGiverSlice?.careGiverDocumentTypes?.map(
      (doc) => ({
        documentTypeID: doc.documentTypeID,
        documentName: doc.documentName,
        expDateNeeded: doc.expDateNeeded,
        uploadedDocument: null,
        expirationDate: null,
        file: null,
      })
    );

    if (
      careGiverSlice?.selectedCareGiver &&
      careGiverSlice.selectedCareGiver.careGiverDocuments.length > 0
    ) {
      const updatedDocuments = createdDocArray.map((doc) => {
        const foundDocument =
          careGiverSlice?.selectedCareGiver?.careGiverDocuments.find(
            (careGiverDoc) => careGiverDoc.documentTypeID === doc.documentTypeID
          );
        return foundDocument
          ? {
              ...doc,
              uploadedDocument: foundDocument.document,
              expirationDate: foundDocument.expDate,
            }
          : doc;
      });
      setDocuments(updatedDocuments);
      setCareGiverDocuments(
        careGiverSlice.selectedCareGiver.careGiverDocuments.map((doc) => ({
          careGiverID: doc.careGiverID,
          documentTypeID: doc.documentTypeID,
          expDate: doc.expDate,
          status: doc.status,
          document: doc.document,
        }))
      );
    } else {
      setDocuments(createdDocArray);
      setCareGiverDocuments(
        careGiverSlice?.careGiverDocumentTypes?.map((doc) => ({
          careGiverID: "",
          documentTypeID: doc.documentTypeID,
          expDate: dayjs().format("YYYY-MM-DD"),
          status: "",
          document: "",
        }))
      );
    }
  }, [careGiverSlice.supportWorkerState]);

  const handleOpenModal = (doc: DocumentAdder) => {
    setSelectedDocument(doc);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDocument(null);
  };

  const handleUploadFile = (file: File) => {
    if (selectedDocument) {
      const updatedDocuments = documents.map((doc) =>
        doc.documentTypeID === selectedDocument.documentTypeID
          ? { ...doc, uploadedDocument: file.name, file }
          : doc
      );
      setDocuments(updatedDocuments);
    }
  };

  const handleViewFile = (doc: DocumentAdder) => {
    if (doc.file) {
      setFileViewerState({ isVisible: true, file: doc.file });
    } else if (doc.uploadedDocument) {
      setFileViewerState({ isVisible: true, file: doc.uploadedDocument });
    }
  };

  const handleDeleteFile = (doc: DocumentAdder) => {
    const updatedDocuments = documents.map((d) =>
      d.documentTypeID === doc.documentTypeID
        ? { ...d, uploadedDocument: null, file: null }
        : d
    );
    setDocuments(updatedDocuments);
  };

  const columns: GridColDef[] = [
    { field: "documentTypeID", headerName: "ID", flex: 1 },
    { field: "documentName", headerName: "Document Name", flex: 1 },
    {
      field: "uploadedDocument",
      headerName: "Uploaded Document",
      flex: 1,
      renderCell: (params: GridRenderCellParams) =>
        params.row.uploadedDocument ? (
          <Tag color="green">{params.row.uploadedDocument}</Tag>
        ) : (
          <Tag color="volcano">Required</Tag>
        ),
    },
    {
      field: "expirationDate",
      headerName: "Expiration Date",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        const today = new Date();
        const expirationDate = params.row.expirationDate
          ? dayjs(params.row.expirationDate).toDate()
          : null;

        if (params.row.expDateNeeded && !params.row.uploadedDocument) {
          return <Tag color="warning">Expired Date Required</Tag>;
        }

        if (expirationDate && expirationDate < today) {
          return <Tag color="red">Expired</Tag>;
        }

        return expirationDate ? (
          <Tag color="green">
            Expires on {dayjs(expirationDate).format("YYYY-MM-DD")}
          </Tag>
        ) : null;
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Stack width="100%" flexDirection="row">
          {!params.row.uploadedDocument ? (
            <Tooltip title="Upload">
              <IconButton
                color="primary"
                onClick={() => handleOpenModal(params.row)}
                disabled={!!params.row.uploadedDocument}
              >
                <UploadIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="View">
                <IconButton
                  color="info"
                  onClick={() => handleViewFile(params.row)}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={() => handleDeleteFile(params.row)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
    },
  ];

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      handleUploadFile(file);
      return false;
    },
  };

  return (
    <div>
      <Typography variant="h6">Upload Documents</Typography>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={documents}
          columns={columns}
          getRowId={(row) => row.documentTypeID}
          disableRowSelectionOnClick
        />
      </div>
      <AntModal
        title={`Upload Document: ${selectedDocument?.documentName}`}
        open={openModal}
        centered
        maskClosable={false}
        onCancel={handleCloseModal}
        footer={[
          <Button
            variant="contained"
            key="save"
            onClick={() => handleCloseModal()}
          >
            Save
          </Button>,
          <Button variant="outlined" key="cancel" onClick={handleCloseModal}>
            Cancel
          </Button>,
        ]}
      >
        <Upload listType="picture" {...uploadProps}>
          <Button variant="outlined" startIcon={<UploadOutlined />}>
            Click to Upload
          </Button>
        </Upload>
        {selectedDocument?.expDateNeeded && (
          <div style={{ marginTop: 16 }}>
            <Typography style={{ marginBottom: 8, display: "block" }}>
              Expiration Date
            </Typography>
            <DatePicker
              style={{ width: "100%" }}
              onChange={(date) =>
                setSelectedDocument((prev) =>
                  prev
                    ? {
                        ...prev,
                        expirationDate:
                          dayjs(date)?.format("YYYY-MM-DD") || null,
                      }
                    : prev
                )
              }
            />
          </div>
        )}
      </AntModal>

      <FileViewerWithModal
        file={fileViewerState.file!}
        isVisible={fileViewerState.isVisible}
        onClose={() => setFileViewerState({ isVisible: false, file: "" })}
      />
    </div>
  );
};

export default CareGiverFileUploader;
