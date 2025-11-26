/**
 * @file StatCard.js
 * @description Componente reutilizable para mostrar tarjetas de estadísticas en el dashboard.
 * Muestra un título, un valor principal, un icono y un texto secundario opcional.
 */

import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import "./StatCard.css";

export default function StatCard({ title, value, subtext, icon, colorClass }) {
    return (
        <Card className="stat-card">
            <CardContent className="stat-card-content">
                <div className="stat-card-header">
                    <Box>
                        <Typography variant="subtitle2" className="stat-card-title">
                            {title}
                        </Typography>
                        <Typography variant="h4" className="stat-card-value">
                            {value}
                        </Typography>
                    </Box>
                    <Box className={`stat-icon-box ${colorClass}`}>
                        {icon}
                    </Box>
                </div>
                {subtext && (
                    <Typography variant="caption" className="stat-card-subtext">
                        {subtext}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
