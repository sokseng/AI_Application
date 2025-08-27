
import React, { createContext, useContext, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [onConfirm, setOnConfirm] = useState(() => () => { });

    const confirm = (msg, callback) => {
        setMessage(msg);
        setOnConfirm(() => callback);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleYes = () => {
        setOpen(false);
        if (onConfirm) onConfirm();
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 400,
                        maxWidth: "90%",
                        borderRadius: 2,
                        overflow: "hidden",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: "bold",
                        py: 1,
                        px: 2,
                        fontSize: "1rem",
                    }}
                >
                    Confirm
                </DialogTitle>

                <DialogContent sx={{ py: 2, px: 2 }}>{message}</DialogContent>

                <DialogActions sx={{ px: 2, pb: 2 }}>
                    <Button
                        size="small"
                        onClick={handleClose}
                        color="secondary"
                        sx={{
                            border: "1px solid",
                            borderColor: "secondary.main",
                            borderRadius: 1,
                            textTransform: "none",
                            minWidth: 80,
                        }}
                    >
                        No
                    </Button>
                    <Button
                        size="small"
                        onClick={handleYes}
                        color="error"
                        variant="contained"
                        sx={{ textTransform: "none", minWidth: 80 }}
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </ConfirmContext.Provider>
    );
};
