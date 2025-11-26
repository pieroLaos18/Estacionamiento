/**
 * @file AssignSpotModal.js
 * @description Modal para asignar manualmente un vehículo de la cola de entrada a una plaza detectada como ocupada.
 * Permite al operador resolver discrepancias cuando el sistema detecta ocupación pero no ha asociado un vehículo automáticamente.
 */

import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalParkingIcon from "@mui/icons-material/LocalParking";

export default function AssignSpotModal({
    open,
    onClose,
    onConfirm,
    pendingVehicles,
    spotId,
}) {
    const [selectedVehicleId, setSelectedVehicleId] = useState("");

    const handleConfirm = () => {
        if (!selectedVehicleId) {
            return;
        }
        onConfirm(parseInt(selectedVehicleId));
        setSelectedVehicleId("");
    };

    const handleClose = () => {
        setSelectedVehicleId("");
        onClose();
    };

    const formatTime = (timestamp) => {
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        if (elapsed < 60) return `hace ${elapsed}s`;
        return `hace ${Math.floor(elapsed / 60)}m`;
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <LocalParkingIcon color="primary" />
                    <Typography variant="h6">Vehículo Estacionado en Plaza {spotId}</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Se detectó un vehículo en la Plaza {spotId}. Seleccione qué vehículo de la cola ocupó esta plaza.
                </Alert>

                {pendingVehicles && pendingVehicles.length > 0 ? (
                    <RadioGroup
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                    >
                        {pendingVehicles.map((vehicle, index) => (
                            <FormControlLabel
                                key={vehicle.id}
                                value={vehicle.id.toString()}
                                control={<Radio />}
                                label={
                                    <Box display="flex" alignItems="center" gap={2} py={1}>
                                        <Box
                                            sx={{
                                                bgcolor: "primary.light",
                                                color: "primary.dark",
                                                borderRadius: "50%",
                                                width: 28,
                                                height: 28,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: "bold",
                                                fontSize: "0.875rem",
                                            }}
                                        >
                                            {index + 1}
                                        </Box>
                                        <DirectionsCarIcon color="action" />
                                        <Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {vehicle.plate}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Entrada {formatTime(vehicle.entryTime)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                }
                                sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 1,
                                    mb: 1,
                                    px: 2,
                                    "&:hover": {
                                        bgcolor: "action.hover",
                                    },
                                }}
                            />
                        ))}
                    </RadioGroup>
                ) : (
                    <Alert severity="warning">
                        No hay vehículos en cola de entrada. Este vehículo no fue registrado correctamente.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={!selectedVehicleId}
                >
                    Confirmar Asignación
                </Button>
            </DialogActions>
        </Dialog>
    );
}
