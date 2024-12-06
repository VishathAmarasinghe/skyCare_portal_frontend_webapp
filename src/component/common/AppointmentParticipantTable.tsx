import React from "react";
import { Button } from "@mui/material";
import { Table } from "antd";
import DeleteIcon from "@mui/icons-material/Delete";

interface Caregiver {
  careGiverID: string;
  name: string;
  status: string;
}

interface AppointmentParticipantTableProps {
  caregivers: Caregiver[];
  onDelete: (id: string) => void;
}

const AppointmentParticipantTable: React.FC<AppointmentParticipantTableProps> = ({
  caregivers,
  onDelete,
}) => {
    const columns = [
        {
          title: 'Caregiver ID',
          dataIndex: 'careGiverID',
        },
        {
          title: 'Name',
          dataIndex: 'name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
          },
        {
          title: 'Actin',
          dataIndex: 'action',
          render: (_: any, record: any) => (
            <div>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => onDelete(record.careGiverID)}
                size="small"
                style={{ marginRight: 8 }}
              />
            </div>
          ),
        },
      ];
    
      return <Table dataSource={caregivers} columns={columns} pagination={false} rowKey="uid" />;
};

export default AppointmentParticipantTable;
