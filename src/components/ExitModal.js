import React, { useState, useEffect } from 'react';
import {
    Close as CloseIcon,
    DirectionsCar as CarIcon,
    CreditCard as CreditCardIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    ArrowCircleUp as ArrowUpIcon,
    ArrowCircleDown as ArrowDownIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import './ExitModal.css';

export default function ExitModal({
    isOpen,
    onClose,
    activeVehicles,
    onProcessExit,
    puertaSalidaAbierta,
    handleAbrirSalida,
    handleCerrarSalida
}) {
    const [searchPlate, setSearchPlate] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [step, setStep] = useState('search'); // search, payment, success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [calculatedFee, setCalculatedFee] = useState(0); // Precio calculado una sola vez

    // Resetear estado al abrir/cerrar
    useEffect(() => {
        if (isOpen) {
            setStep('search');
            setSearchPlate('');
            setSelectedVehicle(null);
            setError(null);
            setCalculatedFee(0);
        }
    }, [isOpen]);

    const handleSearch = () => {
        const vehicle = activeVehicles.find(v => v.plate.toUpperCase() === searchPlate.toUpperCase());
        if (vehicle) {
            setSelectedVehicle(vehicle);
            // Calcular el precio UNA SOLA VEZ cuando se encuentra el vehículo
            const fee = calculateFee(vehicle.entryTime);
            setCalculatedFee(fee);
            setStep('payment');
            setError(null);
        } else {
            setError('Vehículo no encontrado o ya salió.');
        }
    };

    const calculateFee = (entryTime) => {
        const entry = new Date(entryTime);
        const now = new Date();
        const diffMs = now - entry;
        const diffMins = Math.ceil(diffMs / 60000);

        // Lógica de precios:
        // - Primera hora (0-60 min): S/. 5.00 fijo
        // - Después de la primera hora: S/. 5.00 + (minutos adicionales × S/. 0.05)

        if (diffMins <= 60) {
            return 5.00; // Primera hora: S/. 5.00
        } else {
            const additionalMins = diffMins - 60;
            const additionalCost = additionalMins * 0.05;
            return 5.00 + additionalCost;
        }
    };

    const calculateDuration = (entryTime) => {
        const entry = new Date(entryTime);
        const now = new Date();
        const diffMs = now - entry;
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;

        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins} minutos`;
    };

    const getExitTime = () => {
        return new Date().toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Simular proceso de pago
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Procesar salida en backend
            await onProcessExit(selectedVehicle.plate);

            // Abrir barrera automáticamente tras pago
            handleAbrirSalida();

            setStep('success');
        } catch (err) {
            setError('Error al procesar el pago. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                {/* Header */}
                <div className="modal-header">
                    <div className="header-content">
                        <div className="header-icon-box">
                            <CarIcon sx={{ fontSize: 24 }} />
                        </div>
                        <div className="header-texts">
                            <h2>Procesar Salida</h2>
                            <p>Control de Salida y Pagos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="close-btn">
                        <CloseIcon sx={{ fontSize: 24 }} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {step === 'search' && (
                        <div>
                            <div className="form-group">
                                <label className="form-label">
                                    Ingrese Placa del Vehículo
                                </label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        value={searchPlate}
                                        onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                                        placeholder="ABC-123"
                                        className="plate-input-modal"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="btn-search-modal"
                                    >
                                        <SearchIcon />
                                    </button>
                                </div>
                                {error && (
                                    <p className="error-msg">
                                        <WarningIcon sx={{ fontSize: 16 }} />
                                        {error}
                                    </p>
                                )}
                            </div>

                            {/* Manual controls hidden - only for admin/debug mode
                            <div className="manual-controls">
                                <h3 className="section-title">Control Manual de Barrera</h3>
                                <div className="controls-grid">
                                    <button
                                        onClick={handleAbrirSalida}
                                        disabled={puertaSalidaAbierta}
                                        className={`btn-control open`}
                                    >
                                        <ArrowUpIcon sx={{ fontSize: 20 }} />
                                        {puertaSalidaAbierta ? 'Abierta' : 'Abrir Barrera'}
                                    </button>
                                    <button
                                        onClick={handleCerrarSalida}
                                        disabled={!puertaSalidaAbierta}
                                        className={`btn-control close`}
                                    >
                                        <ArrowDownIcon sx={{ fontSize: 20 }} />
                                        {puertaSalidaAbierta ? 'Cerrar Barrera' : 'Cerrada'}
                                    </button>
                                </div>
                            </div>
                            */}
                        </div>
                    )}

                    {step === 'payment' && selectedVehicle && (
                        <div>
                            <div className="payment-info-box">
                                <div className="info-row">
                                    <span className="info-label">Placa:</span>
                                    <span className="info-value mono">{selectedVehicle.plate}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Hora Entrada:</span>
                                    <span className="info-value">
                                        {new Date(selectedVehicle.entryTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Hora Salida:</span>
                                    <span className="info-value">
                                        {getExitTime()}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Tiempo Estacionado:</span>
                                    <span className="info-value">
                                        {calculateDuration(selectedVehicle.entryTime)}
                                    </span>
                                </div>
                                <div className="divider"></div>
                                <div className="info-row total-row">
                                    <span className="info-label">Total a Pagar:</span>
                                    <span className="total-amount">
                                        S/. {calculatedFee.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="btn-pay"
                            >
                                {loading ? (
                                    <div className="spinner" />
                                ) : (
                                    <>
                                        <CreditCardIcon sx={{ fontSize: 20 }} />
                                        Pagar y Abrir Salida
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setStep('search')}
                                className="btn-cancel"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="success-content">
                            <div className="success-icon-box">
                                <CheckCircleIcon sx={{ fontSize: 32 }} />
                            </div>
                            <h3 className="success-title">¡Pago Exitoso!</h3>
                            <p className="success-message">
                                La barrera de salida se ha abierto correctamente.
                                <br />
                                ¡Gracias por su visita!
                            </p>
                            <button
                                onClick={onClose}
                                className="btn-close-success"
                            >
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
