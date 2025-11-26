/**
 * @file DoorControl.js
 * @description Componente para el control manual de las barreras de entrada y salida.
 * Muestra el estado actual de las puertas y permite abrirlas/cerrarlas si hay conexión MQTT.
 */

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import "./DoorControl.css";

function DoorCard({ title, isOpen, connected, onOpen, onClose, type }) {
    return (
        <div className={`door-card ${isOpen ? 'door-open' : 'door-closed'}`}>
            <div className="door-header">
                <div className={`door-icon-wrapper ${type}`}>
                    <MeetingRoomOutlinedIcon />
                </div>
                <div className="door-info">
                    <h4 className="door-title">{title}</h4>
                    <div className="door-status-row">
                        <span className={`status-dot ${isOpen ? 'dot-open' : 'dot-closed'}`}></span>
                        <span className="status-text">{isOpen ? "Abierta" : "Cerrada"}</span>
                    </div>
                </div>
                <div className="door-action-icon">
                    <Tooltip title={isOpen ? "Cerrar Barrera" : "Abrir Barrera"}>
                        <span>
                            <IconButton
                                onClick={isOpen ? onClose : onOpen}
                                disabled={!connected}
                                color={isOpen ? "error" : "primary"}
                                sx={{
                                    bgcolor: isOpen ? 'error.light' : 'primary.light',
                                    '&:hover': { bgcolor: isOpen ? 'error.main' : 'primary.main', color: 'white' }
                                }}
                            >
                                <PowerSettingsNewIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default function DoorControl({
    puertaEntradaAbierta,
    puertaSalidaAbierta,
    connected,
    handleAbrirEntrada,
    handleCerrarEntrada,
    handleAbrirSalida,
    handleCerrarSalida,
}) {
    return (
        <div className="door-control-grid">
            <DoorCard
                title="Barrera de Entrada"
                isOpen={puertaEntradaAbierta}
                connected={connected}
                onOpen={handleAbrirEntrada}
                onClose={handleCerrarEntrada}
                type="entry"
            />

            <DoorCard
                title="Barrera de Salida"
                isOpen={puertaSalidaAbierta}
                connected={connected}
                onOpen={handleAbrirSalida}
                onClose={handleCerrarSalida}
                type="exit"
            />
        </div>
    );
}
