import React, { useEffect, useState, useCallback, useRef } from "react";
import Paper from "@mui/material/Paper";
import { DataGrid, gridClasses, useGridApiRef } from "@mui/x-data-grid";
import { TextField, Checkbox } from "@mui/material";
import { useTranslation } from "react-i18next";
import axiosInstanceToken from "../utils/axiosInstanceToken";
import { useBottomBar } from "../components/layout/BottomBarContext";
import { useSnackbar } from "../../src/components/shared/SnackbarContext";
import { Save } from "@mui/icons-material";

const SystemParameter = () => {
  const { t } = useTranslation();
  const { setButtons } = useBottomBar();
  const { showSnackbar } = useSnackbar();
  const [parameterData, setParameterData] = useState([]);
  const originalDataRef = useRef([]);
  const apiRef = useGridApiRef();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

  const rows = parameterData.map((item) => ({
    pk_id: item.pk_id,
    system_name: t(item.name),
    value: item.value,
    type: item.type,
  }));

  const fetchSystemParameter = useCallback(async () => {
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

  console.log(paginationModel);
  const handleSave = useCallback(async () => {
    try {
      if (document.activeElement) document.activeElement.blur();

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

      await axiosInstanceToken.post("/global/parameter", { changedRows });
      showSnackbar("System parameters saved successfully", "success");
      originalDataRef.current = [...parameterData];
      fetchSystemParameter();
    } catch (err) {
      console.error("Failed to save system parameter", err);
      showSnackbar("Failed to save system parameter", "error");
    }
  }, [parameterData, showSnackbar, fetchSystemParameter]);

  const initButtons = useCallback(() => [{ label: "Save", onClick: handleSave, icon: <Save sx={{ fontSize: 16 }} /> }], [handleSave]);

  useEffect(() => {
    fetchSystemParameter();
  }, [fetchSystemParameter]);

  useEffect(() => {
    setButtons(initButtons());
    return () => setButtons([]);
  }, [setButtons, initButtons]);

  const columns = [
    { field: "system_name", headerName: "Name", flex: 2 },
    {
      field: "value",
      headerName: "Value",
      width: 200,
      editable: true,
      renderCell: (params) => {
        if (params.row.type === "Boolean") {
          return (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                marginLeft: -10,
              }}
            >
              <Checkbox
                checked={params.value === true || params.value === "True"}
                onChange={(e) => {
                  const newVal = e.target.checked;
                  setParameterData((prev) =>
                    prev.map((row) =>
                      row.pk_id === params.id ? { ...row, value: newVal } : row
                    )
                  );
                }}
              />
            </div>

          );
        }
        return <span>{params.value}</span>;
      },
      renderEditCell: (params) => {
        if (params.row.type === "Boolean") {
          return (
            <Checkbox
              autoFocus
              checked={params.value === true || params.value === "True"}
              onChange={(e) => {
                const newVal = e.target.checked;
                setParameterData((prev) =>
                  prev.map((row) =>
                    row.pk_id === params.id ? { ...row, value: newVal } : row
                  )
                );
                if (params.api.getCellMode(params.id, params.field) === "edit") {
                  params.api.stopCellEditMode({ id: params.id, field: params.field });
                }
              }}
            />
          );
        }

        return (
          <TextField
            autoFocus
            fullWidth
            variant="standard"
            type={params.row.type === "Number" ? "number" : "text"}
            value={params.value || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (params.row.type === "Number" && !/^\d*$/.test(val)) return;

              // Update parameterData directly
              setParameterData((prev) =>
                prev.map((row) =>
                  row.pk_id === params.id ? { ...row, value: val } : row
                )
              );
              params.api.setEditCellValue({ id: params.id, field: params.field, value: val }, e);
            }}
            onBlur={() => {
              if (params.api.getCellMode(params.id, params.field) === "edit") {
                params.api.stopCellEditMode({ id: params.id, field: params.field });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && params.api.getCellMode(params.id, params.field) === "edit") {
                params.api.stopCellEditMode({ id: params.id, field: params.field });
              }
            }}
          />
        );
      },
    },
    { field: "type", headerName: "Type", flex: 1 },
  ];

  const handleCellEditStop = useCallback((params) => {
    setParameterData((prev) =>
      prev.map((row) =>
        row.pk_id === params.id ? { ...row, [params.field]: params.value } : row
      )
    );
  }, []);

  const handleCellClick = useCallback((params, event) => {
    if (params.field === "value" && params.row.type !== "Boolean") {
      // Only start edit mode if the cell is not already in edit mode
      if (params.api.getCellMode(params.id, params.field) !== "edit") {
        event.defaultMuiPrevented = true;
        params.api.startCellEditMode({ id: params.id, field: params.field });
      }
    }
  }, []);

  const handleCellDoubleClick = useCallback((params, event) => {
    if (params.field === "value" && params.row.type !== "Boolean") {
      // Only start edit mode if the cell is not already in edit mode
      if (params.api.getCellMode(params.id, params.field) !== "edit") {
        event.defaultMuiPrevented = true;
        params.api.startCellEditMode({ id: params.id, field: params.field });
      }
    }
  }, []);

  return (
    <Paper sx={{ height: 520, width: "100%", padding: 2 }}>
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        getRowId={(row) => row.pk_id}
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
        density="compact"
        rowHeight={45}
        pageSizeOptions={[25, 50, 75, 100]}
        onPaginationModelChange={(model) => setPaginationModel(model)}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 25 } },
        }}
        editMode="cell"
        onCellClick={handleCellClick}
        onCellDoubleClick={handleCellDoubleClick}
        onCellEditStop={handleCellEditStop}
        sx={{
          [`& .${gridClasses.columnHeaders}`]: { backgroundColor: "#1d2a47ff", color: "#fff" },
          [`& .${gridClasses.columnHeader}`]: { backgroundColor: "#1d2a47ff", color: "#fff" },
          [`& .${gridClasses.columnHeaderCheckbox}`]: { backgroundColor: "#1d2a47ff" },
        }}
      />
    </Paper>
  );
};

export default SystemParameter;