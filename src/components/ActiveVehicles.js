/**
 * @file ActiveVehicles.js
 * @description Componente que muestra la lista de vehículos actualmente estacionados.
 * Calcula y muestra el tiempo transcurrido y la tarifa acumulada en tiempo real.
 */

import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, Chip, List, ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { calculateParkingFee, formatElapsedTime, formatCurrency } from "../utils/billing";

import { useParking } from "../context/ParkingContext";

export default function ActiveVehicles({ vehicles }) {
    const { rates } = useParking();
    const [, setTick] = useState(0);

    // Actualizar cada segundo para mantener los temporizadores frescos
    useEffect(() => {
        const interval = setInterval(() => setTick((prev) => prev + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    if (!vehicles || vehicles.length === 0) {
        return (
            <Paper className="status-paper" sx={{ minHeight: '200px', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" className="paper-title" gutterBottom>
                    Vehículos Activos
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5, mt: 2 }}>
                    <DirectionsCarIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="body2">
                        No hay vehículos estacionados
                    </Typography>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper className="status-paper">
            <div className="paper-header-simple">
                <Typography variant="h6" className="paper-title">
                    Vehículos Activos
                </Typography>
                <Chip
                    label={`${vehicles.length} en curso`}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            </div>

            <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
                {vehicles.map((vehicle, index) => {
                    const now = Date.now();
                    let entryTime = typeof vehicle.entryTime === 'number'
                        ? vehicle.entryTime
                        : (vehicle.entryTime ? new Date(vehicle.entryTime).getTime() : null);

                    // Si no hay entryTime válido, usar un fallback pero marcarlo
                    if (!entryTime) {
                        console.warn(`Vehículo ${vehicle.plate} sin entryTime válido`);
                        entryTime = now;
                    }

                    const exitTimeMs = vehicle.exitTime
                        ? (typeof vehicle.exitTime === 'number' ? vehicle.exitTime : new Date(vehicle.exitTime).getTime())
                        : null;

                    const endTime = exitTimeMs || now;
                    const elapsedMs = Math.max(0, endTime - entryTime); // Evitar negativos
                    const preciseMinutes = elapsedMs / 60000;
                    const { fee } = calculateParkingFee(entryTime, endTime, rates);

                    return (
                        <ListItem
                            key={`${vehicle.plate}-${vehicle.spotId}-${entryTime}`}
                            sx={{
                                px: 0,
                                borderBottom: index < vehicles.length - 1 ? '1px solid #f1f5f9' : 'none',
                                py: 2
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: vehicle.exitTime ? 'action.disabledBackground' : 'primary.light', color: vehicle.exitTime ? 'text.disabled' : 'primary.main' }}>
                                    <DirectionsCarIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography variant="subtitle1" fontWeight="600" color={vehicle.exitTime ? "text.secondary" : "text.primary"}>
                                        {vehicle.plate}
                                    </Typography>
                                }
                                secondary={`Plaza ${vehicle.spotId}${vehicle.exitTime ? " • Salida" : ""}`}
                            />

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                    <AccessTimeIcon sx={{ fontSize: 16 }} />
                                    <Typography variant="body2" fontWeight="500">
                                        {formatElapsedTime(preciseMinutes)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
                                    <MonetizationOnIcon sx={{ fontSize: 16 }} />
                                    <Typography variant="body2" fontWeight="700">
                                        {formatCurrency(fee)}
                                    </Typography>
                                </Box>
                            </Box>
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );
}
