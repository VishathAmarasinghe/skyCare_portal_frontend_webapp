import React, { useState } from 'react';
import { Modal, Button, TextField, Select, MenuItem, InputLabel, FormControl, Box, IconButton, SelectChangeEvent, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Delete, Visibility } from '@mui/icons-material';
import {IncidentInvolvedParties} from '../../../slices/IncidentSlice/incident';

interface IncidentInvolvedPartiesComponentProps {
    rows: IncidentInvolvedParties[];
    setRows: React.Dispatch<React.SetStateAction<IncidentInvolvedParties[]>>;
}

const IncidentInvolvedPartiesComponent: React.FC<IncidentInvolvedPartiesComponentProps> = ({ rows, setRows }) => {
  
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [formData, setFormData] = useState<IncidentInvolvedParties>({
    partyID: '',
    firstName: '',
    lastName: '',
    email: '',
    workPhoneNo: '',
    type: 'Witness',
  });

  const [viewData, setViewData] = useState<IncidentInvolvedParties | null>(null);

  const handleModalClose = () => {
    setOpenModal(false);
    setFormData({
      partyID: '',
      firstName: '',
      lastName: '',
      email: '',
      workPhoneNo: '',
      type: 'Witness',
    });
  };

  const handleViewModalClose = () => {
    setOpenViewModal(false);
    setViewData(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setFormData((prevData) => ({
      ...prevData,
      type: e.target.value as string,
    }));
  };

  const handleSave = () => {
    const newParty = { ...formData, partyID: `party-${Date.now()}` };
    setRows((prevRows) => [...prevRows, newParty]);
    handleModalClose();
  };

  const handleAdd = () => {
    setOpenModal(true);
  };

  const handleView = (row: IncidentInvolvedParties) => {
    setViewData(row);
    setOpenViewModal(true);
  };

  const handleDelete = (partyID: string) => {
    setRows((prevRows) => prevRows.filter((row) => row.partyID !== partyID));
  };

  const columns: GridColDef[] = [
    { field: 'firstName', headerName: 'First Name', flex: 1 },
    { field: 'lastName', headerName: 'Last Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'workPhoneNo', headerName: 'Work Phone No', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params) => (
        <div>
          <IconButton onClick={() => handleView(params.row)}>
            <Visibility />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.partyID)}>
            <Delete />
          </IconButton>
        </div>
      ),
      width: 150,
    },
  ];

  return (
    <Stack width="100%">
        <Stack flexDirection="column" alignItems="flex-end" mt={2}>
      <Button variant="contained"  color="primary" onClick={handleAdd}>
        Add Party
      </Button>
      </Stack>

      <div style={{ height: 400, width: '100%', marginTop: 20 }}>
        <DataGrid 
        columns={columns} 
        rows={rows.map((row, index) => ({ ...row, id: index }))}  />
      </div>

      {/* Add/Edit Party Modal */}
      <Modal open={openModal} onClose={handleModalClose} aria-labelledby="add-party-modal">
        <Box
          sx={{
            width: 400,
            margin: 'auto',
            padding: 3,
            backgroundColor: 'white',
            borderRadius: 1,
            boxShadow: 24,
            mt: 5,
          }}
        >
          <h2>Add Party Details</h2>
          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Work Phone No"
            name="workPhoneNo"
            value={formData.workPhoneNo}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              onChange={handleSelectChange}
              label="Type"
            >
              <MenuItem value="Witness">Witness</MenuItem>
              <MenuItem value="Involved Party">Involved Party</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleSave} fullWidth>
            Save
          </Button>
        </Box>
      </Modal>

      {/* View Party Modal */}
      <Modal open={openViewModal} onClose={handleViewModalClose} aria-labelledby="view-party-modal">
        <Box
          sx={{
            width: 400,
            margin: 'auto',
            padding: 3,
            backgroundColor: 'white',
            borderRadius: 1,
            boxShadow: 24,
            mt: 5,
          }}
        >
          {viewData && (
            <>
              <h2>View Party Details</h2>
              <TextField
                label="First Name"
                value={viewData.firstName}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Last Name"
                value={viewData.lastName}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Email"
                value={viewData.email}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Work Phone No"
                value={viewData.workPhoneNo}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Type"
                value={viewData.type}
                fullWidth
                margin="normal"
                disabled
              />
            </>
          )}
          <Button variant="contained" color="primary" onClick={handleViewModalClose} fullWidth>
            Close
          </Button>
        </Box>
      </Modal>
    </Stack>
  );
};

export default IncidentInvolvedPartiesComponent;
