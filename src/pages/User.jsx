import React, { useEffect, useState } from "react";
import useUserStore from "../store/useUserStore";
import axiosInstanceToken from "../utils/axiosInstanceToken";
import Paper from "@mui/material/Paper";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { useBottomBar } from "../components/layout/BottomBarContext";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputLabel,
  MenuItem,
  Box,
  Select,
  FormControl,
  InputAdornment,
  IconButton,
  Snackbar, Alert, Slide
} from "@mui/material";

const columns = [
  { field: "name", headerName: "User name", flex: 1 },
  { field: "email", headerName: "email", flex: 1 },
  { field: "role_name", headerName: "Role name", flex: 1 },
  { field: "user_right", headerName: "User right", flex: 1 },
];

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

const User = () => {
  const { userRights } = useUserStore();
  const [userData, setUserData] = useState(null);
  const [roleData, setRoleData] = useState([]);
  const [rightData, setRightData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setButtons } = useBottomBar();
  const [selectedRows, setSelectedRows] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [userRoleValue, setUserRoleValue] = useState("");
  const [userRightValue, setUserRightValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const togglePasswordVisibility = () => setShowPassword((show) => !show);
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstanceToken.get("/user");
      setUserData(response.data);
    } catch (err) {
      console.err("Failed to fetch user data", err);
    }
  };

  const fetchUserRoleDropdown = async () => {
    try {
      const response = await axiosInstanceToken.get("/user/role_dropdown");
      setRoleData(response.data);
    } catch (err) {
      console.err("Failed to fetch role data", err);
    }
  };

  const fetchUserRightsDropdown = async () => {
    try {
      const response = await axiosInstanceToken.get("/user/right_dropdown");
      setRightData(response.data);
    } catch (err) {
      console.err("Failed to fetch right data", err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchUserRoleDropdown();
    fetchUserRightsDropdown();
    setButtons([
      { label: "Add", onClick: () => handleOpenSave() },
      { label: "Delete", onClick: () => alert("Delete clicked") },
    ]);
    return () => setButtons([]);
  }, [setButtons]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };
  const handleOpenSave = () => {
    setFormData({ pk_id: null, user_name: "", email: "", role_id: 0, right_id: 0 });
    setDialogOpen(true);
  }
  const handleEdit = async (params) => {
    try {
      const rowData = params.row;
      if (!rowData || rowData.id <= 0) return;

      setFormData({
        pk_id: rowData.pk_id,
        user_name: rowData.name,
        email: rowData.email
      })

      setUserRoleValue(rowData.role_id);
      setUserRightValue(rowData.right_id);
      setDialogOpen(true);
    } catch (err) {
      console.error("Failed to edit user", err);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;   // ✅ get field name + value
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleSave = async () => {
    try {
      const user_name = formData.user_name;
      const email = formData.email;
      const role_id = parseInt(userRoleValue, 10) || 0;
      const right_id = parseInt(userRightValue, 10) || 0;
      const password = formData.password;
      const confirm_password = formData.confirmPassword;
      if (password !== confirm_password) return

      const response = await axiosInstanceToken.post("/user", {
        pk_id: formData.pk_id,
        name: user_name,
        email: email,
        password: password === undefined ? "" : password,
        role_id: role_id,
        right_id: right_id
      });
      fetchUserData();
      setDialogOpen(false);
      setSuccessMessage("Saved successfully!");
      setOpenSnackbar(true);
    } catch (err) {
      console.error("Failed to add user", err);
    }
  }
  const handleChangeUserRole = (event) => {
    setUserRoleValue(event.target.value);
  };

  const handleChangeUserRight = (event) => {
    setUserRightValue(event.target.value);
  };

  // Map rightsData to DataGrid rows
  const rows = (userData || []).map((item) => ({
    pk_id: item.pk_id,
    name: item.name,
    email: item.email,
    role_name: item.role_name,
    role_id: item.role_id,
    user_right: item.user_right,
    right_id: item.right_id
  }));


  return (
    <Paper sx={{ height: 450, width: "100%", padding: 2 }}>
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

      {/* snackbarK */}
      <Snackbar
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        autoHideDuration={3000}
        TransitionComponent={SlideTransition} // smooth slide down
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled" // filled style looks nicer
          sx={{
            width: "100%",
            fontWeight: "bold",
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>


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
        <DialogTitle sx={{ fontWeight: "bold", height: 50 }}>{formData.pk_id ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent dividers sx={{ minHeight: formData.pk_id ? 250 : 300 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <TextField
              autoFocus
              size="small"
              margin="dense"
              label="User name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
            />


            <TextField
              size="small"
              margin="dense"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {!formData.pk_id && (
              <TextField
                fullWidth
                size="small"
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {!formData.pk_id && (
              <TextField
                fullWidth
                size="small"
                label="Confirm password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <FormControl
              size="small"
              variant="outlined"
              sx={{ minWidth: 200, height: 40 }}
              margin="dense"
            >
              <InputLabel id="my-select-label">User role</InputLabel>
              <Select
                labelId="my-select-label"
                id="my-select"
                value={userRoleValue}
                onChange={handleChangeUserRole}
                label="User role"
                sx={{ height: 40 }}
              >
                {roleData.map((role) => (
                  <MenuItem key={role.pk_id} value={role.pk_id}>
                    {role.role_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              variant="outlined"
              sx={{ minWidth: 200, height: 40 }}
              margin="dense"
            >
              <InputLabel id="my-select-label">User right</InputLabel>
              <Select
                labelId="my-select-label"
                id="my-select"
                value={userRightValue}
                onChange={handleChangeUserRight}
                label="User right"
                sx={{ height: 40 }}
              >
                {rightData.map((right) => (
                  <MenuItem key={right.pk_id} value={right.pk_id}>
                    {right.right_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          </Box>
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
};

export default User;
