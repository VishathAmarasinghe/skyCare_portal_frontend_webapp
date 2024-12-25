import EditIcon from '@mui/icons-material/Edit';
import { Chip } from '@mui/material';

const handleEdit = (row: any) => {
  console.log(row);
}



// Language columns
export const languageColumns = [
  { field: 'languageID', headerName: 'Language ID', flex: 1 },
  { field: 'language', headerName: 'Language', flex: 2 },
  { field: 'languageNotes', headerName: 'Language Notes', flex: 3 },
  {
    field: 'edit',
    headerName: 'Edit',
    flex: 1,
    renderCell: (params: { row: any }) => (
      <EditIcon style={{ cursor: 'pointer' }} onClick={() => handleEdit(params.row)} />
    ),
  },
];

// Client Classification columns
export const clientClassificationColumns = [
  { field: 'classificationID', headerName: 'Classification ID', flex: 2 },
  { field: 'classificationName', headerName: 'Classification Name', flex: 3 },
  {
    field: 'state',
    headerName: 'State',
    flex: 2,
    renderCell: (params: { row: any }) => (
      <Chip
        label={params.row.state === 'Active' ? 'Active' : 'Inactive'}
        color={params.row.state === 'Active' ? 'success' : 'default'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'edit',
    headerName: 'Edit',
    flex: 1,
    renderCell: (params: { row: any }) => (
      <EditIcon style={{ cursor: 'pointer' }} onClick={() => handleEdit(params.row)} />
    ),
  },
];

// Client Type columns
export const clientTypeColumns = [
  { field: 'clientTypeID', headerName: 'Client Type ID', flex: 2 },
  { field: 'name', headerName: 'Name', flex: 2 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 2,
    renderCell: (params: { row: any }) => (
      <Chip
        label={params.row.status === 'Active' ? 'Active' : 'Inactive'}
        color={params.row.status === 'Active' ? 'primary' : 'default'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'edit',
    headerName: 'Edit',
    flex: 1,
    renderCell: (params: { row: any }) => (
      <EditIcon style={{ cursor: 'pointer' }} onClick={() => handleEdit(params.row)} />
    ),
  },
];

// Client Status columns
export const clientStatusColumns = [
  { field: 'clientStatusID', headerName: 'Client Status ID', flex: 2 },
  { field: 'status', headerName: 'Status', flex: 3 },
  {
    field: 'edit',
    headerName: 'Edit',
    flex: 1,
    renderCell: (params: { row: any }) => (
      <EditIcon style={{ cursor: 'pointer' }} onClick={() => handleEdit(params.row)} />
    ),
  },
];

// Care Plan Status columns
export const carePlanStatusColumns = [
  { field: 'careplanStatusID', headerName: 'Care Plan Status ID', flex: 2 },
  { field: 'status', headerName: 'Status', flex: 3 },
  {
    field: 'edit',
    headerName: 'Edit',
    flex: 1,
    renderCell: (params: { row: any }) => (
      <EditIcon style={{ cursor: 'pointer' }} onClick={() => handleEdit(params.row)} />
    ),
  },
];

// Document Type columns
export const documentTypeColumns = [
  { field: 'documentTypeID', headerName: 'Document Type ID', flex: 2 },
  { field: 'documentName', headerName: 'Document Name', flex: 3 },
  {
    field: 'expDateNeeded',
    headerName: 'Expiration Date Needed',
    flex: 2,
    renderCell: (params: { row: any }) => (
      <Chip
        label={params.row.expDateNeeded ? 'Yes' : 'No'}
        color={params.row.expDateNeeded ? 'success' : 'default'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'edit',
    headerName: 'Edit',
    flex: 1,
    renderCell: (params: { row: any }) => (
      <EditIcon style={{ cursor: 'pointer' }} onClick={() => handleEdit(params.row)} />
    ),
  },
];

// Incident Types columns
export const incidentTypeColumns = [
  { field: 'incidentTypeID', headerName: 'Incident Type ID', flex: 2 },
  { field: 'title', headerName: 'Title', flex: 3 },
  { field: 'status', headerName: 'Status', flex: 2 },
  {
    field: 'edit',
    headerName: 'Edit',
    flex: 1,
    renderCell: (params: { row: any; }) => (
      <button onClick={() => handleEdit(params.row)}>
        <EditIcon />
      </button>
    ),
  },
];

// Incident Status columns
export const incidentStatusColumns = [
  { field: 'incidentStatusID', headerName: 'Incident Status ID', flex: 2 },
  { field: 'status', headerName: 'Status', flex: 3,
  renderCell: (params: { row: any; }) => (
    <Chip
      label={params.row.status === 'Active' ? 'Active' : 'Inactive'}
      color={params.row.status === 'Active' ? 'success' : 'default'}
      variant="outlined"
    />)
   },
  {
    field: 'activeStatus',
    headerName: 'Active Status',
    flex: 2,
},
  {
    field: 'edit',
    headerName: 'Edit',
    flex: 1,
    renderCell: (params: { row: any }) => (
      <EditIcon style={{ cursor: 'pointer' }} onClick={() => handleEdit(params.row)} />
    ),
  },
];


export const paymentType = [
  { field: 'paymentTypeID', headerName: 'Payment Type ID', flex: 1 },
  { field: 'state', headerName: 'Status', flex: 1,
  renderCell: (params: { row: any; }) => (
    <Chip
      label={params.row.status === 'Active' ? 'Active' : 'Inactive'}
      color={params.row.status === 'Active' ? 'success' : 'default'}
      variant="outlined"
    />)
   },
  {
    field: 'paymentName',
    headerName: 'Payment Name',
    flex: 3,
},
  {
    field: 'edit',
    headerName: 'Edit',
    flex: 1,
    renderCell: (params: { row: any }) => (
      <EditIcon style={{ cursor: 'pointer' }} onClick={() => handleEdit(params.row)} />
    ),
  },
];

// Appointment Type columns
export const appointmentTypeColumns = [
  { field: 'appointmentTypeID', headerName: 'Appointment Type ID', flex: 2 },
  { field: 'name', headerName: 'Name', flex: 2 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 2,
    renderCell: (params: { row: any }) => (
      <Chip
        label={params.row.status === 'Active' ? 'Active' : 'Inactive'}
        color={params.row.status === 'Active' ? 'success' : 'default'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'color',
    headerName: 'Color',
    flex: 2,
    renderCell: (params: { row: any }) => (
      <div
        style={{
          backgroundColor: params.row.color,
          height: '20px',
          width: '50px',
        }}
      ></div>
    ),
  },
  {
    field: 'edit',
    headerName: 'Edit',
    flex: 1,
    renderCell: (params: { row: any }) => (
      <EditIcon style={{ cursor: 'pointer' }} onClick={() => handleEdit(params.row)} />
    ),
  },
];
