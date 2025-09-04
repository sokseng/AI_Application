import React, { useEffect, useState, useCallback, useRef } from "react";
import Paper from "@mui/material/Paper";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { TextField, Checkbox } from "@mui/material";
import { useTranslation } from "react-i18next";
import axiosInstanceToken from "../utils/axiosInstanceToken";
import { useBottomBar } from "../components/layout/BottomBarContext";
import { useSnackbar } from "../../src/components/shared/SnackbarContext";

const SystemParamenter = () => {
  const { t } = useTranslation();
  const { setButtons } = useBottomBar();
  const { showSnackbar } = useSnackbar();
  const [parameterData, setParameterData] = useState([]);
  const originalDataRef = useRef([]);

  // Map data for DataGrid rows
  const rows = parameterData.map((item) => ({
    pk_id: item.pk_id,
    system_name: t(item.name),
    value: item.value,
    type: item.type,
  }));

  // Fetch system parameters
  const fetchSystemParamenter = useCallback(async () => {
    try {
      const response = await axiosInstanceToken.get("/global/parameter");
      if (response.data?.length > 0) {
        setParameterData(response.data);
        originalDataRef.current = [...response.data];
      } else {
        setParameterData([]);
        originalDataRef.current = [];
      }
    } catch (err) {
      console.error("Failed to fetch system parameter data", err);
    }
  }, []);

  // Save changes
  const handleSave = useCallback(async () => {
    try {
      debugger
      if (document.activeElement) {
        document.activeElement.blur();
      }

      if (!parameterData || parameterData.length === 0) {
        showSnackbar("No data available to save", "warning");
        return;
      }

      const changedRows = parameterData.filter((item) => {
        const original = originalDataRef.current.find((o) => o.pk_id === item.pk_id);
        return original && original.value !== item.value;
      });

      if (changedRows.length === 0) {
        showSnackbar("No changes to save", "info");
        return;
      }
      
      await axiosInstanceToken.post("/global/parameter", { changedRows: changedRows });
      showSnackbar("System parameters saved successfully", "success");

      originalDataRef.current = [...parameterData];
      fetchSystemParamenter();
    } catch (err) {
      console.error("Failed to save system parameter", err);
      showSnackbar("Failed to save system parameter", "error");
    }
  }, [parameterData, showSnackbar, fetchSystemParamenter]);

  // Initialize bottom bar buttons
  const initButtons = useCallback(
    () => [{ label: "Save", onClick: handleSave }],
    [handleSave]
  );

  useEffect(() => {
    fetchSystemParamenter();
  }, [fetchSystemParamenter]);

  useEffect(() => {
    setButtons(initButtons());
    return () => setButtons([]);
  }, [setButtons, initButtons]);

  // DataGrid columns
  const columns = [
    { field: "system_name", headerName: "Name", flex: 2 },
    {
      field: "value",
      headerName: "Value",
      width: 200,
      editable: true, // make the cell editable
      renderCell: (params) => {
        // Boolean type shows checkbox
        if (params.row.type === "Boolean") {
          return (
            <Checkbox
              checked={params.value === true || params.value === "True"}
            />
          );
        }

        // Text type
        if (params.row.type === "Text") {
          return <span>{params.value || ""}</span>;
        }

        // Number type
        if (params.row.type === "Number") {
          return <span>{params.value || ""}</span>;
        }

        return <span>{params.value}</span>;
      },
      renderEditCell: (params) => {
        // Boolean type editing with live tick
        if (params.row.type === "Boolean") {
          const checked = params.value === true || params.value === "True";
          return (
            <Checkbox
              autoFocus
              checked={checked}
              onChange={(e) => {
                params.api.setEditCellValue(
                  {
                    id: params.id,
                    field: params.field,
                    value: e.target.checked ? true : false, // store as boolean
                  },
                  e
                );
                // Immediately commit to show tick
                params.api.commitCellChange({ id: params.id, field: params.field });
              }}
            />
          );
        }

        // Text type
        if (params.row.type === "Text") {
          return (
            <TextField
              autoFocus
              fullWidth
              variant="standard"
              value={params.value || ""}
              onChange={(e) =>
                params.api.setEditCellValue(
                  { id: params.id, field: params.field, value: e.target.value },
                  e
                )
              }
            />
          );
        }

        // Number type
        if (params.row.type === "Number") {
          return (
            <TextField
              autoFocus
              fullWidth
              variant="standard"
              type="number"
              inputProps={{ min: 0 }}
              value={params.value || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  params.api.setEditCellValue(
                    { id: params.id, field: params.field, value: val },
                    e
                  );
                }
              }}
            />
          );
        }

        return <span>{params.value}</span>;
      },
    },


    { field: "type", headerName: "Type", flex: 1 },
  ];

  return (
    <Paper sx={{ height: 520, width: "100%", padding: 2 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.pk_id}
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
        density="compact"
        rowHeight={45}
        pageSizeOptions={[25, 50, 75, 100]}
        onCellEditCommit={(params) => {
          setParameterData((prev) =>
            prev.map((row) =>
              row.pk_id === params.id
                ? { ...row, [params.field]: params.value }
                : row
            )
          );
        }}
        sx={{
          [`& .${gridClasses.columnHeaders}`]: {
            backgroundColor: "#1d2a47ff",
            color: "#fff",
          },
          [`& .${gridClasses.columnHeader}`]: {
            backgroundColor: "#1d2a47ff",
            color: "#fff",
          },
          [`& .${gridClasses.columnHeaderCheckbox}`]: {
            backgroundColor: "#1d2a47ff",
          },
        }}
      />
    </Paper>
  );
};

export default SystemParamenter;
