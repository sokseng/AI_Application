
import React, { useEffect, useState } from "react";
import useUserStore from "../store/useUserStore";
import axiosInstanceToken from "../utils/axiosInstanceToken";
import Paper from "@mui/material/Paper";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { useBottomBar } from "../components/layout/BottomBarContext";
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
    { field: "name", headerName: "Candidate name", flex: 1 }
];
const Candidate = () => {

    const { userRights } = useUserStore();
    const [candidateData, setCandidateData] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setButtons } = useBottomBar();
    const [selectedRows, setSelectedRows] = useState([]);
    const [formData, setFormData] = useState({});
    // const [errors, setErrors] = useState({});
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const fetchCandidateData = async () => {
        try {
            const response = await axiosInstanceToken.get("/candidate");
            setCandidateData(response.data);
        } catch (err) {
            console.err("Failed to fetch candidate data", err);
        }
    }

    const buildButtons = () => {
        const btns = [];

        if (userRights?.CandidateRights?.CanAdd) {
            btns.push({
                label: "Add",
                onClick: () => handleOpenSave(),
            });
        }

        if (userRights?.CandidateRights?.CanDelete) {
            btns.push({
                label: "Delete",
                onClick: () => alert("Delete clicked"),
            });
        }

        return btns;
    };


    useEffect(() => {
        fetchCandidateData();
        setButtons(buildButtons());// set buttons from function
        return () => setButtons([]);// cleanup when leaving page
    }, [setButtons]);

    const handleOpenSave = () => {

    }
    const handleEdit = async (params) => {
        const rowData = params.row;
        if (!rowData || rowData.id <= 0) return;
        setFormData(rowData);
        setDialogOpen(true);
    };

    const rows = (candidateData || []).map((item) => ({
        pk_id: item.pk_id,
        name: item.name,
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
        </Paper>
    );
};

export default Candidate;