import React, { useEffect, useState } from "react";
import { Modal, Box, Button, Typography, Stack, TextField } from "@mui/material";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

interface AddDocumentsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (file: {file:File|null,url:string}) => void;
}

const AddDocumentsModal: React.FC<AddDocumentsModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setFileList([]);
      setUploadedFile(null);
      setUrl('');
      setUrlError('');
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
      if (latestFile && latestFile.size > 5 * 1024 * 1024) {
        setFileList([]);
        return false;
      }
      setUploadedFile(latestFile || null);
    } else {
      setUploadedFile(null);
    }
  };

  const validateUrl = (inputUrl: string): boolean => {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlRegex.test(inputUrl);
  };

  const handleSave = () => {
    if (url!="" && !validateUrl(url)) {
      setUrlError("Please enter a valid URL.");
      return;
    }
    onSave({file:uploadedFile,url:url}); // Pass the uploaded file to the parent component
    onClose(); // Close the modal
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    if (urlError) {
      setUrlError(""); // Clear the error if the user starts typing
    }
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
            accept= ".jpg,.jpeg,.png,.gif,.pdf"
            beforeUpload={() => false} // Disable automatic upload
          >
            <Button variant="outlined" startIcon={<UploadOutlined />} fullWidth>
              Upload File
            </Button>
          </Upload>
          <Stack>
            <Typography variant="body2">Please upload images or PDF files less than 5MB</Typography>
          </Stack>
          <TextField
            label="URL"
            variant="outlined"
            fullWidth
            value={url}
            onChange={handleUrlChange}
            error={!!urlError}
            helperText={urlError || "Enter a valid URL (e.g., https://example.com)"}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!uploadedFile && url.trim() === ""}
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
