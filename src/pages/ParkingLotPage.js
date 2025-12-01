/**
 * @file ParkingLotPage.js
 * @description Página de control operativo del estacionamiento.
 * Gestiona la visualización de plazas, control de barreras, registro de entradas/salidas y cobros.
 * Integra múltiples componentes para ofrecer una vista completa del estado actual.
 */

import React, { useState, useEffect, useRef } from "react";
import { Paper, Typography, TextField, Button, Chip } from "@mui/material";
import { useParking } from "../context/ParkingContext";
import ParkingSpots from "../components/ParkingSpots";
import DoorControl from "../components/DoorControl";
import EntryModal from "../components/EntryModal";
import ExitModal from "../components/ExitModal";
import ActiveVehicles from "../components/ActiveVehicles";
import EntryQueue from "../components/EntryQueue";
import AssignSpotModal from "../components/AssignSpotModal";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CoinsIcon from "../components/CoinsIcon";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LocalParkingOutlinedIcon from "@mui/icons-material/LocalParkingOutlined";
import "./ParkingLotPage.css";

export default function ParkingLotPage({
    plaza1, plaza2, plaza3,
    puertaEntradaAbierta, puertaSalidaAbierta,
    connected,
    handleAbrirEntrada, handleCerrarEntrada,
    handleAbrirSalida, handleCerrarSalida,
    // Nuevos props para detección de entrada/salida
    vehiculoDetectado,
    salidaDetectada, // Nuevo prop
    vehiculoEstacionado,
    ultimaSalida,
    resetVehiculoDetectado,
    resetSalidaDetectada, // Nuevo prop
    resetVehiculoEstacionado,
    resetUltimaSalida,
    // Nuevos props para modo
    modoAutomatico,
    handleToggleModo
}) {
    const {
        activeVehicles,
        pendingVehicles,
        addToPendingQueue,
        assignPendingToSpot,
        removePendingVehicle,
        processPayment,
        registerExitTimeByPlate
    } = useParking();

    // Limpiar estados de MQTT al montar
    useEffect(() => {
        if (resetVehiculoEstacionado) resetVehiculoEstacionado();
        if (resetUltimaSalida) resetUltimaSalida();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [entryPlate, setEntryPlate] = useState("");
    const [entryMsg] = useState(null);

    // Modales
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [pendingSpotId, setPendingSpotId] = useState(null);
    const [parkingDetectionTime, setParkingDetectionTime] = useState(null); // Timestamp de detección

    // Refs para evitar procesamiento duplicado
    const lastProcessedParking = useRef(null);
    const lastProcessedExit = useRef(null);

    // Detección de entrada (Solo si modo automático está activo)
    useEffect(() => {
        if (!vehiculoDetectado) return;
        if (modoAutomatico && !puertaEntradaAbierta && !showEntryModal) {
            setShowEntryModal(true);
        }
    }, [vehiculoDetectado, puertaEntradaAbierta, showEntryModal, modoAutomatico]);

    // Detección de salida (Solo si modo automático está activo)
    useEffect(() => {
        if (!salidaDetectada) return;
        if (modoAutomatico && !showExitModal) {
            setShowExitModal(true);
        }
    }, [salidaDetectada, showExitModal, modoAutomatico]);

    // Detección de salida CON DEDUPLICACIÓN (Evento final de plaza liberada)
    useEffect(() => {
        if (!ultimaSalida) return;

        const spotId = ultimaSalida.plaza;
        const exitKey = `${spotId}-${ultimaSalida.timestamp || Date.now()}`;

        if (lastProcessedExit.current === exitKey) {
            return;
        }

        const vehiculo = activeVehicles.find(v => v.spotId === spotId && !v.exitTime);

        if (vehiculo) {
            const entryMs = typeof vehiculo.entryTime === 'number'
                ? vehiculo.entryTime
                : new Date(vehiculo.entryTime).getTime();
            const timeParked = Date.now() - entryMs;
            const MIN_PARKING_TIME = 5000;

            if (timeParked >= MIN_PARKING_TIME) {
                console.log(`🚗 Plaza ${spotId} liberada - ${vehiculo.plate}`);
                registerExitTimeByPlate(vehiculo.plate);
            }
        }
        lastProcessedExit.current = exitKey;
    }, [ultimaSalida, activeVehicles, registerExitTimeByPlate]);

    // Handler para confirmar entrada desde el modal
    const handleConfirmEntry = async (licensePlate) => {
        const result = await addToPendingQueue(licensePlate);

        if (result.success) {
            console.log("✅ Vehículo agregado a cola:", licensePlate);
            handleAbrirEntrada();
            resetVehiculoDetectado();
            setShowEntryModal(false);
        } else {
            console.error("❌ Error al agregar a cola:", result.msg);
        }
    };

    // Handler para procesar salida desde el modal
    const handleProcessExit = async (plate) => {
        const res = await processPayment(plate);
        if (res.success) {
            resetSalidaDetectada();
            return true;
        }
        throw new Error(res.msg || "Error al procesar pago");
    };

    // Efecto para manejar asignación cuando se detecta estacionamiento
    useEffect(() => {
        if (!vehiculoEstacionado) return;

        const spotId = vehiculoEstacionado.plaza;
        const parkingKey = `${spotId}-${vehiculoEstacionado.timestamp}`;

        if (lastProcessedParking.current === parkingKey) {
            return;
        }

        // Guardar timestamp de detección AHORA
        const detectionTime = new Date();
        setParkingDetectionTime({
            spotId,
            timestamp: detectionTime,
            mqttTimestamp: vehiculoEstacionado.timestamp
        });

        if (pendingVehicles.length === 0) {
            lastProcessedParking.current = parkingKey;
            return;
        }

        if (pendingVehicles.length === 1) {
            (async () => {
                await assignPendingToSpot(pendingVehicles[0].id, spotId, detectionTime);
                lastProcessedParking.current = parkingKey;
                setParkingDetectionTime(null); // Limpiar después de usar
            })();
            return;
        }

        setPendingSpotId(spotId);
        setShowAssignModal(true);
        lastProcessedParking.current = parkingKey;
    }, [vehiculoEstacionado, pendingVehicles, assignPendingToSpot]);

    const handleConfirmAssignment = async (pendingId) => {
        const result = await assignPendingToSpot(
            pendingId,
            pendingSpotId,
            parkingDetectionTime?.timestamp // Usar timestamp de detección
        );
        if (result.success) {
            setShowAssignModal(false);
            setPendingSpotId(null);
            setParkingDetectionTime(null); // Limpiar después de usar
        }
    };

    const handleRemovePending = async (pendingId) => {
        await removePendingVehicle(pendingId);
    };

    return (
        <div className="parking-container">
            {/* Page Title */}
            <div className="page-header">
                <div className="header-left">
                    <Typography variant="h4" className="page-title">
                        Control de Estacionamiento
                    </Typography>
                    <Typography variant="body2" className="page-subtitle">
                        Gestión inteligente de plazas y accesos
                    </Typography>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="header-controls-container">
                <div className="controls-group">
                    {/* Switch Modo Automático */}
                    <div className="auto-mode-switch">
                        <span className={`mode-label ${modoAutomatico ? 'active' : ''}`}>
                            {modoAutomatico ? 'Modo Auto ON' : 'Modo Manual'}
                        </span>
                        <div
                            onClick={handleToggleModo}
                            className={`switch-track ${modoAutomatico ? 'active' : ''}`}
                        >
                            <div className={`switch-thumb ${modoAutomatico ? 'active' : ''}`} />
                        </div>
                    </div>

                    {/* Botones Manuales */}
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<LocalParkingOutlinedIcon />}
                        onClick={() => setShowEntryModal(true)}
                        className="btn-manual"
                    >
                        Registrar Entrada
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutOutlinedIcon />}
                        onClick={() => setShowExitModal(true)}
                        className="btn-manual"
                    >
                        Procesar Salida
                    </Button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="parking-grid">
                {/* Parking Spots */}
                <Paper className="status-paper">
                    <div className="paper-header-simple">
                        <Typography variant="h6" className="paper-title">
                            Estado de Plazas
                        </Typography>
                        <Chip
                            label={[plaza1, plaza2, plaza3].filter(p => p.estado === 'Libre').length === 3
                                ? "Todo Libre"
                                : [plaza1, plaza2, plaza3].filter(p => p.estado === 'Libre').length === 0
                                    ? "Completo"
                                    : `${3 - [plaza1, plaza2, plaza3].filter(p => p.estado === 'Libre').length}/3 Ocupadas`}
                            color={[plaza1, plaza2, plaza3].filter(p => p.estado === 'Libre').length === 3
                                ? "success"
                                : [plaza1, plaza2, plaza3].filter(p => p.estado === 'Libre').length === 0
                                    ? "error"
                                    : "warning"}
                            size="small"
                            className="info-chip"
                        />
                    </div>
                    <ParkingSpots plazas={[plaza1, plaza2, plaza3]} />
                </Paper>

                {/* Door Control */}
                <Paper className="status-paper">
                    <div className="paper-header-simple">
                        <Typography variant="h6" className="paper-title">
                            Control de Barreras
                        </Typography>
                    </div>
                    <DoorControl
                        puertaEntradaAbierta={puertaEntradaAbierta}
                        puertaSalidaAbierta={puertaSalidaAbierta}
                        connected={connected}
                        handleAbrirEntrada={handleAbrirEntrada}
                        handleCerrarEntrada={handleCerrarEntrada}
                        handleAbrirSalida={handleAbrirSalida}
                        handleCerrarSalida={handleCerrarSalida}
                    />
                </Paper>

                {/* Active Vehicles */}
                <Paper className="status-paper">
                    <ActiveVehicles vehicles={activeVehicles} />
                </Paper>

                {/* Entry Queue */}
                <Paper className="status-paper">
                    <EntryQueue
                        pendingVehicles={pendingVehicles}
                        onRemove={handleRemovePending}
                    />
                </Paper>
            </div>

            {/* Entry Modal */}
            <EntryModal
                open={showEntryModal}
                onClose={() => {
                    setShowEntryModal(false);
                    resetVehiculoDetectado();
                }}
                entryPlate={entryPlate}
                setEntryPlate={setEntryPlate}
                onConfirm={handleConfirmEntry}
                entryMsg={entryMsg}
                connected={connected}
            />

            {/* Exit Modal (Nuevo) */}
            <ExitModal // Importar este componente arriba
                isOpen={showExitModal}
                onClose={() => {
                    setShowExitModal(false);
                    resetSalidaDetectada();
                }}
                activeVehicles={activeVehicles}
                onProcessExit={handleProcessExit}
                puertaSalidaAbierta={puertaSalidaAbierta}
                handleAbrirSalida={handleAbrirSalida}
                handleCerrarSalida={handleCerrarSalida}
            />

            {/* Assign Spot Modal */}
            <AssignSpotModal
                open={showAssignModal}
                onClose={() => {
                    setShowAssignModal(false);
                    setPendingSpotId(null);
                }}
                onConfirm={handleConfirmAssignment}
                pendingVehicles={pendingVehicles}
                spotId={pendingSpotId}
            />
        </div>
    );
}
