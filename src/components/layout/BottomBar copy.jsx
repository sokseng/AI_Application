import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";

const BottomBar = () => {
  return (
    <Box
      component="footer"
      sx={{
        height: "40px",
        py: 2,
        px: 3,
        backgroundColor: "#595b5fff",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Left side - Buttons */}
      <Stack direction="row" spacing={1}>
        <Button variant="contained" color="primary" size="small">
          Add
        </Button>
        <Button variant="contained" color="warning" size="small">
          Edit
        </Button>
        <Button variant="contained" color="error" size="small">
          Delete
        </Button>
      </Stack>

      {/* Right side - Copyright */}
      <Typography variant="body2">
        © {new Date().getFullYear()} Your Company Name
      </Typography>
    </Box>
  );
};

export default BottomBar;
