import React from "react";
import { Modal, Button } from "antd";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { FILE_DOWNLOAD_BASE_URL, ServiceBaseUrl } from "@config/config";

interface FileViewerWithModalProps {
  file: File | string; // File (from input) or URL (from server)
  isVisible: boolean;
  onClose: () => void;
}

const FileViewerWithModal: React.FC<FileViewerWithModalProps> = ({
  file,
  isVisible,
  onClose,
}) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const isPdf = typeof file === "string" ? file?.endsWith(".pdf") : file?.type === "application/pdf";

  const handleDownload = async () => {
    let fileUrl: string;

    if (typeof file === "string") {
      // If the file is from the server (URL), use the filePath parameter in the query string
      const encodedFilePath = encodeURIComponent(file); // Ensure the filePath is URL-encoded
      fileUrl = `${FILE_DOWNLOAD_BASE_URL}${encodedFilePath}`;
      console.log("fileUrl", fileUrl);
      
    } else {
      // If the file is from an input upload (File object), create a Blob URL
      const fileURL = URL.createObjectURL(file);
      fileUrl = fileURL;
    }

    try {
      // Fetch the file from the backend API (for server files)
      if (typeof file === "string") {
        const response = await fetch(fileUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = file.substring(file.lastIndexOf("/") + 1);
          downloadLink.click();
        } else {
          console.error("Error downloading file");
        }
      } else {
        // Direct download for files uploaded via input
        const downloadLink = document.createElement("a");
        downloadLink.href = fileUrl;
        downloadLink.download = file.name;
        downloadLink.click();
        URL.revokeObjectURL(fileUrl); // Revoke the object URL after download
      }
    } catch (error) {
      console.error("Error during file download:", error);
    }
  };

  return (
    <Modal
      title="File Viewer"
      centered
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="download" type="primary" onClick={handleDownload}>
          Download
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={isPdf ? "80%" : "50%"}
      styles={{ body: { height: "80vh", overflow: "auto" } }}
    >
      {isPdf ? (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer key={typeof file === "string" ? file : file?.name}
            fileUrl={typeof file === "string" ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(file)}` : URL.createObjectURL(file)}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
      ) : (
        <img
          src={typeof file === "string" ? file : URL?.createObjectURL(file)}
          alt="Preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      )}
    </Modal>
  );
};

export default FileViewerWithModal;
