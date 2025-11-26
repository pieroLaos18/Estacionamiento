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
import ActiveVehicles from "../components/ActiveVehicles";
import EntryQueue from "../components/EntryQueue";
import AssignSpotModal from "../components/AssignSpotModal";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CoinsIcon from "../components/CoinsIcon";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PageHeader from "../components/PageHeader";
import LocalParkingOutlinedIcon from "@mui/icons-material/LocalParkingOutlined";
import "./ParkingLotPage.css";

export default function ParkingLotPage({
    plaza1, plaza2, plaza3,
    puertaEntradaAbierta, puertaSalidaAbierta,
    connected,
    handleAbrirEntrada, handleCerrarEntrada,
    handleAbrirSalida, handleCerrarSalida,
    // Nuevos props para detección de entrada
    vehiculoDetectado,
    vehiculoEstacionado,
    ultimaSalida,
    resetVehiculoDetectado,
    resetVehiculoEstacionado, // Nuevo prop
    resetUltimaSalida, // Nuevo prop
}) {
    const {
        activeVehicles,
        pendingVehicles,
        addToPendingQueue,
        assignPendingToSpot,
        removePendingVehicle,
        calculateFee,
        processPayment,
        registerExitTimeByPlate
    } = useParking();

    // Limpiar estados de MQTT al montar el componente para evitar "fantasmas"
    useEffect(() => {
        if (resetVehiculoEstacionado) resetVehiculoEstacionado();
        if (resetUltimaSalida) resetUltimaSalida();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Se ejecuta solo al montar


    const [entryPlate, setEntryPlate] = useState("");
    const [entryMsg] = useState(null);
    const [exitPlate, setExitPlate] = useState("");
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [exitMsg, setExitMsg] = useState(null);

    // Modales
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [pendingSpotId, setPendingSpotId] = useState(null);

    // Refs para evitar procesamiento duplicado
    const lastProcessedParking = useRef(null);
    const lastProcessedExit = useRef(null);

    // Detección de entrada
    useEffect(() => {
        if (!vehiculoDetectado) return;
        if (!puertaEntradaAbierta && !showEntryModal) {
            setShowEntryModal(true);
        }
    }, [vehiculoDetectado, puertaEntradaAbierta, showEntryModal]);

    // Detección de salida CON DEDUPLICACIÓN
    useEffect(() => {
        if (!ultimaSalida) return;

        const spotId = ultimaSalida.plaza;
        const exitKey = `${spotId}-${ultimaSalida.timestamp || Date.now()}`;

        // Evitar procesar el mismo evento múltiples veces
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
            } else {
                console.log(`⚠️ Evento ignorado - ${vehiculo.plate} recién llegó`);
            }
        }

        // Marcar como procesado SIEMPRE
        lastProcessedExit.current = exitKey;
    }, [ultimaSalida, activeVehicles, registerExitTimeByPlate]);

    const handleSearchExit = () => {
        const info = calculateFee(exitPlate);
        if (info) {
            // Solo congelar el tiempo si el vehículo NO tiene exitTime aún
            const vehicle = activeVehicles.find(v => v.plate === exitPlate);
            if (vehicle && !vehicle.exitTime) {
                registerExitTimeByPlate(exitPlate);
            }
            setPaymentInfo(info);
            setExitMsg(null);
        } else {
            setExitMsg({ type: "error", text: "Vehículo no encontrado en el sistema" });
            setPaymentInfo(null);
        }
    };

    const handlePayment = async () => {
        const res = await processPayment(exitPlate);
        if (res.success) {
            handleAbrirSalida();
            setExitMsg({ type: "success", text: "Pago procesado exitosamente" });
            setPaymentInfo(null);
            setExitPlate("");
            setTimeout(() => setExitMsg(null), 3000);
        } else {
            setExitMsg({ type: "error", text: res.msg || "Error al procesar pago" });
        }
    };

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

    // Efecto para manejar asignación cuando se detecta estacionamiento
    useEffect(() => {
        if (!vehiculoEstacionado) return;

        const spotId = vehiculoEstacionado.plaza;
        const parkingKey = `${spotId}-${vehiculoEstacionado.timestamp}`;

        if (lastProcessedParking.current === parkingKey) {
            return;
        }

        if (pendingVehicles.length === 0) {
            console.log("⚠️ Estacionamiento en plaza", spotId, "pero no hay cola");
            lastProcessedParking.current = parkingKey;
            return;
        }

        if (pendingVehicles.length === 1) {
            // Wrapper async para poder usar await dentro de useEffect
            (async () => {
                const result = await assignPendingToSpot(pendingVehicles[0].id, spotId);
                if (result.success) {
                    console.log("✅ Asignado a plaza", spotId, ":", result.vehicle.plate);
                }
                lastProcessedParking.current = parkingKey;
            })();
            return;
        }

        setPendingSpotId(spotId);
        setShowAssignModal(true);
        lastProcessedParking.current = parkingKey;
    }, [vehiculoEstacionado, pendingVehicles, assignPendingToSpot]);

    const handleConfirmAssignment = async (pendingId) => {
        const result = await assignPendingToSpot(pendingId, pendingSpotId);

        if (result.success) {
            console.log("✅ Asignado a plaza", pendingSpotId, ":", result.vehicle.plate);
            setShowAssignModal(false);
            setPendingSpotId(null);
        } else {
            console.error("❌ Error al asignar:", result.msg);
        }
    };

    const handleRemovePending = async (pendingId) => {
        const result = await removePendingVehicle(pendingId);
        if (result.success) {
            console.log("🗑️ Vehículo eliminado de cola");
        }
    };

    return (
        <div className="parking-container">
            {/* Header */}
            <PageHeader
                title="Control de Estacionamiento"
                subtitle="Gestión de entradas, salidas y monitoreo en tiempo real"
                icon={<LocalParkingOutlinedIcon />}
                iconColor="secondary"
            />

            {/* Main Grid */}
            <div className="parking-grid">
                {/* Exit Control */}
                <Paper className="control-paper">
                    <div className="paper-header">
                        <div className="header-icon-wrapper exit-color">
                            <LogoutOutlinedIcon />
                        </div>
                        <div>
                            <Typography variant="h6" className="paper-title">
                                Procesar Salida
                            </Typography>
                            <Typography variant="caption" className="paper-subtitle">
                                Busque el vehículo y procese el pago
                            </Typography>
                        </div>
                    </div>

                    <div className="search-group">
                        <TextField
                            fullWidth
                            size="medium"
                            label="Placa del Vehículo"
                            value={exitPlate}
                            onChange={(e) => setExitPlate(e.target.value.toUpperCase())}
                            placeholder="ABC-123"
                            className="plate-input"
                        />
                        <Button
                            variant="outlined"
                            onClick={handleSearchExit}
                            disabled={!exitPlate}
                            className="btn-search"
                        >
                            <SearchOutlinedIcon />
                        </Button>
                    </div>

                    {paymentInfo && (
                        <div className="payment-summary">
                            <div className="summary-header">
                                <CoinsIcon fontSize="small" />
                                <span className="summary-title-text">Resumen de Estacionamiento</span>
                            </div>
                            <div className="summary-body">
                                <div className="summary-row">
                                    <span>Hora de entrada</span>
                                    <strong>
                                        {new Date(paymentInfo.entryTime).toLocaleTimeString('es-PE', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </strong>
                                </div>
                                <div className="summary-row">
                                    <span>Hora de salida</span>
                                    <strong>
                                        {new Date(paymentInfo.exitTime).toLocaleTimeString('es-PE', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </strong>
                                </div>
                                <div className="summary-row">
                                    <span>Tiempo transcurrido</span>
                                    <strong>
                                        {paymentInfo.totalTime} min {paymentInfo.totalSeconds || 0} s
                                    </strong>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-total">
                                    <span>Total a pagar</span>
                                    <span className="total-amount">S/. {paymentInfo.cost.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handlePayment}
                        disabled={!paymentInfo || !connected}
                        className="btn-primary exit-btn"
                        startIcon={<LogoutOutlinedIcon />}
                    >
                        Confirmar Pago
                    </Button>

                    {exitMsg && (
                        <div className={`alert-box ${exitMsg.type}`}>
                            {exitMsg.type === 'success' ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
                            <span>{exitMsg.text}</span>
                        </div>
                    )}
                </Paper>

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

                {/* Active Vehicles - Expanded to take full width of bottom row */}
                <Paper className="status-paper" sx={{ gridColumn: "span 2" }}>
                    <ActiveVehicles vehicles={activeVehicles} />
                </Paper>

                {/* Entry Queue - Nueva sección */}
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
                    // Al cerrar manualmente, se ignora la detección actual para evitar reaparición
                    setShowEntryModal(false);
                    resetVehiculoDetectado();
                }}
                entryPlate={entryPlate}
                setEntryPlate={setEntryPlate}
                onConfirm={handleConfirmEntry}
                entryMsg={entryMsg}
                connected={connected}
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
