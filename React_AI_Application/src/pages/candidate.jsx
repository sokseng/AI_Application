
import React, { useEffect, useState, useCallback } from "react";
import useUserStore from "../store/useUserStore";
import axiosInstanceToken from "../utils/axiosInstanceToken";
import Paper from "@mui/material/Paper";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { useBottomBar } from "../components/layout/BottomBarContext";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useSnackbar } from "../../src/components/shared/SnackbarContext";
import { useConfirm } from "../components/shared/ConfirmContext";
import { Add, Delete, Save, Close } from "@mui/icons-material";
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
    { field: "candidate_name", headerName: "Candidate name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "gender", headerName: "Gender", flex: 1 },
    { field: "date_of_birth", headerName: "Date of Birth", flex: 1 },
    { field: "address1", headerName: "Address1", flex: 1 },
    { field: "address2", headerName: "Address2", flex: 1 }
];
const Candidate = () => {
    const { userRights } = useUserStore();
    const [candidateData, setCandidateData] = useState([]);
    const { confirm } = useConfirm();
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setButtons } = useBottomBar();
    const [selectedRows, setSelectedRows] = useState([]);
    const [formData, setFormData] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((show) => !show);
    const [errors, setErrors] = useState({});
    const [rightData, setRightData] = useState([]);
    const [userRightValue, setUserRightValue] = useState("");
    const { showSnackbar } = useSnackbar();
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });

    const canAccessCandidateAdd = userRights?.CandidateRights?.CanAdd ?? false;
    const canAccessCandidateEdit = userRights?.CandidateRights?.CanEdit ?? false;
    const canAccessCandidateDelete = userRights?.CandidateRights?.CanDelete ?? false;

    const fetchCandidateData = useCallback(async () => {
        try {
            const response = await axiosInstanceToken.get("/candidate");
            setCandidateData(response.data);
        } catch (err) {
            console.err("Failed to fetch candidate data", err);
        }
    }, []);

    const handleDelete = useCallback(() => {
        if (!selectedRows || selectedRows.length === 0) {
            showSnackbar("No rows selected for deletion!", "warning");
            return;
        }

        confirm(`Are you sure you want to delete ${selectedRows.length} candidate(s)?`, async () => {
            try {
                await axiosInstanceToken.post("/candidate/delete", { ids: selectedRows });
                fetchCandidateData();
                setSelectedRows([]);
                showSnackbar("Deleted successfully!", "success");
            } catch (err) {
                console.error(err);
                showSnackbar("Failed to delete candidates!", "error");
            }
        });
    }, [selectedRows,confirm, fetchCandidateData, showSnackbar]);

    const handleOpenSave = useCallback(() => {
        setFormData({
            pk_id: null,
            user_id: null,
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            gender: "male",
            date_of_birth: "",
            address1: "",
            address2: "",
            password: "",
            confirm_password: ""
        });
        setUserRightValue("");
        setDialogOpen(true);
    }, []);

    const fetchUserRightsDropdown = useCallback(async () => {
        try {
            const response = await axiosInstanceToken.get("/user/right_dropdown");
            setRightData(response.data);
        } catch (err) {
            console.err("Failed to fetch right data", err);
        }
    }, []);


    const handleEdit = async (params) => {
        try {
            if (!canAccessCandidateEdit) {
                showSnackbar("You don't have permission to edit candidate", "info");
                return;
            }
            const rowData = params.row;
            if (!rowData || rowData.id <= 0) return;

            setFormData({
                pk_id: rowData.pk_id,
                user_id: rowData.user_id,
                first_name: rowData.first_name,
                last_name: rowData.last_name,
                email: rowData.email,
                phone: rowData.phone,
                gender: rowData.gender === "Male" ? "male" : "female",
                date_of_birth: rowData.date_of_birth,
                address1: rowData.address1,
                address2: rowData.address2
            });

            setUserRightValue(rowData.right_id);
            setDialogOpen(true);
        } catch (err) {
            console.error("Failed to edit", err);
        }
    };

    const handleSave = async () => {
        try {
            const first_name = formData.first_name;
            const last_name = formData.last_name;
            const email = formData.email;
            const phone = formData.phone;
            const gender = formData.gender;
            const date_of_birth = formData.date_of_birth;
            const address1 = formData.address1;
            const address2 = formData.address2;
            const password = formData.password;
            const confirm_password = formData.confirm_password;
            const right_id = userRightValue;
            const user_id = formData.user_id;

            if (first_name === "") {
                setErrors({ first_name: 'First name is required' });
                return
            } if (last_name === "") {
                setErrors({ last_name: 'Last name is required' });
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
                    setErrors({ confirm_password: 'Confirm password is required' });
                    return
                }
            } if (password !== confirm_password) {
                setErrors({ confirm_password: 'Password does not match' });
                return
            } if (right_id === "" || right_id === undefined) {
                setErrors({ user_right: 'User right is required' });
                return
            }

            const response = await axiosInstanceToken.post("/candidate", {
                pk_id: formData.pk_id,
                user_id: user_id,
                first_name: first_name,
                last_name: last_name,
                email: email,
                phone: phone,
                gender: gender,
                date_of_birth: date_of_birth,
                address1: address1,
                address2: address2,
                password: password === undefined ? "" : password,
                right_id: parseInt(userRightValue, 10)
            });

            if (response.data) {
                fetchCandidateData();
                setDialogOpen(false);
                showSnackbar("Saved successfully!", "success");
            }
        } catch (err) {
            console.error("Failed to save candidate", err);
            if (err.response && err.response.status === 400 && err.response.data.detail === "Email already exists") {
                showSnackbar("Email already exists", "error");
                setErrors({ email: 'duplicate' });
            } else if (err.response && err.response.status === 400 && err.response.data.detail === "password is too short") {
                showSnackbar("Password must be greater than or equal to the minimum length defined in system settings", "error");
            } else if (err.response && err.response.status === 400 && err.response.data.detail === "password is too long") {
                showSnackbar("Password must be less than or equal to the maximum length defined in system settings", "error");
            } else if (err.response && err.response.status === 400 && err.response.data.detail === "password special character") {
                showSnackbar("Password must contain at least one special character defined in system settings", "error");
            } else if (err.response && err.response.status === 400 && err.response.data.detail === "Password must contain at least one number") {
                showSnackbar("Password must contain at least one number", "error");
            } else if (err.response && err.response.status === 400 && err.response.data.detail === "Password must contain at least one uppercase letter") {
                showSnackbar("Password must contain at least one uppercase character", "error");
            } else if (err.response && err.response.status === 400 && err.response.data.detail === "Password must contain at least one lowercase letter") {
                showSnackbar("Password must contain at least one lowercase character", "error");
            } else {
                showSnackbar("Failed to save candidate", "error");
            }
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

    const handleChangeUserRight = (event) => {
        setUserRightValue(event.target.value);
        setErrors((prev) => ({
            ...prev,
            user_right: "",
        }))
    };

    useEffect(() => {
        fetchCandidateData();
        fetchUserRightsDropdown();
    }, [fetchCandidateData, fetchUserRightsDropdown]);

    useEffect(() => {
        const btns = [];
        if (canAccessCandidateAdd) {
            btns.push({ label: "Add", onClick: handleOpenSave, icon: <Add fontSize="small"/> });
        }
        if (canAccessCandidateDelete) {
            btns.push({
                label: "Delete",
                onClick: handleDelete,
                icon: <Delete sx={{ fontSize: 16 }} />,
            });
        }
        setButtons(btns);
        return () => setButtons([]);
    }, [canAccessCandidateAdd, canAccessCandidateDelete, handleOpenSave, handleDelete, setButtons, selectedRows]);


    const rows = (candidateData || []).map((item) => ({
        pk_id: item.pk_id,
        user_id: item.user_id,
        first_name: item.first_name,
        last_name: item.last_name,
        candidate_name: item.first_name + " " + item.last_name,
        email: item.email,
        phone: item.phone,
        gender: item.gender === "male" ? "Male" : "Female",
        date_of_birth: item.date_of_birth,
        address1: item.address1,
        address2: item.address2,
        right_id: item.right_id,
        right_name: item.right_name
    }));


    return (
        <Paper sx={{ height: 515, width: "100%", padding: 2 }}>
            <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                disableRowSelectionOnClick
                getRowId={(row) => row.pk_id}
                selectionModel={selectedRows}
                onRowSelectionModelChange={(newSelection) => {
                    // newSelection is now an object with .ids Set
                    let selectionArray = [];
                    if (newSelection?.ids instanceof Set) {
                        selectionArray = Array.from(newSelection.ids).map(id => Number(id));
                    }
                    setSelectedRows(selectionArray);
                    console.log("Selected rows:", selectionArray);
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
                <DialogTitle sx={{ fontWeight: "bold", height: 50 }}>Information</DialogTitle>
                <DialogContent dividers sx={{ minHeight: 300 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>

                        {/* First + Last name in one row */}
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                margin="dense"
                                label="First name"
                                name="first_name"
                                required
                                value={formData.first_name}
                                onChange={handleChange}
                                error={!!errors.first_name}
                            //helperText={errors.first_name}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                margin="dense"
                                label="Last name"
                                name="last_name"
                                required
                                value={formData.last_name}
                                onChange={handleChange}
                                error={!!errors.last_name}
                            //helperText={errors.last_name}
                            />
                        </Box>

                        {/* Gender + DOB in one row */}
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                margin="dense"
                                label="Gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <MenuItem value="male">Male</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                            </TextField>

                            <TextField
                                fullWidth
                                size="small"
                                margin="dense"
                                label="Date of Birth"
                                name="date_of_birth"
                                type="date"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                        </Box>

                        {/* Email + Phone in one row */}
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                margin="dense"
                                label="Email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                            //helperText={errors.email}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                margin="dense"
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </Box>

                        {/* Address1 + Address2 in one row */}
                        <TextField
                            fullWidth
                            size="small"
                            margin="dense"
                            label="Address1"
                            name="address1"
                            value={formData.address1}
                            onChange={handleChange}
                        />

                        <TextField
                            fullWidth
                            size="small"
                            margin="dense"
                            label="Addresss2"
                            name="address2"
                            value={formData.address2}
                            onChange={handleChange}
                        />

                        {/* Password + Confirm password */}

                        {formData.pk_id === null && (
                            <Box sx={{ display: "flex", gap: 1 }}>
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
                                //helperText={errors.password}
                                />

                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Confirm password"
                                    name="confirm_password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.confirm_password}
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
                                    error={!!errors.confirm_password}
                                //helperText={errors.confirm_password}
                                />
                            </Box>
                        )}


                        {/* rights select dropdown */}
                        <FormControl
                            size="small"
                            variant="outlined"
                            sx={{ minWidth: 200, height: 40 }}
                            margin="dense"
                            error={!!errors.user_right}
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
                            {/* {errors.user_right && (
                                <FormHelperText>{errors.user_right}</FormHelperText>
                            )} */}
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
                            fontSize: 12
                        }}
                    >
                        <Close fontSize="small" />
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={handleSave}
                        sx={{ 
                            textTransform: "none",
                            fontSize: 12 
                        }}
                    >
                        {<Save sx={{ fontSize: 16 }} />}
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default Candidate;