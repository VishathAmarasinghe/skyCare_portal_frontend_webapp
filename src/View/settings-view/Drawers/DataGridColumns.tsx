import EditIcon from '@mui/icons-material/Edit';

// Language columns
export const languageColumns = [
  { field: 'languageID', headerName: 'Language ID', flex: 1 },
  { field: 'language', headerName: 'Language', flex: 2 },
  { field: 'languageNotes', headerName: 'Language Notes', flex: 3 },
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

// Client Classification columns
export const clientClassificationColumns = [
  { field: 'classificationID', headerName: 'Classification ID', flex: 2 },
  { field: 'classificationName', headerName: 'Classification Name', flex: 3 },
  {
    field: 'state',
    headerName: 'State',
    flex: 2,
    renderCell: (params: { row: any; }) => (
      <button onClick={() => toggleState(params.row)}>Active/Inactive</button>
    ),
  },
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

// Client Type columns
export const clientTypeColumns = [
  { field: 'clientTypeID', headerName: 'Client Type ID', flex: 2 },
  { field: 'name', headerName: 'Name', flex: 2 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 2,
    renderCell: (params: { row: any; }) => (
      <button onClick={() => toggleState(params.row)}>Active/Inactive</button>
    ),
  },
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

// Client Status columns
export const clientStatusColumns = [
  { field: 'clientStatusID', headerName: 'Client Status ID', flex: 2 },
  { field: 'status', headerName: 'Status', flex: 3 },
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

// Care Plan Status columns
export const carePlanStatusColumns = [
  { field: 'careplanStatusID', headerName: 'Care Plan Status ID', flex: 2 },
  { field: 'status', headerName: 'Status', flex: 3 },
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

// Document Type columns
export const documentTypeColumns = [
  { field: 'documentTypeID', headerName: 'Document Type ID', flex: 2 },
  { field: 'documentName', headerName: 'Document Name', flex: 3 },
  {
    field: 'expDateNeeded',
    headerName: 'Expiration Date Needed',
    flex: 2,
    renderCell: (params: { row: { expDateNeeded: any; }; }) => (
      <button onClick={() => toggleExpDateNeeded(params.row)}>
        {params.row.expDateNeeded ? 'Yes' : 'No'}
      </button>
    ),
  },
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
  { field: 'status', headerName: 'Status', flex: 3 },
  {
    field: 'activeStatus',
    headerName: 'Active Status',
    flex: 2,
    renderCell: (params: { row: any; }) => (
      <button onClick={() => toggleState(params.row)}>Active/Inactive</button>
    ),
  },
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

// Appointment Type columns
export const appointmentTypeColumns = [
  { field: 'appointmentTypeID', headerName: 'Appointment Type ID', flex: 2 },
  { field: 'name', headerName: 'Name', flex: 2 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 2,
    renderCell: (params: { row: { status: string; }; }) => (
      <button onClick={() => toggleState(params.row)}>
        {params.row.status === 'Active' ? 'Active' : 'Inactive'}
      </button>
    ),
  },
  {
    field: 'color',
    headerName: 'Color',
    flex: 2,
    renderCell: (params: { row: { color: any; }; }) => (
      <div style={{ backgroundColor: params.row.color, height: '20px', width: '50px' }}></div>
    ),
  },
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

function handleEdit(row: any): void {
    console.log('Editing row:', row);
}

function toggleState(row: any): void {
    console.log('Toggling state for row:', row);
    row.status = row.status === 'Active' ? 'Inactive' : 'Active'; // Toggle state between Active and Inactive
}

function toggleExpDateNeeded(row: any): void {
    console.log('Toggling expiration date needed for row:', row);
    row.expDateNeeded = !row.expDateNeeded;
}
