
import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useSnackbar } from "../../src/components/shared/SnackbarContext";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    IconButton,
    InputAdornment
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

const ForgotPassword = () => {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((show) => !show);
    const { showSnackbar } = useSnackbar();
    const [errors, setErrors] = useState({});

    const steps = ["Enter Email", "Verify Code", "Reset Password"];

    // Step 1: Request reset code
    const handleRequestCode = async () => {
        if (email === "") {
            showSnackbar("Please enter your email", "error");
            setErrors({ enterEmail: "Email is required" });
            return;
        }
        try {
            await axiosInstance.post("/forgot_password", { email: email });
            setStep(1);
        } catch (err) {
            if (err.response && err.response.status === 404 && err.response.data.detail === "Email not found") {
                showSnackbar("Email address not found. Please check and try again.", "error");
            }
            else {
                showSnackbar("Error sending code", "error");
            }
        }
    };

    // Step 2: Verify code
    const handleVerifyCode = async () => {
        if (code === "") {
            showSnackbar("Please enter the code", "error");
            setErrors({ verifyCode: "verify code is required" });
            return;
        }
        try {
            await axiosInstance.post("/forgot_password/verify_code", {
                email: email,
                code: code
            });
            setStep(2);
        } catch (err) {
            if (err.response && err.response.status === 400 && err.response.data.detail === "code and email not provided") {
                showSnackbar("code and email not provided", "error");
            } else if (err.response && err.response.status === 400 && err.response.data.detail === "Invalid email or code") {
                showSnackbar("Invalid code", "error");
            } else if (err.response && err.response.status === 400 && err.response.data.detail === "Code has expired") {
                showSnackbar("Code has expired", "error");
            }
            else {
                showSnackbar("Invalid verify code", "error");
            }
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async () => {
        if (newPassword === "") {
            showSnackbar("Please enter a new password", "error");
            setErrors({ newPassword: "new password is required" });
            return;
        }
        if (confirmPassword === "") {
            showSnackbar("Please confirm your new password", "error");
            setErrors({ confirmPassword: "confirm password is required" });
            return;
        }
        if (newPassword !== confirmPassword) {
            showSnackbar("Passwords do not match", "error");
            return;
        }
        try {
            await axiosInstance.post("/forgot_password/reset_password", {
                email,
                new_password: newPassword
            });
            showSnackbar("Password reset successfully", "success");
            window.location.href = "/login"; // auto redirect
        } catch (err) {
            if (err.response && err.response.status === 400 && err.response.data.detail === "Email not found") {
                showSnackbar("Email not found", "error");
            } else {
                showSnackbar("Error resetting password", "error");
            }
        }
    };

    // Handle Back
    const handleBack = () => {
        if (step === 0) {
            window.location.href = "/login"; // go back to login if on first step
        } else {
            setStep(step - 1);
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={4} sx={{ p: 4, mt: 8, borderRadius: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>

                    <Typography variant="h5" align="center" sx={{ flexGrow: 1 }}>
                        Forgot Password
                    </Typography>
                </Box>

                {/* Stepper progress bar */}
                <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Step 1 */}
                {step === 0 && (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Email"
                            type="email"
                            size="small"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors({ enterEmail: "" });
                            }}
                            fullWidth
                            error={!!errors.enterEmail}
                        />
                        <Button size="small" variant="contained" onClick={handleRequestCode}>
                            Send Code
                        </Button>
                    </Box>
                )}

                {/* Step 2 */}
                {step === 1 && (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Verification Code"
                            size="small"
                            type="text"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                setErrors({ verifyCode: "" });
                            }}
                            fullWidth
                            error={!!errors.verifyCode}
                        />
                        <Button size="small" variant="contained" onClick={handleVerifyCode}>
                            Verify
                        </Button>
                    </Box>
                )}

                {/* Step 3 */}
                {step === 2 && (
                    <Box display="flex" flexDirection="column" gap={2}>

                        <TextField
                            fullWidth
                            size="small"
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                setErrors({ newPassword: "" });
                            }}
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
                            error={!!errors.newPassword}
                        />

                        <TextField
                            fullWidth
                            size="small"
                            label="Confirm password"
                            name="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setErrors({ confirmPassword: "" });
                            }}
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
                            error={!!errors.confirmPassword}

                        />

                        <Button size="small" variant="contained" onClick={handleResetPassword}>
                            Reset Password
                        </Button>
                    </Box>
                )}

                {/* Optional Back Button (if you want manual navigation) */}
                <Box mt={3} display="flex" justifyContent="flex-start">
                    <IconButton onClick={handleBack}>
                        <ArrowBack />
                    </IconButton>
                </Box>

                {/* Optional Next Button (if you want manual navigation) */}
                {/* {step < 2 && (
                    <Box mt={3} display="flex" justifyContent="flex-end">
                        <IconButton onClick={() => setStep(step + 1)}>
                            <ArrowForward />
                        </IconButton>
                    </Box>
                )} */}
            </Paper>
        </Container>
    );
};

export default ForgotPassword;
