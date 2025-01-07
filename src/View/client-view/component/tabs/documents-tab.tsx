import { Button, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import DocumentsTable from "../DocumentsTable";
import AddDocumentsModal from "../../modal/AddDocumentsModal";
import {
  ClientDocuments,
  fetchClientDocuments,
  saveClientDocuments,
} from "@slices/clientSlice/client";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@slices/store";
import FileViewerWithModal from "@component/common/FileViewerWithModal";
import { string } from "yup";

const DocumentsTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [fileViewerState, setFileViewerState] = useState<{
    isVisible: boolean;
    file: File | string;
  }>({
    isVisible: false,
    file: "",
  });
  const clientID = searchParams.get("clientID");
  const clientSlice = useAppSelector((state) => state?.clients);
  const dispatch = useAppDispatch();
  const [selectedClientDocument, setSelectedClientDocument] =
    useState<ClientDocuments | null>(null);

  useEffect(() => {
    if (clientID) {
      dispatch(fetchClientDocuments(clientID));
    }
  }, [isModalOpen, clientSlice?.submitState, clientSlice?.updateState]);

  useEffect(() => {
    if (
      selectedClientDocument?.documentLocation != null &&
      selectedClientDocument?.documentLocation != ""
    ) {
      setFileViewerState({
        isVisible: true,
        file: selectedClientDocument?.documentLocation,
      });
    }
  }, [selectedClientDocument]);

  const handleSave = (file: {file:File|null,url:string}) => {
    console.log("Saved files:", file);
    if (file.file != null) {
      const payload: ClientDocuments = {
        clientDocumentID: "",
        clientId: clientID || "",
        createdDate: dayjs().format("YYYY-MM-DD"),
        documentLocation: "",
        documentName: file?.file?.name || "",
        urlLink:file.url
      };
      dispatch(saveClientDocuments({ documents: payload, files: [file.file] }));
    }else{
      if (file.url != "") {
        const payload: ClientDocuments = {
          clientDocumentID: "",
          clientId: clientID || "",
          createdDate: dayjs().format("YYYY-MM-DD"),
          documentLocation: "",
          documentName: file.url,
          urlLink:file.url
        };
        dispatch(saveClientDocuments({ documents: payload, files: [] }));
      }
    }
    
  };

  return (
    <Stack width="100%" height="80%">
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="end"
        justifyContent="flex-end"
      >
        <Button
          variant="contained"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Add Document
        </Button>
        <AddDocumentsModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      </Stack>
      <Stack width="100%" height="480px">
        <DocumentsTable
          selectedClientDocument={selectedClientDocument}
          setSelectedClientDocument={setSelectedClientDocument}
        />
        <FileViewerWithModal
          file={fileViewerState.file}
          isVisible={fileViewerState.isVisible}
          onClose={() => {
            setFileViewerState({ isVisible: false, file: "" }),
              setSelectedClientDocument(null);
          }}
        />
      </Stack>
    </Stack>
  );
};

export default DocumentsTab;
