/**
 * @file EntryModal.js
 * @description Modal que se activa cuando se detecta un vehículo en la entrada.
 * Permite al operador ingresar la placa del vehículo para registrar su ingreso y abrir la barrera.
 */

import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

export default function EntryModal({
    open,
    onClose,
    onConfirm,
    connected,
}) {
    const [licensePlate, setLicensePlate] = useState("");
    const [error, setError] = useState("");

    const handleConfirm = () => {
        // Validar placa
        if (!licensePlate.trim()) {
            setError("Por favor ingrese la placa del vehículo");
            return;
        }

        // Validar formato básico (3 letras - 3 números o similar)
        const plateRegex = /^[A-Z0-9]{3,8}$/i;
        if (!plateRegex.test(licensePlate.replace(/[-\s]/g, ""))) {
            setError("Formato de placa inválido");
            return;
        }

        onConfirm(licensePlate.toUpperCase());
        setLicensePlate("");
        setError("");
    };

    const handleClose = () => {
        setLicensePlate("");
        setError("");
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                style: { borderRadius: 12, padding: 8 }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        p: 1,
                        borderRadius: 2,
                        display: 'flex'
                    }}>
                        <DirectionsCarIcon />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                        Entrada Detectada
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                {!connected && (
                    <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                        Sin conexión MQTT. Reconectando...
                    </Alert>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Ingrese la placa para registrar el ingreso y abrir la barrera.
                </Typography>

                <TextField
                    autoFocus
                    label="Placa del Vehículo"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={licensePlate}
                    onChange={(e) => {
                        setLicensePlate(e.target.value.toUpperCase());
                        setError("");
                    }}
                    error={!!error}
                    helperText={error || "Ejemplo: ABC-123"}
                    placeholder="ABC-123"
                    InputProps={{
                        sx: { borderRadius: 3, fontSize: '1.1rem', fontWeight: 600 }
                    }}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            handleConfirm();
                        }
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={handleClose}
                    color="inherit"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={!connected || !licensePlate.trim()}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                    disableElevation
                >
                    Confirmar Entrada
                </Button>
            </DialogActions>
        </Dialog>
    );
}
