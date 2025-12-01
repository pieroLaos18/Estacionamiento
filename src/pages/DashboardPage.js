/**
 * @file DashboardPage.js
 * @description Página principal del dashboard que muestra estadísticas generales del estacionamiento.
 * Incluye KPIs (ganancias, ocupación) y gráficos de rendimiento.
 */

import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { useParking } from "../context/ParkingContext";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import StatCard from "../components/StatCard";
import "./DashboardPage.css";

import PageHeader from "../components/PageHeader";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

export default function DashboardPage() {
    const { activeVehicles, earningsToday, earningsMonth, averageTime, bestMonth, fetchHistory } = useParking();
    const [history, setHistory] = React.useState([]);

    // Cargar historial al montar el componente
    React.useEffect(() => {
        const loadHistory = async () => {
            const historyData = await fetchHistory();
            setHistory(historyData);
        };
        loadHistory();
    }, [fetchHistory]);

    // Preparar datos de gráficos desde el historial
    const weeklyData = React.useMemo(() => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const today = new Date();
        const last7Days = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayData = history.filter(h => {
                const hDate = new Date(h.exitTime);
                return hDate.toDateString() === date.toDateString();
            });

            const totalAmount = dayData.reduce((sum, h) => sum + (parseFloat(h.cost) || 0), 0);

            last7Days.push({
                name: days[date.getDay()],
                amount: parseFloat(totalAmount.toFixed(2)) || 0
            });
        }

        return last7Days;
    }, [history]);

    const occupancyData = React.useMemo(() => {
        const intervals = [];
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Crear intervalos de 15 minutos desde las 0:00 hasta ahora + 30 min
        const maxMinutes = Math.min(currentMinutes + 30, 23 * 60 + 45);

        for (let minutes = 0; minutes <= maxMinutes; minutes += 15) {
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;
            const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

            // Contar TODAS las transacciones (entradas + salidas) en este intervalo
            const intervalTransactions = history.filter(record => {
                const entryDate = new Date(record.entryTime);
                const exitDate = record.exitTime ? new Date(record.exitTime) : null;
                const todayDate = now.toDateString();

                // Verificar si la entrada fue en este intervalo
                const entryInInterval =
                    entryDate.toDateString() === todayDate &&
                    entryDate.getHours() * 60 + entryDate.getMinutes() >= minutes &&
                    entryDate.getHours() * 60 + entryDate.getMinutes() < minutes + 15;

                // Verificar si la salida fue en este intervalo
                const exitInInterval = exitDate &&
                    exitDate.toDateString() === todayDate &&
                    exitDate.getHours() * 60 + exitDate.getMinutes() >= minutes &&
                    exitDate.getHours() * 60 + exitDate.getMinutes() < minutes + 15;

                return entryInInterval || exitInInterval;
            });

            intervals.push({
                time: timeLabel,
                cars: intervalTransactions.length
            });
        }

        return intervals;
    }, [history]);

    return (
        <div className="dashboard-wrapper">
            <PageHeader
                title="Dashboard General"
                subtitle="Resumen de operaciones y estadísticas clave"
                icon={<DashboardOutlinedIcon />}
                iconColor="primary"
            />

            <div className="kpi-grid">
                <StatCard
                    title="Ganancias Hoy"
                    value={`S/. ${Number(earningsToday || 0).toFixed(2)}`}
                    subtext="Actualizado en tiempo real"
                    icon={<AttachMoneyIcon fontSize="medium" />}
                    colorClass="color-green"
                />
                <StatCard
                    title="Ganancias Mes"
                    value={`S/. ${Number(earningsMonth || 0).toFixed(2)}`}
                    subtext={`Mejor mes: ${bestMonth || 'N/A'}`}
                    icon={<CalendarMonthIcon fontSize="medium" />}
                    colorClass="color-blue"
                />
                <StatCard
                    title="Vehículos Activos"
                    value={activeVehicles.length}
                    subtext={`${3 - activeVehicles.length} plazas disponibles`}
                    icon={<DirectionsCarIcon fontSize="medium" />}
                    colorClass="color-orange"
                />
                <StatCard
                    title="Tiempo Promedio"
                    value={`${averageTime || 0} min`}
                    subtext="Duración media de estancia"
                    icon={<AccessTimeIcon fontSize="medium" />}
                    colorClass="color-purple"
                />
            </div>

            <div className="charts-grid">
                <Paper className="chart-paper">
                    <Box className="chart-header">
                        <Typography variant="h6" className="chart-title">
                            Ganancias Semanales
                        </Typography>
                    </Box>

                    <Box className="chart-container-box">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                    tickFormatter={(value) => `S/. ${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: "#f8fafc" }}
                                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                                    formatter={(value) => [`S/. ${Number(value).toFixed(2)}`, "Ganancia"]}
                                />
                                <Bar
                                    dataKey="amount"
                                    fill="#3b82f6"
                                    radius={[8, 8, 0, 0]}
                                    barSize={36}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                <Paper className="chart-paper">
                    <Box className="chart-header">
                        <Typography variant="h6" className="chart-title">
                            Actividad en Tiempo Real (Intervalos 15 min)
                        </Typography>
                    </Box>
                    <Box className="chart-container-box">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={occupancyData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                                <defs>
                                    <linearGradient id="colorCars" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                                    formatter={(value) => [value, "Vehículos"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="cars"
                                    stroke="#8b5cf6"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorCars)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </div>
        </div>
    );
}
