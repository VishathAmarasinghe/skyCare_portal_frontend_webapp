import React, { useEffect, useState } from 'react';
import { Upload, Table, Tag, Space, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UploadOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import type { UploadProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Button, Typography } from '@mui/material';
import { CareGiverDocuments } from '@slices/CareGiverSlice/careGiver';
import { useAppSelector } from '@slices/store';

export interface DocumentAdder {
  documentTypeID: string;
  documentName: string;
  expDateNeeded: boolean;
  uploadedDocument: File | null;
  expirationDate: string | null;
}

interface CareGiverFileUploaderProps {
  careGiverDocuments: CareGiverDocuments[];
  setCareGiverDocuments: (value: CareGiverDocuments[]) => void;
  uploadFiles:File[];
  setUploadFiles:(value:File[])=>void;
  modalOpenState: boolean;
}

const CareGiverFileUploader = ({modalOpenState, careGiverDocuments, setCareGiverDocuments,uploadFiles,setUploadFiles }: CareGiverFileUploaderProps) => {
  const [openModal, setOpenModal] = useState(false);
  const careGiverSlice = useAppSelector(state => state.careGivers);
  const [selectedDocument, setSelectedDocument] = useState<DocumentAdder | null>(null);
  const [documents, setDocuments] = useState<DocumentAdder[]>([]);

  useEffect(()=>{
    if (!modalOpenState) {
      setUploadFiles([]);
      setDocuments([]);
      setSelectedDocument(null);
      setCareGiverDocuments([]);
    }
  },[modalOpenState])

  useEffect(()=>{
    setUploadFiles(documents.map(doc=>doc.uploadedDocument).filter(Boolean) as File[]);
  },[documents])


  useEffect(() => {
    const createdDocArray = careGiverSlice?.careGiverDocumentTypes?.map((doc) => {
      return {
        documentTypeID: doc.documentTypeID,
        documentName: doc.documentName,
        expDateNeeded: doc.expDateNeeded,
        uploadedDocument: null,
        expirationDate: null,
      };
    });

    const careGiverDocumentArray: CareGiverDocuments[] = careGiverSlice?.careGiverDocumentTypes?.map((doc) => {
      return {
        careGiverID: "",
        documentTypeID: doc.documentTypeID,
        expDate: dayjs().format('YYYY-MM-DD'),
        status: "",
        document: "",
      };
    });

    setDocuments(createdDocArray);
    setCareGiverDocuments(careGiverDocumentArray);
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
          ? { ...doc, uploadedDocument: file }
          : doc
      );
      setDocuments(updatedDocuments);

      const updatedCareGiverDocuments = careGiverDocuments.map((doc) =>
        doc.documentTypeID === selectedDocument.documentTypeID
          ? { ...doc, document: file.name }
          : doc
      );
      setCareGiverDocuments(updatedCareGiverDocuments); // Sync with global state
    }
  };

  const handleDeleteFile = (doc: DocumentAdder) => {
    const updatedDocuments = documents.map((document) =>
      document.documentTypeID === doc.documentTypeID
        ? { ...document, uploadedDocument: null, expirationDate: null }
        : document
    );
    setDocuments(updatedDocuments);

    const updatedCareGiverDocuments = careGiverDocuments.map((document) =>
      document.documentTypeID === doc.documentTypeID
        ? { ...document, document: "" }
        : document
    );
    setCareGiverDocuments(updatedCareGiverDocuments); // Sync with global state
  };

  const handleSaveDocument = (expDate: string) => {
    if (selectedDocument) {
      const updatedDocuments = documents.map((doc) =>
        doc.documentTypeID === selectedDocument.documentTypeID
          ? { ...doc, expirationDate: dayjs(expDate).format('YYYY-MM-DD') }
          : doc
      );
      setDocuments(updatedDocuments);

      const updatedCareGiverDocuments = careGiverDocuments.map((doc) =>
        doc.documentTypeID === selectedDocument.documentTypeID
          ? { ...doc, expDate: dayjs(expDate).format('YYYY-MM-DD') }
          : doc
      );
      setCareGiverDocuments(updatedCareGiverDocuments); // Sync with global state
      handleCloseModal();
    }
  };

  const columns: ColumnsType<DocumentAdder> = [
    {
      title: 'Document Type ID',
      dataIndex: 'documentTypeID',
      key: 'documentTypeID',
    },
    {
      title: 'Document Name',
      dataIndex: 'documentName',
      key: 'documentName',
    },
    {
      title: 'Uploaded Document',
      key: 'uploadedDocument',
      render: (_, record) => (
        record.uploadedDocument ? (
          <Tag color="green">{record.uploadedDocument.name}</Tag>
        ) : (
          <Tag color="volcano">Required</Tag>
        )
      ),
    },
    {
      title: 'Expiration Date',
      key: 'expirationDate',
      render: (_, record) => {
        const today = new Date();
        const expirationDate = record.expirationDate
          ? dayjs(record.expirationDate).toDate()
          : null;

        if (record.expDateNeeded && !record.uploadedDocument) {
          return <Tag color="warning">Expired Date Required</Tag>;
        }

        if (expirationDate && expirationDate < today) {
          return <Tag color="red">Expired</Tag>;
        }

        return expirationDate ? (
          <Tag color="green">Expires on {dayjs(expirationDate).format('YYYY-MM-DD')}</Tag>
        ) : null;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        record.uploadedDocument ? (
          <Space>
            <Button
                color="error"
                variant='outlined'
              onClick={() => handleDeleteFile(record)}
            >
              Delete
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              variant='contained'
              onClick={() => handleOpenModal(record)}
            >
              Upload
            </Button>
          </Space>
        )
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
      <Typography variant='h6'> Upload Documents</Typography>
      <Table
        dataSource={documents}
        columns={columns}
        rowKey="documentTypeID"
      />
      <Modal
        title={`Upload Document: ${selectedDocument?.documentName}`}
        open={openModal}
        centered
        maskClosable={false}
        onCancel={handleCloseModal}
        footer={[
          <Button variant='contained' key="save" onClick={() => handleSaveDocument(selectedDocument?.expirationDate || '')}>
            Save
          </Button>,
          <Button variant='outlined' key="cancel" onClick={handleCloseModal}>
            Cancel
          </Button>
        ]}
      >
        <Upload listType='picture' {...uploadProps}>
          <Button variant='outlined' startIcon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
        {selectedDocument?.expDateNeeded && (
          <div style={{ marginTop: 16 }}>
            <Typography style={{ marginBottom: 8, display: 'block' }}>
              Expiration Date
            </Typography>
            <DatePicker
              style={{ width: '100%' }}
              onChange={(date) =>
                setSelectedDocument((prev) =>
                  prev ? { ...prev, expirationDate: dayjs(date)?.format("YYYY-MM-DD") || null } : prev
                )
              }
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CareGiverFileUploader;
