/**
 * @file SettingsPage.js
 * @description Página de configuración del sistema.
 * Permite gestionar las tarifas de cobro y configurar la conexión WiFi del hardware ESP32.
 */

import React, { useState } from "react";
import { TextField, Button, InputAdornment, Avatar } from "@mui/material";
import WifiConfig from "../components/WifiConfig";
import { useParking } from "../context/ParkingContext";
import PageHeader from "../components/PageHeader";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WifiIcon from "@mui/icons-material/Wifi";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import "./SettingsPage.css";

export default function SettingsPage({ connected, publishWifiConfig }) {
    const { rates, updateRates } = useParking();
    const [localRates, setLocalRates] = useState(rates);

    // Estado simulado para el perfil de usuario (visual por ahora)
    const [userProfile, setUserProfile] = useState({
        name: "Rodrigo Quiroz",
        email: "admin@parkadmin.com",
        role: "Administrador"
    });

    const handleSaveRates = () => {
        updateRates(localRates);
        alert("Tarifas actualizadas correctamente");
    };

    const handleSaveProfile = () => {
        alert("Datos de perfil actualizados (Simulación)");
    };

    return (
        <div className="settings-wrapper">
            <PageHeader
                title="Configuración del Sistema"
                subtitle="Administración de conectividad, cobros y perfil de usuario"
                icon={<SettingsSuggestOutlinedIcon />}
                iconColor="primary"
            />

            {/* Fila 1: WiFi y Tarifas en 2 columnas */}
            <div className="settings-row">
                <div className="settings-col">
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <div className="header-icon icon-wifi">
                                <WifiIcon />
                            </div>
                            <div>
                                <h3 className="settings-card-title">Conectividad ESP32</h3>
                                <p className="settings-card-subtitle">Configuración de red inalámbrica del hardware</p>
                            </div>
                        </div>
                        <div className="settings-card-content">
                            <WifiConfig connected={connected} onSendConfig={publishWifiConfig} />
                        </div>
                    </div>
                </div>

                <div className="settings-col">
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <div className="header-icon icon-money">
                                <AttachMoneyIcon />
                            </div>
                            <div>
                                <h3 className="settings-card-title">Esquema de Tarifas</h3>
                                <p className="settings-card-subtitle">Definición de costos por tiempo de uso</p>
                            </div>
                        </div>
                        <div className="settings-card-content">
                            <div className="input-group">
                                <TextField
                                    fullWidth
                                    label="Costo Base (1ra Hora)"
                                    type="number"
                                    value={localRates.base}
                                    onChange={(e) => setLocalRates({ ...localRates, base: parseFloat(e.target.value) })}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">S/.</InputAdornment>,
                                    }}
                                    variant="outlined"
                                    className="settings-input"
                                />
                            </div>
                            <div className="input-group">
                                <TextField
                                    fullWidth
                                    label="Minuto Adicional"
                                    type="number"
                                    value={localRates.minute}
                                    onChange={(e) => setLocalRates({ ...localRates, minute: parseFloat(e.target.value) })}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">S/.</InputAdornment>,
                                    }}
                                    variant="outlined"
                                    className="settings-input"
                                    helperText="Se aplica después de la primera hora"
                                />
                            </div>
                            <Button
                                variant="contained"
                                onClick={handleSaveRates}
                                fullWidth
                                startIcon={<SaveOutlinedIcon />}
                                className="settings-button"
                                sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                            >
                                Guardar Tarifas
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fila 2: Perfil de Usuario ancho completo */}
            <div className="settings-row">
                <div className="settings-col-full">
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <div className="header-icon icon-profile">
                                <PersonOutlineIcon />
                            </div>
                            <div>
                                <h3 className="settings-card-title">Perfil de Usuario</h3>
                                <p className="settings-card-subtitle">Información personal y credenciales de acceso</p>
                            </div>
                        </div>
                        <div className="settings-card-content">
                            <div className="profile-container">
                                <div className="profile-avatar">
                                    <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2.5rem' }}>
                                        {userProfile.name.charAt(0)}
                                    </Avatar>
                                </div>
                                <div className="profile-fields">
                                    <div className="profile-row">
                                        <div className="profile-input">
                                            <TextField
                                                fullWidth
                                                label="Nombre Completo"
                                                value={userProfile.name}
                                                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start"><BadgeIcon color="action" /></InputAdornment>,
                                                }}
                                                variant="outlined"
                                                className="settings-input"
                                            />
                                        </div>
                                        <div className="profile-input">
                                            <TextField
                                                fullWidth
                                                label="Correo Electrónico"
                                                value={userProfile.email}
                                                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start"><EmailOutlinedIcon color="action" /></InputAdornment>,
                                                }}
                                                variant="outlined"
                                                className="settings-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="profile-row">
                                        <div className="profile-input">
                                            <TextField
                                                fullWidth
                                                label="Rol"
                                                value={userProfile.role}
                                                disabled
                                                variant="outlined"
                                                className="settings-input"
                                            />
                                        </div>
                                        <div className="profile-input">
                                            <Button
                                                variant="contained"
                                                onClick={handleSaveProfile}
                                                fullWidth
                                                startIcon={<SaveOutlinedIcon />}
                                                className="settings-button"
                                            >
                                                Actualizar Perfil
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
