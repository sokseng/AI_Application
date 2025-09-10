import React from "react";
import { Box, Stack, Button } from "@mui/material";

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
          <Button
            key={i} variant={btn.variant || "contained"}
            sx={{ textTransform: "none" }} size="small"
            onClick={btn.onClick}

          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {btn.icon}
              <span>{btn.label}</span>
            </Box>
          </Button>
        ))}
      </Stack>

      {/* <Typography variant="body2">© {new Date().getFullYear()} Your Company Name</Typography> */}
    </Box>
  );
};

export default BottomBar;
