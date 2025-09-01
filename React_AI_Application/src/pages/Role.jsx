import React, { useEffect, useState } from "react";
import {
  DataGrid,
  gridClasses
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import axiosInstanceToken from "../utils/axiosInstanceToken";

const columns = [
  { field: "role_name", headerName: "Role name", flex: 2 },
  { field: "description", headerName: "Description", flex: 2 },
];

export default function Role() {
  const [roleData, setRoleData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({page: 0, pageSize: 10});

  const fetchUserRoles = async () => {
    try {
      const response = await axiosInstanceToken.get("/user/role");
      if (response.data.length > 0) {
        setRoleData(response.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const rows = roleData.map(item => ({
    id: item.pk_id,
    role_name: item.name,
    description: item.description
  }));

  
  return (
    <Paper sx={{ height: 450, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        onRowSelectionModelChange={(newSelection) => {
          setSelectedRows(newSelection.ids || new Set());
          console.log(selectedRows);
          console.log(paginationModel);
        }}
        //onRowDoubleClick={handleEdit}
        density="compact"
        rowHeight={45}
        onPaginationModelChange={(model) => setPaginationModel(model)}
        pageSizeOptions={[25, 50, 75, 100]}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 25 } },
        }}

        sx={{
          // Header container (full width background)
          [`& .${gridClasses.columnHeaders}`]: {
            backgroundColor: "#1d2a47ff",
            color: "#fff",
          },
          // Individual column headers
          [`& .${gridClasses.columnHeader}`]: {
            backgroundColor: "#1d2a47ff",
            color: "#fff",
          },
          // Checkbox header (if you use checkboxSelection)
          [`& .${gridClasses.columnHeaderCheckbox}`]: {
            backgroundColor: "#1d2a47ff",
          },
        }}
      />
    </Paper>
  );
}
