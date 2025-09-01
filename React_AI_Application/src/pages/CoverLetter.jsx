
import React, { useEffect, useState } from "react";
import useUserStore from "../store/useUserStore";
import axiosInstanceToken from "../utils/axiosInstanceToken";
import Paper from "@mui/material/Paper";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { useBottomBar } from "../components/layout/BottomBarContext";
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
    { field: "candidate_name", headerName: "Candidate name", flex: 1 },
    { field: "content", headerName: "Content", flex: 2 },
    { field: "created_date", headerName: "Created date", flex: 1 },
    { field: "updated_date", headerName: "Updated date", flex: 1 },
];
const CoverLetter = () => {
    const { userRights } = useUserStore();
    const { confirm } = useConfirm();
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setButtons } = useBottomBar();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [candidateData, setCandidateData] = useState([]);
    const [candidateValue, setCandidateValue] = useState("");
    const { showSnackbar } = useSnackbar();
    const [coverLetterData, setCoverLetterData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

    const canAccessAddCV = userRights?.CoverLetterRights?.CanAdd ?? false;
    const canAccessEditCV = userRights?.CoverLetterRights?.CanEdit ?? false;
    const canAccessDeleteCV = userRights?.CoverLetterRights?.CanDelete ?? false;

    const initButtons = () => {
        const btns = [];

        if (canAccessAddCV) {
            btns.push({
                label: "Add",
                onClick: () => handleOpenSave(),
            });
        }

        if (canAccessDeleteCV) {
            btns.push({
                label: "Delete",
                onClick: handleDelete,
            });
        }

        return btns;
    }

    const fetchCandidateData = async () => {
        try {
            const response = await axiosInstanceToken.get("/cover_letter/candidate_dropdown");
            setCandidateData(response.data || []);
        } catch (err) {
            console.log("Failed to fetch candidate data", err);
        }
    }

    const fetchCoverLetterData = async () => {
        try {
            const response = await axiosInstanceToken.get("/cover_letter");
            setCoverLetterData(response.data || []);
        } catch (err) {
            console.log("Failed to fetch cover letter data", err);
        }
    }

    useEffect(() => {
        fetchCoverLetterData();
        fetchCandidateData();
    }, []);

    useEffect(() => {
        setButtons(initButtons());
        return () => setButtons([]);
    }, [setButtons, selectedRows]);

    const handleOpenSave = () => {
        setFormData({ pk_id: null, fk_candidate: null, content: "" });
        setCandidateValue("");
        setDialogOpen(true);
    }

    const handleSave = async () => {
        try {
            if (candidateValue === "" || candidateValue === undefined) {
                setErrors({ candidateValue: "Candidate is required" });
                return;
            }
            if (formData.content === "" || formData.content === undefined) {
                setErrors({ content: "Content is required" });
                return;
            }

            const parsedCandidate = parseInt(candidateValue, 10);
            const fk_candidate = isNaN(parsedCandidate) ? null : parsedCandidate;
            const content = formData.content;

            const response = await axiosInstanceToken.post("/cover_letter", {
                pk_id: formData.pk_id,
                fk_candidate: fk_candidate,
                content: content
            });
            showSnackbar("Cover letter saved successfully", "success");
            setDialogOpen(false);
            fetchCoverLetterData();
        } catch (err) {
            console.log("Failed to save cover letter", err);
            showSnackbar("Failed to save cover letter", "error");
        }
    }
    const handleDelete = async () => {
        if (selectedRows.length === 0) {
            showSnackbar("No rows selected for deletion!", "warning");
            return;
        }

        confirm(`Are you sure you want to delete ${selectedRows.length} cover letter(s)?`, async () => {
            try {
                await axiosInstanceToken.post("/cover_letter/delete", { ids: selectedRows });
                fetchCoverLetterData();
                setSelectedRows([]);
                showSnackbar("Deleted successfully!", "success");
            } catch (err) {
                console.error(err);
                showSnackbar("Failed to delete cover letters!", "error");
            }
        });
    }
    const handleEdit = (params) => {
        if(!canAccessEditCV) {
            showSnackbar("You don't have permission to edit cover letter", "info");
            return;
        }
        try {
            const rowData = params.row;
        if (!rowData || rowData.pk_id <= 0) return;
        setFormData({
            pk_id: rowData.pk_id,
            fk_candidate: rowData.fk_candidate,
            content: rowData.content
        })
        setCandidateValue(rowData.fk_candidate);
        setDialogOpen(true);
        }catch (err) {
            console.error("Failed to edit", err);
        }
    };

    const handleChangeCandidate = (event) => {
        setCandidateValue(event.target.value);

        //clear only this field’s error
        setErrors((prev) => ({
            ...prev,
            candidateValue: "",
        }));
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

    // Map rightsData to DataGrid rows
    const rows = (coverLetterData || []).map((item) => ({
        pk_id: item.pk_id,
        fk_candidate: item.fk_candidate,
        candidate_name: item.first_name + " " + item.last_name,
        content: item.content,
        created_date: item.created_date,
        updated_date: item.updated_date
    }));

    return (
        <Paper sx={{ height: 520, width: "100%", padding: 2 }}>
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
                        width: 500,
                        maxWidth: "90%",
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: "bold", height: 50 }}>{formData.pk_id ? "Edit Cover letter" : "Add Cover letter"}</DialogTitle>
                <DialogContent dividers sx={{ minHeight: 400 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>

                        <FormControl
                            size="small"
                            variant="outlined"
                            sx={{ minWidth: 200, height: 40 }}
                            margin="dense"
                            error={!!errors.candidateValue}
                        >
                            <InputLabel required id="my-select-label">Candidate</InputLabel>
                            <Select
                                labelId="my-select-label"
                                id="my-select"
                                value={candidateValue}
                                onChange={handleChangeCandidate}
                                label="Candidate"
                                sx={{ height: 40 }}
                            >
                                {candidateData.map((candidate) => (
                                    <MenuItem key={candidate.pk_id} value={candidate.pk_id}>
                                        {candidate.candidate_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            autoFocus
                            size="small"
                            margin="dense"
                            label="Content"
                            name="content"
                            required
                            multiline
                            rows={12}
                            value={formData.content}
                            onChange={handleChange}
                            error={!!errors.content}
                        />

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

export default CoverLetter;