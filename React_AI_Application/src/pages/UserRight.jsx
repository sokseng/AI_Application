import React, { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import useUserStore from "../store/useUserStore";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Box,
  Fade
} from "@mui/material";
import { useBottomBar } from "../components/layout/BottomBarContext";
import axiosInstanceToken from "../utils/axiosInstanceToken";
import UserRightTree from "../components/UserRightTree";
import { treeData, getDefaultRights, buildNestedObject } from "../utils/rights";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { mergeRights } from "../utils/mergeRights";
import { useSnackbar } from "../../src/components/shared/SnackbarContext";

const columns = [
  { field: "name", headerName: "Right name", flex: 1 },
  { field: "description", headerName: "Description", flex: 1 },
];

export default function Role() {
  const { userRights } = useUserStore();
  const { setButtons } = useBottomBar();
  const [rightsData, setRightsData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ pk_id: null, name: "", description: "" });
  const [rights, setRights] = useState(getDefaultRights(treeData));
  const [tabIndex, setTabIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const { showSnackbar } = useSnackbar();
  const [setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const canAccessAddUserRight = userRights?.UserManagement?.UserRightRights?.CanAdd ?? false;
  const canAccessEditUserRight = userRights?.UserManagement?.UserRightRights?.CanEdit ?? false;
  const canAccessDeleteUserRight = userRights?.UserManagement?.UserRightRights?.CanDelete ?? false;

  // Fetch rights data
  const fetchUserRights = async () => {
    try {
      const response = await axiosInstanceToken.get("/user/right");
      if (response.data.length > 0) {
        setRightsData(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch user right data", err);
    }
  };

  const initButtons = () => {
    const btns = [];

    if (canAccessAddUserRight) {
      btns.push({
        label: "Add",
        onClick: () => handleOpenSave(),
      });
    }

    if (canAccessDeleteUserRight) {
      btns.push({
        label: "Delete",
        onClick: () => alert("Delete clicked"),
      });
    }

    return btns;
  }

  useEffect(() => {
    fetchUserRights();
    setButtons(initButtons());
    return () => setButtons([]);
  }, [setButtons]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;   //get field name + value
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    //clear only this field’s error
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleOpenSave = () => {
    setFormData({ pk_id: null, name: "", description: "" });
    setRights(getDefaultRights(treeData));
    setTabIndex(0);
    setDialogOpen(true);
  };

  // Handle save
  const handleSave = async () => {
    try {
      if (formData.name === '') {
        setErrors({ name: 'Right name is required' });
        return
      }
      const rightsDefault = buildNestedObject(rights);

      const response = await axiosInstanceToken.post("/user/right",
        {
          pk_id: formData.pk_id,
          name: formData.name,
          description: formData.description,
          rights: rightsDefault
        }
      );

      if (response.data) {
        fetchUserRights();
        setDialogOpen(false);
        showSnackbar("Saved successfully!", "success");
      }

    } catch (err) {
      console.error("Failed to save right", err);
      if (err.response && err.response.status === 400 && err.response.data.detail === "Right name already exists") {
        showSnackbar("Right name already exists", "error");
        setErrors({ name: 'duplicate' });
      } else {
        showSnackbar("Failed to save right", "error");
      }
    }
  };

  const handleEdit = async (params) => {
    try {
      if(!canAccessEditUserRight){
        showSnackbar("You don't have permission to edit user right", "info");
        return;
      }
      const rowData = params.row;
      if (!rowData || rowData.id <= 0) return;

      setFormData({
        pk_id: rowData.pk_id,
        name: rowData.name,
        description: rowData.description,
      });

      const response = await axiosInstanceToken.get(`/user/right/${rowData.pk_id}`);
      if (!response.data) return;
      setTabIndex(0);
      const defaultRights = getDefaultRights(treeData);
      let dbRights = response.data.rights || response.data;

      // Parse JSON string if returned from DB
      if (typeof dbRights === "string") {
        try {
          dbRights = JSON.parse(dbRights);
        } catch (err) {
          console.error("Failed to parse rights JSON", err);
          dbRights = {};
        }
      }

      // Merge DB rights with default nested rights
      const mergedRights = mergeRights(defaultRights, dbRights);

      // Create a new object marking checkboxes that differ from default
      const selectedDiffs = {};
      Object.keys(mergedRights).forEach((key) => {
        selectedDiffs[key] = mergedRights[key] !== defaultRights[key];
      });

      setRights(selectedDiffs); // only mark checkboxes that differ
    } catch (err) {
      console.error("Failed to fetch right", err);
      setRights(getDefaultRights(treeData));
    }

    setDialogOpen(true);
  };

  // Map rightsData to DataGrid rows
  const rows = rightsData.map((item) => ({
    pk_id: item.pk_id,
    name: item.name,
    description: item.description
  }));

  return (
    <Paper sx={{ height: 460, width: "100%", padding: 2 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        getRowId={(row) => row.pk_id}
        onRowSelectionModelChange={(newSelection) => {
          setSelectedRows(newSelection.ids || new Set());
        }}
        onRowDoubleClick={handleEdit}
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

      {/* Add Right Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            width: 450,
            maxWidth: "90%",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>{formData.pk_id ? "Edit rights" : "Add right"}</DialogTitle>

        {/* Tabs */}
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            marginLeft: 3,
            borderRadius: "8px 8px 0 0",
            padding: "2px",
            minHeight: 36,
            borderBottom: "none",
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          <Tab
            label="Info"
            sx={{
              textTransform: "none",
              fontWeight: "500",
              fontSize: "0.85rem",
              minHeight: "32px",
              padding: "4px 12px",
              marginRight: "4px",
              color: "#555",
              backgroundColor: "#e0e0e0",
              borderRadius: "6px",
              "&.Mui-selected": {
                color: "#fff",
                backgroundColor: "#1976d2",
              },
            }}
          />
          <Tab
            label="Rights"
            sx={{
              textTransform: "none",
              fontWeight: "500",
              fontSize: "0.85rem",
              minHeight: "32px",
              padding: "4px 12px",
              marginRight: "4px",
              color: "#555",
              backgroundColor: "#e0e0e0",
              borderRadius: "6px",
              "&.Mui-selected": {
                color: "#fff",
                backgroundColor: "#1976d2",
              },
            }}
          />
        </Tabs>



        <DialogContent dividers sx={{ minHeight: 350 }}>
          {/* Details Tab */}
          <Fade in={tabIndex === 0} unmountOnExit mountOnEnter>
            <Box hidden={tabIndex !== 0} sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <TextField
                autoFocus
                size="small"
                margin="dense"
                label="Right Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
              //helperText={errors.name}
              />
              <TextField
                size="small"
                margin="dense"
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Box>
          </Fade>

          {/* Rights Tab */}
          <Fade in={tabIndex === 1} unmountOnExit mountOnEnter>
            <Box hidden={tabIndex !== 1} sx={{ mt: 1 }}>
              <UserRightTree rights={rights} setRights={setRights} />
            </Box>
          </Fade>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDialogOpen(false)}
            color="secondary"
            sx={{
              border: "1px solid",
              borderColor: "secondary.main",
              borderRadius: 1,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
