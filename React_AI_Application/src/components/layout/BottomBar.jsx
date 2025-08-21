import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";

const BottomBar = ({ buttons = [] }) => {
  return (
    <Box
      component="footer"
      sx={{
        height: "40px",
        py: 2,
        px: 3,
        //backgroundColor: "#595b5fff",
        //color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Stack direction="row" spacing={1}>
        {buttons.map((btn, index) => (
          <Button
            key={index}
            variant={btn.variant || "contained"}
            //color={btn.color || "primary"}
            size="small"
            onClick={btn.onClick}
          >
            {btn.label}
          </Button>
        ))}
      </Stack>

      <Typography variant="body2">
        © {new Date().getFullYear()} Your Company Name
      </Typography>
    </Box>
  );
};

export default BottomBar;
