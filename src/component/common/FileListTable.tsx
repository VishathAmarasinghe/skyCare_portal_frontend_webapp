import React from 'react';
import { Table, Button } from 'antd';
import { DownloadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMediaQuery, useTheme } from '@mui/material';

interface File {
    name: string;
  docID: string;
  status:"New" | "Old";
}

interface FileListTableProps {
  files: File[]; // List of files (uploaded or to be uploaded)
  onDownload: (fileName: any) => void;
  onView: (file: any) => void;
  onDelete: (file: any) => void;
  isEditMode: boolean;
}

const FileListTable: React.FC<FileListTableProps> = ({ files, onDownload, onView, onDelete,isEditMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const columns = [
    {
      title: 'No.',
      dataIndex: 'key',
      render: (text: any, record: File, index: number) => index + 1,
    },
    {
      title: 'File Name',
      dataIndex: 'name',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_: any, record: File) => (
        <div>
          <Button
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
            size="small"
            style={{ marginRight: 8 }}
          />
          {/* <Button
            icon={<DownloadOutlined />}
            onClick={() => onDownload(record)}
            size="small"
            style={{ marginRight: 8 }}
          /> */}
          {
            isEditMode && (
              <Button
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record)}
                size="small"
                danger
              />
            )
          }
        </div>
      ),
    },
  ];

  return <Table dataSource={files} columns={columns} pagination={false} rowKey="uid" />;
};

export default FileListTable;
