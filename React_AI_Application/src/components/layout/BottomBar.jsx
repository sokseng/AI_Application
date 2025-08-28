import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";

const BottomBar = ({ buttons = [] }) => {
  return (
    <Box
      component="footer"
      sx={{
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
      }}
    >
      <Stack direction="row" spacing={1}>
        {buttons.map((btn, i) => (
          <Button key={i} variant={btn.variant || "contained"} size="small" onClick={btn.onClick}>
            {btn.label}
          </Button>
        ))}
      </Stack>

      {/* <Typography variant="body2">© {new Date().getFullYear()} Your Company Name</Typography> */}
    </Box>
  );
};

export default BottomBar;
