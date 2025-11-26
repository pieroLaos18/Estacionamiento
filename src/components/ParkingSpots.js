/**
 * @file ParkingSpots.js
 * @description Componente que visualiza el estado de las plazas de estacionamiento en una cuadrícula.
 * Muestra si cada plaza está libre u ocupada y la distancia detectada por el sensor.
 */

import React from "react";
import { Chip } from "@mui/material";
import LocalParkingOutlinedIcon from "@mui/icons-material/LocalParkingOutlined";
import "./ParkingSpots.css";

export default function ParkingSpots({ plazas }) {
    return (
        <div className="parking-spots-grid">
            {plazas.map((plaza, i) => (
                <div key={i} className={`spot-card ${plaza.ocupado ? 'occupied' : 'available'}`}>
                    <div className="spot-header">
                        <div className={`spot-icon ${plaza.ocupado ? 'icon-occupied' : 'icon-available'}`}>
                            <LocalParkingOutlinedIcon fontSize="large" />
                        </div>
                        <Chip
                            label={plaza.ocupado ? "Ocupado" : "Disponible"}
                            size="small"
                            className={`spot-status ${plaza.ocupado ? 'status-occupied' : 'status-available'}`}
                        />
                    </div>
                    <div className="spot-info">
                        <h4 className="spot-name">Plaza {i + 1}</h4>
                        <span className="spot-description">
                            {plaza.ocupado ? "Vehículo detectado" : "Espacio listo para usar"}
                        </span>
                        <div className="spot-distance">
                            <span className="distance-label">Sensor:</span>
                            <span className="distance-value">{plaza.distancia} cm</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
