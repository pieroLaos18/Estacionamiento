/**
 * @file EntryQueue.js
 * @description Componente que muestra la cola de vehículos que han ingresado pero aún no se han estacionado en una plaza.
 * Permite visualizar el estado de espera y eliminar vehículos de la cola si es necesario.
 */

import React from "react";
import { Paper, Typography, Box, Chip, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Tooltip } from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function EntryQueue({ pendingVehicles, onRemove }) {
    if (!pendingVehicles || pendingVehicles.length === 0) {
        return (
            <Paper className="status-paper" sx={{ minHeight: '200px', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" className="paper-title" gutterBottom>
                    Cola de Entrada
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5, mt: 2 }}>
                    <HourglassEmptyIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="body2">
                        Sin vehículos en espera
                    </Typography>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper className="status-paper">
            <div className="paper-header-simple">
                <Typography variant="h6" className="paper-title">
                    Cola de Entrada
                </Typography>
                <Chip
                    label={`${pendingVehicles.length} esperando`}
                    size="small"
                    color="warning"
                    variant="outlined"
                />
            </div>

            <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
                {pendingVehicles.map((vehicle, index) => (
                    <ListItem
                        key={vehicle.id}
                        secondaryAction={
                            <Tooltip title="Eliminar de cola">
                                <IconButton edge="end" size="small" onClick={() => onRemove && onRemove(vehicle.id)}>
                                    <DeleteOutlineIcon fontSize="small" color="action" />
                                </IconButton>
                            </Tooltip>
                        }
                        sx={{
                            px: 0,
                            borderBottom: index < pendingVehicles.length - 1 ? '1px solid #f1f5f9' : 'none',
                            py: 2
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark', width: 32, height: 32, fontSize: '0.875rem', fontWeight: 'bold' }}>
                                {index + 1}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="subtitle2" fontWeight="600">
                                    {vehicle.plate}
                                </Typography>
                            }
                            secondary="Esperando plaza..."
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}
