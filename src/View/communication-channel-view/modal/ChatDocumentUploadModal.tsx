import React, { useEffect, useState } from 'react';
import { Modal, Upload, Button, List, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadFile, UploadProps } from 'antd/es/upload';
import { useAppDispatch } from '@slices/store';
import { enqueueSnackbarMessage } from '@slices/commonSlice/common';
import { saveChatDocuments } from '@slices/chatSlice/chat';

type ChatDocumentUploadModalProps = {
  visible: boolean;
  onClose: () => void;
};



const ChatDocumentUploadModal: React.FC<ChatDocumentUploadModalProps> = ({ visible, onClose }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadList,setUploadList] = useState<File[]>([]);
  const dispatch =useAppDispatch();

  useEffect(()=>{
    if (!visible) {
        setFileList([]);
        setUploadList([])
    }
  },[visible])

  const handleUploadFile = (file: File) => {
    setUploadList((prevUploadList) => [...prevUploadList, file]);
    setFileList((prevFileList) => [
      ...prevFileList,
      { uid: file.name, name: file.name },
    ]);
  };

  const handleSaveUpload=()=>{
    if (uploadList.length>0) {
      dispatch(
        saveChatDocuments({uploadFiles:uploadList})
      );
    }
  }
  

  const uploadProps: UploadProps = {
    fileList,
    multiple: true,
    beforeUpload: (file) => {
      if (file.size > 5 * 1024 * 1024) {
        dispatch(
          enqueueSnackbarMessage({
            message: "File cannot be greater than 5MB",
            type: "error",
          })
        );
        return false;
      }
      handleUploadFile(file);
      return false;
    },
    onRemove: (file) => {
      setFileList((prevFileList) =>
        prevFileList.filter((item) => item.uid !== file.uid)
      );
      setUploadList((prevUploadList) =>
        prevUploadList.filter((item) => item.name !== file.name)
      );
    },
  };
  

  return (
    <Modal title="Upload Documents" open={visible} onCancel={onClose}
    footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          disabled={fileList.length === 0} // Disable if no files are uploaded
          onClick={() => handleSaveUpload()} // Call the onSave prop when Save is clicked
        >
          Save
        </Button>,
      ]}
    >
      <Upload listType="picture" accept=".jpg,.jpeg,.png,.gif,.pdf" {...uploadProps}>
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
      {/* <List
        bordered
        dataSource={fileList}
        renderItem={(item) => (
          <List.Item>{item.name}</List.Item>
        )}
        style={{ marginTop: 16 }}
      /> */}
    </Modal>
  );
};

export default ChatDocumentUploadModal;
