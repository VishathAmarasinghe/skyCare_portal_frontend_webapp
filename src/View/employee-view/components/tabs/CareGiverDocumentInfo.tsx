import { Stack } from "@mui/material";
import React, { useState } from "react";
import CareGiverFileUploader from "../CareGiverFileUploader";
import { CareGiverDocuments } from "@slices/careGiverSlice/careGiver";

const CareGiverDocumentInfo = () => {
  const [IsCareGiverAddModalVisible, setIsCareGiverAddModalVisible] =
    useState<boolean>(true);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [careGiverDocuments, setCareGiverDocuments] = useState<
    CareGiverDocuments[]
  >([]);
  return (
    <Stack>
      <CareGiverFileUploader
        modalOpenState={IsCareGiverAddModalVisible}
        uploadFiles={uploadFiles}
        setUploadFiles={setUploadFiles}
        careGiverDocuments={careGiverDocuments}
        setCareGiverDocuments={setCareGiverDocuments}
        onlyView={true}
      />
    </Stack>
  );
};

export default CareGiverDocumentInfo;
