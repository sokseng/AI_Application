import React, { useEffect, useState } from "react";
import useUserStore from "../store/useUserStore";
import axiosInstanceToken from "../utils/axiosInstanceToken";
import Paper from "@mui/material/Paper";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { useBottomBar } from "../components/layout/BottomBarContext";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useSnackbar } from "../../src/components/shared/SnackbarContext";
import { useConfirm } from "../components/shared/ConfirmContext";
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
  IconButton
} from "@mui/material";

const columns = [
  { field: "name", headerName: "User name", flex: 1 },
  { field: "email", headerName: "email", flex: 1 },
  { field: "role_name", headerName: "Role name", flex: 1 },
  { field: "user_right", headerName: "User right", flex: 1 },
];

const User = () => {
  const { userRights } = useUserStore();
  const [userData, setUserData] = useState([]);
  const { confirm } = useConfirm();
  const [roleData, setRoleData] = useState([]);
  const [rightData, setRightData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setButtons } = useBottomBar();
  const [selectedRows, setSelectedRows] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [userRoleValue, setUserRoleValue] = useState("");
  const [userRightValue, setUserRightValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const togglePasswordVisibility = () => setShowPassword((show) => !show);

  const canAccessAddUser = userRights?.UserManagement?.UserRights?.CanAdd ?? false;
  const canAccessEditUser = userRights?.UserManagement?.UserRights?.CanEdit ?? false;
  const canAccessDeleteUser = userRights?.UserManagement?.UserRights?.CanDelete ?? false;

  const fetchUserData = async () => {
    try {
      const response = await axiosInstanceToken.get("/user");
      setUserData(response.data || []);
    } catch (err) {
      console.err("Failed to fetch user data", err);
    }
  };

  const fetchUserRoleDropdown = async () => {
    try {
      const response = await axiosInstanceToken.get("/user/role_dropdown");
      setRoleData(response.data || []);
    } catch (err) {
      console.err("Failed to fetch role data", err);
    }
  };

  const fetchUserRightsDropdown = async () => {
    try {
      const response = await axiosInstanceToken.get("/user/right_dropdown");
      setRightData(response.data || []);
    } catch (err) {
      console.err("Failed to fetch right data", err);
    }
  };

  const initButtons = () => {
    const btns = [];

    if (canAccessAddUser) {
      btns.push({
        label: "Add",
        onClick: () => handleOpenSave(),
      });
    }

    if (canAccessDeleteUser) {
      btns.push({
        label: "Delete",
        onClick: handleDelete,
      });
    }

    return btns;
  }

  useEffect(() => {
    fetchUserData();
    fetchUserRoleDropdown();
    fetchUserRightsDropdown();
  }, []);

  useEffect(() => {
    setButtons(initButtons());
    return () => setButtons([]);
  }, [setButtons, selectedRows]);

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      showSnackbar("No rows selected for deletion!", "warning");
      return;
    }

    confirm(`Are you sure you want to delete ${selectedRows.length} user(s)?`, async () => {
      try {
        await axiosInstanceToken.post("/user/delete", { ids: selectedRows });
        fetchUserData();
        setSelectedRows([]);
        showSnackbar("Deleted successfully!", "success");
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to delete users!", "error");
      }
    });
  };

  const handleOpenSave = () => {
    setFormData({ pk_id: null, user_name: "", email: "" });
    setUserRoleValue("");
    setUserRightValue("");
    setDialogOpen(true);
  }
  const handleEdit = async (params) => {
    try {
      if (!canAccessEditUser) {
        showSnackbar("You don't have permission to edit user", "info");
        return;
      }
      const rowData = params.row;
      if (!rowData || rowData.pk_id <= 0) return;

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
  }

  const handleSave = async () => {
    try {
      const user_name = formData.user_name;
      const email = formData.email;
      const role_id = parseInt(userRoleValue, 10) || 0;
      const right_id = parseInt(userRightValue, 10) || 0;
      const password = formData.password;
      const confirm_password = formData.confirmPassword;

      if (user_name === "") {
        setErrors({ user_name: 'User name is required' });
        return
      } if (email === "") {
        setErrors({ email: 'Email is required' });
        return
      } if (password === "" || password === undefined) {
        if (formData.pk_id === null) {
          setErrors({ password: 'Password is required' });
          return
        }
      } if (confirm_password === "" || confirm_password === undefined) {
        if (formData.pk_id === null) {
          setErrors({ confirmPassword: 'Confirm password is required' });
          return
        }
      }
      if (password !== confirm_password) {
        setErrors({ confirmPassword: 'Password does not match' });
        return
      } if (userRoleValue === "") {
        setErrors({ userRoleValue: 'User role is required' });
        return
      } if (userRightValue === "") {
        setErrors({ userRightValue: 'User right is required' });
        return
      }

      const response = await axiosInstanceToken.post("/user", {
        pk_id: formData.pk_id,
        name: user_name,
        email: email,
        password: password === undefined ? "" : password,
        role_id: role_id,
        right_id: right_id
      });

      if (response.data) {
        fetchUserData();
        setDialogOpen(false);
        showSnackbar("Saved successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to add user", err);
      if (err.response && err.response.status === 400 && err.response.data.detail === "Email already exists") {
        showSnackbar("Email already exists!", "error");
        setErrors({ email: 'Email is required' });
      } else {
        showSnackbar("Failed to save user!", "error");
      }
    }
  }
  const handleChangeUserRole = (event) => {
    setUserRoleValue(event.target.value);

    //clear only this field’s error
    setErrors((prev) => ({
      ...prev,
      userRoleValue: "",
    }));
  };

  const handleChangeUserRight = (event) => {
    setUserRightValue(event.target.value);

    //clear only this field’s error
    setErrors((prev) => ({
      ...prev,
      userRightValue: "",
    }));
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
    <Paper sx={{ height: 460, width: "100%", padding: 2 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        disableSelectionOnClick
        getRowId={(row) => row.pk_id}
        selectionModel={selectedRows}
        onSelectionModelChange={(newSelection) => {
          const numericSelection = newSelection.map(id => Number(id));
          setSelectedRows(numericSelection);
          console.log("Selected rows:", numericSelection);
          console.log(paginationModel);
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
          [`& .${gridClasses.columnHeaders}`]: { backgroundColor: "#1d2a47ff", color: "#fff" },
          [`& .${gridClasses.columnHeader}`]: { backgroundColor: "#1d2a47ff", color: "#fff" },
          [`& .${gridClasses.columnHeaderCheckbox}`]: { backgroundColor: "#1d2a47ff" },
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
        <DialogTitle sx={{ fontWeight: "bold", height: 50 }}>{formData.pk_id ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent dividers sx={{ minHeight: formData.pk_id ? 250 : 300 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <TextField
              autoFocus
              size="small"
              margin="dense"
              label="User name"
              name="user_name"
              required
              value={formData.user_name}
              onChange={handleChange}
              error={!!errors.user_name}
            />

            <TextField
              size="small"
              margin="dense"
              label="Email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
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
                error={!!errors.password}
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
                error={!!errors.confirmPassword}
              />
            )}

            <FormControl
              size="small"
              variant="outlined"
              sx={{ minWidth: 200, height: 40 }}
              margin="dense"
              error={!!errors.userRoleValue}
            >
              <InputLabel required id="my-select-label">User role</InputLabel>
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
              error={!!errors.userRightValue}
            >
              <InputLabel required id="my-select-label">User right</InputLabel>
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
