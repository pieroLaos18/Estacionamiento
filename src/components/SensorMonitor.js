/**
 * @file SensorMonitor.js
 * @description Componente que muestra una lista detallada del estado de los sensores de cada plaza.
 * Útil para depuración y monitoreo granular del sistema.
 */

import React from "react";
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Chip } from "@mui/material";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function SensorMonitor({ plazas }) {
    return (
        <Paper className="status-paper" sx={{ mt: 2 }}>
            <div className="paper-header-simple">
                <Typography variant="h6" className="paper-title">
                    Monitor de Sensores
                </Typography>
            </div>
            <List dense>
                {plazas.map((plaza, index) => {
                    const isOccupied = plaza.estado === "Ocupado";
                    return (
                        <ListItem key={index} divider={index < plazas.length - 1}>
                            <ListItemIcon>
                                {isOccupied ? (
                                    <DirectionsCarIcon color="error" />
                                ) : (
                                    <LocalParkingIcon color="success" />
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={`Plaza ${index + 1}`}
                                secondary={isOccupied ? "Vehículo Detectado" : "Disponible"}
                            />
                            <Chip
                                label={plaza.estado}
                                color={isOccupied ? "error" : "success"}
                                size="small"
                                variant={isOccupied ? "filled" : "outlined"}
                                icon={isOccupied ? <DirectionsCarIcon /> : <CheckCircleOutlineIcon />}
                            />
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );
}
