import React, { useEffect, useState } from "react";
import { Modal, Box, Button, Typography, Stack } from "@mui/material";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

interface AddDocumentsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (file: File | null) => void;
}

const AddDocumentsModal: React.FC<AddDocumentsModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setFileList([]);
      setUploadedFile(null);
    }
  }, [open]);

  const handleFileChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setFileList(newFileList);

    // Extract the file object from the new file list and set it to uploadedFile
    if (newFileList.length > 0) {
      const latestFile = newFileList[0].originFileObj;
      setUploadedFile(latestFile || null);
    } else {
      setUploadedFile(null);
    }
  };

  const handleSave = () => {
    onSave(uploadedFile); // Pass the uploaded file to the parent component
    onClose(); // Close the modal
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="add-documents-modal">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Add Documents
        </Typography>
        <Stack spacing={2}>
          <Upload
            fileList={fileList}
            onChange={handleFileChange}
            listType="picture"
            beforeUpload={() => false} // Disable automatic upload
          >
            <Button variant="outlined" startIcon={<UploadOutlined />} fullWidth>
              Upload File
            </Button>
          </Upload>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!uploadedFile} // Disable save if no file is selected
            >
              Save
            </Button>
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default AddDocumentsModal;
