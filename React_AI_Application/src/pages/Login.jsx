import React, { useState } from "react";
import useUserStore from "../store/useUserStore";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
    Box, Button, Container, CssBaseline, TextField,
    Typography, Avatar, Paper, IconButton,
    InputAdornment
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginPage() {
    const { setUserRights } = useUserStore.getState();
    const navigate = useNavigate();
    const [email, setEmail] = useState("sokseng3997@gmail.com");
    const [password, setPassword] = useState("admin123");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Try to get token from localStorage
            const storedToken = localStorage.getItem("access_token");

            const response = await axiosInstance.post("/user/login", {
                access_token: storedToken,
                email: email,
                password: password,
            });
            
            if (response.data?.access_token) {
                localStorage.setItem("access_token", response.data.access_token);
                axiosInstance.defaults.headers.common["Authorization"] =
                    `Bearer ${response.data.access_token}`;
                
                setUserRights(response.data.rights);// Set user rights global

                navigate("/user");
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.detail || "Login failed");
            console.error("Login failed:", error);
        }
    };

    const togglePasswordVisibility = () => setShowPassword((show) => !show);

    return (
        <Container maxWidth="xs" component="main">
            <CssBaseline />
            <Paper
                elevation={6}
                sx={{ marginTop: 8, padding: 4, borderRadius: 3, display: "flex", flexDirection: "column", alignItems: "center" }}
            >
                <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography variant="h5">Login</Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: "100%" }}>
                    <TextField
                        fullWidth
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    />

                    {errorMsg && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {errorMsg}
                        </Typography>
                    )}

                    <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>
                        Sign In
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
