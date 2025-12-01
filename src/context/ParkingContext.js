import React, { createContext, useState, useContext, useEffect } from "react";

const ParkingContext = createContext();

export function useParking() {
    return useContext(ParkingContext);
}

export function ParkingProvider({ children }) {
    // --- State ---
    const [activeVehicles, setActiveVehicles] = useState([]);
    const [pendingVehicles, setPendingVehicles] = useState([]);
    const [rates, setRates] = useState({ base: 5.0, minute: 0.10 });

    // Metrics
    const [earningsToday, setEarningsToday] = useState(0);
    const [earningsMonth, setEarningsMonth] = useState(0);
    const [averageTime, setAverageTime] = useState(0);
    const [bestMonth, setBestMonth] = useState("N/A");

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

    // Cargar datos iniciales desde Backend
    useEffect(() => {
        fetchRates();
        fetchActiveVehicles();
        fetchDashboardMetrics();
        fetchPendingVehicles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchRates = async () => {
        try {
            const res = await fetch(`${API_URL}/rates`);
            const data = await res.json();
            setRates(data);
        } catch (err) {
            console.error("Error fetching rates:", err);
        }
    };

    const fetchActiveVehicles = async () => {
        try {
            const res = await fetch(`${API_URL}/vehicles/active`);
            const data = await res.json();
            setActiveVehicles(data);
        } catch (err) {
            console.error("Error fetching active vehicles:", err);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_URL}/history`);
            const data = await res.json();
            return data; // Retornar directamente sin setear estado
        } catch (err) {
            console.error("Error fetching history:", err);
            return []; // Retornar array vacío en caso de error
        }
    };

    const fetchDashboardMetrics = async () => {
        try {
            const res = await fetch(`${API_URL}/dashboard`);
            const data = await res.json();
            setEarningsToday(data.earningsToday);
            setEarningsMonth(data.earningsMonth);
            setAverageTime(data.averageTime);
            setBestMonth(data.bestMonth);
        } catch (err) {
            console.error("Error fetching dashboard metrics:", err);
        }
    };

    // --- Actions ---

    const fetchPendingVehicles = async () => {
        try {
            const res = await fetch(`${API_URL}/queue`);
            const data = await res.json();
            setPendingVehicles(data);
        } catch (err) {
            console.error("Error fetching queue:", err);
        }
    };

    const addToPendingQueue = async (plate) => {
        try {
            const res = await fetch(`${API_URL}/queue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plate })
            });
            const result = await res.json();
            if (result.success) {
                await fetchPendingVehicles();
                return { success: true, msg: "Vehículo agregado a cola" };
            }
            return { success: false, msg: result.msg };
        } catch (err) {
            return { success: false, msg: "Error de conexión" };
        }
    };

    const assignPendingToSpot = async (pendingId, spotId, entryTime = null) => {
        const pending = pendingVehicles.find(v => v.id === pendingId);
        if (!pending) return { success: false, msg: "Vehículo no encontrado en cola" };

        try {
            // 1. Registrar entrada en plaza con timestamp de detección si está disponible
            const resEntry = await fetch(`${API_URL}/vehicles/entry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plate: pending.plate,
                    spotId,
                    entryTime: entryTime ? entryTime.toISOString() : undefined
                })
            });
            const resultEntry = await resEntry.json();

            if (resultEntry.success) {
                // 2. Marcar como asignado en la cola
                await fetch(`${API_URL}/queue/${pendingId}/assign`, { method: 'POST' });

                // 3. Actualizar estados
                await fetchActiveVehicles();
                await fetchPendingVehicles();

                return { success: true, msg: "Vehículo asignado a plaza", vehicle: { plate: pending.plate, spotId } };
            } else {
                return { success: false, msg: resultEntry.msg || "Error al asignar" };
            }
        } catch (err) {
            return { success: false, msg: "Error de conexión con servidor" };
        }
    };

    const removePendingVehicle = async (pendingId) => {
        try {
            await fetch(`${API_URL}/queue/${pendingId}`, { method: 'DELETE' });
            await fetchPendingVehicles();
            return { success: true, msg: "Vehículo eliminado de cola" };
        } catch (err) {
            return { success: false, msg: "Error de conexión" };
        }
    };

    const registerEntry = async (plate, spotId) => {
        try {
            const res = await fetch(`${API_URL}/vehicles/entry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plate, spotId })
            });
            const result = await res.json();
            if (result.success) {
                await fetchActiveVehicles();
                return { success: true, msg: "Entrada registrada" };
            }
            return { success: false, msg: result.msg };
        } catch (err) {
            return { success: false, msg: "Error de conexión" };
        }
    };

    const calculateFee = (plate) => {
        const vehicle = activeVehicles.find((v) => v.plate === plate);
        if (!vehicle) return null;

        const entryMs = vehicle.entryTime;
        const exitMs = vehicle.exitTime || Date.now(); // Usar exitTime si existe
        const diffMs = exitMs - entryMs;
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);

        let cost = rates.base;
        if (diffMins > 60) {
            cost += (diffMins - 60) * rates.minute;
        }

        return {
            plate,
            entryTime: entryMs,
            exitTime: exitMs,
            totalTime: diffMins,
            totalSeconds: diffSecs,
            cost: parseFloat(cost.toFixed(2)),
            spotId: vehicle.spotId
        };
    };

    const processPayment = async (plate) => {
        const feeData = calculateFee(plate);
        if (!feeData) return { success: false, msg: "Vehículo no encontrado" };

        try {
            const res = await fetch(`${API_URL}/vehicles/exit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plate,
                    cost: feeData.cost,
                    totalTime: feeData.totalTime
                })
            });
            const result = await res.json();

            if (result.success) {
                await fetchActiveVehicles();
                await fetchDashboardMetrics();
                return { success: true, msg: "Pago confirmado", data: feeData };
            }
            return { success: false, msg: result.msg };
        } catch (err) {
            return { success: false, msg: "Error de conexión" };
        }
    };

    const updateRates = async (newRates) => {
        try {
            const res = await fetch(`${API_URL}/rates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRates)
            });
            if (res.ok) {
                setRates(newRates);
            }
        } catch (err) {
            console.error("Error updating rates:", err);
        }
    };

    const registerExitTimeByPlate = async (plate) => {
        try {
            await fetch(`${API_URL}/vehicles/mark-exit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plate })
            });
            await fetchActiveVehicles();
        } catch (err) {
            console.error("Error marking exit time:", err);
        }
    };

    return (
        <ParkingContext.Provider
            value={{
                activeVehicles,
                pendingVehicles,
                rates,
                earningsToday,
                earningsMonth,
                averageTime,
                bestMonth,
                addToPendingQueue,
                assignPendingToSpot,
                removePendingVehicle,
                registerEntry,
                calculateFee,
                processPayment,
                updateRates,
                registerExitTimeByPlate,
                fetchHistory, // Función bajo demanda
            }}
        >
            {children}
        </ParkingContext.Provider>
    );
}
