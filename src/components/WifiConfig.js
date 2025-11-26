/**
 * @file WifiConfig.js
 * @description Componente para configurar las credenciales WiFi del ESP32.
 * Permite enviar el SSID y contraseña al dispositivo para que pueda conectarse a la red.
 */

import React, { useState } from "react";
import {
    Grid,
    TextField,
    Button,
    Alert,
} from "@mui/material";

export default function WifiConfig({ connected, onSendConfig }) {
    const [wifiSSID, setWifiSSID] = useState("");
    const [wifiPassword, setWifiPassword] = useState("");
    const [wifiStatus, setWifiStatus] = useState(null);

    const handleEnviarWifi = () => {
        if (!wifiSSID || !wifiPassword) {
            setWifiStatus({ type: "warning", msg: "Complete ambos campos" });
            return;
        }

        onSendConfig(wifiSSID, wifiPassword);

        setWifiStatus({
            type: "success",
            msg: `Configuración enviada: ${wifiSSID}`,
        });
        setWifiSSID("");
        setWifiPassword("");
    };

    return (
        <div className="wifi-config-container">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Nombre de la Red (SSID)"
                        value={wifiSSID}
                        onChange={(e) => setWifiSSID(e.target.value)}
                        variant="outlined"
                        className="settings-input"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Contraseña WiFi"
                        type="password"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        variant="outlined"
                        className="settings-input"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleEnviarWifi}
                        disabled={!connected}
                        className="settings-button"
                    >
                        Actualizar WiFi
                    </Button>
                </Grid>
            </Grid>

            {wifiStatus && (
                <Alert severity={wifiStatus.type} sx={{ mt: 2, borderRadius: '8px' }}>
                    {wifiStatus.msg}
                </Alert>
            )}
        </div>
    );
}
