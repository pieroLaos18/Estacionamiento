import React, { useState, useEffect } from "react";
import mqtt from "mqtt";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Fade,
  Avatar,
  Badge,
  Button,
  Stack,
  Divider,
  Alert,
  TextField,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DoorFrontIcon from "@mui/icons-material/DoorFront";
import WifiIcon from "@mui/icons-material/Wifi";
import SettingsIcon from "@mui/icons-material/Settings";
import GarageIcon from "@mui/icons-material/Garage";

// --- Configuración MQTT ---
const MQTT_BROKER_URL =
  "wss://33602f86bce34f23b85e3669cc41f0a6.s1.eu.hivemq.cloud:8884/mqtt";
const MQTT_USER = "esp32_user";
const MQTT_PASSWORD = "18122002Pi";
const topics = [
  "estacionamiento/plaza1/estado",
  "estacionamiento/plaza2/estado",
  "estacionamiento/plaza3/estado",
  "estacionamiento/puerta/entrada/estado",
  "estacionamiento/puerta/salida/estado",
  "estacionamiento/modo/estado",
];

export default function App() {
  const [plaza1, setPlaza1] = useState({ ocupado: false, distancia: 0 });
  const [plaza2, setPlaza2] = useState({ ocupado: false, distancia: 0 });
  const [plaza3, setPlaza3] = useState({ ocupado: false, distancia: 0 });

  const [puertaEntradaAbierta, setPuertaEntradaAbierta] = useState(false);
  const [puertaSalidaAbierta, setPuertaSalidaAbierta] = useState(false);

  const [modoAutomatico, setModoAutomatico] = useState(false);
  const [connected, setConnected] = useState(false);
  const [mqttClient, setMqttClient] = useState(null);

  // --- Estados para configuración Wi-Fi ---
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiStatus, setWifiStatus] = useState(null);

  // --- Conexión MQTT ---
  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER_URL, {
      username: MQTT_USER,
      password: MQTT_PASSWORD,
      keepalive: 60,
      reconnectPeriod: 2000,
      clean: true,
    });

    setMqttClient(client);

    client.on("connect", () => {
      setConnected(true);
      topics.forEach((topic) => client.subscribe(topic));
    });

    client.on("reconnect", () => setConnected(false));
    client.on("close", () => setConnected(false));

    client.on("message", (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());

        if (topic.includes("plaza1")) {
          setPlaza1({ ocupado: payload.ocupado, distancia: payload.distancia });
        } else if (topic.includes("plaza2")) {
          setPlaza2({ ocupado: payload.ocupado, distancia: payload.distancia });
        } else if (topic.includes("plaza3")) {
          setPlaza3({ ocupado: payload.ocupado, distancia: payload.distancia });
        } else if (topic.includes("puerta/entrada")) {
          setPuertaEntradaAbierta(payload.abierta);
        } else if (topic.includes("puerta/salida")) {
          setPuertaSalidaAbierta(payload.abierta);
        } else if (topic.includes("modo")) {
          setModoAutomatico(payload.automatico);
        }
      } catch (e) {
        console.error("Error parsing MQTT message", e);
      }
    });

    return () => client.end(true);
  }, []);

  // --- Funciones de control ---
  const handleAbrirEntrada = () => {
    mqttClient?.publish("estacionamiento/puerta/control", "abrirEntrada");
  };
  const handleCerrarEntrada = () => {
    mqttClient?.publish("estacionamiento/puerta/control", "cerrarEntrada");
  };
  const handleAbrirSalida = () => {
    mqttClient?.publish("estacionamiento/puerta/control", "abrirSalida");
  };
  const handleCerrarSalida = () => {
    mqttClient?.publish("estacionamiento/puerta/control", "cerrarSalida");
  };
  const handleToggleModo = () => {
    const nuevoModo = !modoAutomatico;
    mqttClient?.publish(
      "estacionamiento/puerta/control",
      nuevoModo ? "auto" : "manual"
    );
    setModoAutomatico(nuevoModo);
  };

  // --- Enviar configuración Wi-Fi ---
  const handleEnviarWifi = () => {
    if (!wifiSSID || !wifiPassword) {
      setWifiStatus({ type: "warning", msg: "Complete ambos campos" });
      return;
    }

    const config = JSON.stringify({
      ssid: wifiSSID,
      pass: wifiPassword,
    });

    mqttClient?.publish("estacionamiento/wifi/config", config);
    setWifiStatus({
      type: "success",
      msg: `Configuración enviada: ${wifiSSID}`,
    });
    setWifiSSID("");
    setWifiPassword("");
  };

  // --- UI ---
  return (
    <Container
      maxWidth="md"
      sx={{
        py: 5,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* ENCABEZADO */}
      <Box textAlign="center" mb={3}>
        <Avatar
          sx={{
            bgcolor: "#1565c0",
            width: 64,
            height: 64,
            mx: "auto",
            mb: 1,
          }}
        >
          <GarageIcon fontSize="large" />
        </Avatar>
        <Typography variant="h4" fontWeight="bold" color="#123">
          Panel de Estacionamiento Inteligente
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Monitoreo y control remoto vía MQTT
        </Typography>

        <Badge color={connected ? "success" : "error"} variant="dot" sx={{ mt: 1 }}>
          <Chip
            icon={<WifiIcon />}
            label={connected ? "Conectado" : "Desconectado"}
            color={connected ? "success" : "error"}
            sx={{ fontWeight: "bold", mt: 1 }}
          />
        </Badge>
      </Box>

      <Stack spacing={3} sx={{ width: "100%" }}>
        {/* CONFIGURACIÓN WIFI */}
        <Card elevation={5} sx={{ background: "#f1f8e9" }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
              Configuración Wi-Fi del ESP32
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SSID"
                  value={wifiSSID}
                  onChange={(e) => setWifiSSID(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  type="password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} textAlign="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEnviarWifi}
                  disabled={!connected}
                  sx={{ borderRadius: "50px", px: 4 }}
                >
                  Enviar Configuración
                </Button>
              </Grid>
            </Grid>

            {wifiStatus && (
              <Alert severity={wifiStatus.type} sx={{ mt: 2 }}>
                {wifiStatus.msg}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* MODO */}
        <Card
          elevation={5}
          sx={{
            background: modoAutomatico
              ? "linear-gradient(135deg, #e8f5e9, #c8e6c9)"
              : "linear-gradient(135deg, #fff3e0, #ffe0b2)",
            transition: "0.4s",
          }}
        >
          <CardContent sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                bgcolor: modoAutomatico ? "success.main" : "warning.main",
                mx: "auto",
                mb: 1,
              }}
            >
              <SettingsIcon />
            </Avatar>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {modoAutomatico ? "Modo Automático" : "Modo Manual"}
            </Typography>
            <Button
              variant="contained"
              color={modoAutomatico ? "warning" : "success"}
              onClick={handleToggleModo}
              disabled={!connected}
              sx={{
                borderRadius: "50px",
                px: 4,
                py: 1,
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              {modoAutomatico ? "Cambiar a Manual" : "Cambiar a Automático"}
            </Button>
          </CardContent>
        </Card>

        {/* PLAZAS */}
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#1565c0" mb={1}>
            Estado de Plazas
          </Typography>
          <Grid container spacing={2}>
            {[plaza1, plaza2, plaza3].map((plaza, i) => (
              <Grid key={i} item xs={12} sm={4}>
                <Fade in timeout={500}>
                  <Card
                    elevation={4}
                    sx={{
                      background: plaza.ocupado
                        ? "linear-gradient(135deg, #ffcdd2, #ef9a9a)"
                        : "linear-gradient(135deg, #c8e6c9, #a5d6a7)",
                      transition: "0.3s",
                      "&:hover": { transform: "scale(1.03)" },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <Avatar
                        sx={{
                          bgcolor: plaza.ocupado ? "error.main" : "success.main",
                          width: 50,
                          height: 50,
                          mb: 1,
                          mx: "auto",
                        }}
                      >
                        <DirectionsCarIcon fontSize="medium" />
                      </Avatar>
                      <Typography variant="h6">Plaza {i + 1}</Typography>
                      <Chip
                        label={plaza.ocupado ? "Ocupada" : "Libre"}
                        color={plaza.ocupado ? "error" : "success"}
                        sx={{ fontWeight: "bold", mt: 1 }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Distancia: <strong>{plaza.distancia} cm</strong>
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CONTROL DE PUERTAS */}
        <Divider />
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#6d4c41" mb={1}>
            Control de Puertas
          </Typography>

          {/* Puerta Entrada */}
          <Card
            elevation={5}
            sx={{
              bgcolor: puertaEntradaAbierta ? "#e3f2fd" : "#f5f5f5",
              py: 2,
              mb: 3,
              transition: "0.3s",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  bgcolor: puertaEntradaAbierta ? "info.main" : "grey.500",
                  mx: "auto",
                  mb: 1,
                }}
              >
                <DoorFrontIcon />
              </Avatar>
              <Chip
                label={puertaEntradaAbierta ? "Puerta Entrada Abierta" : "Puerta Entrada Cerrada"}
                color={puertaEntradaAbierta ? "info" : "default"}
                sx={{ mb: 2 }}
              />
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  color="info"
                  disabled={!connected}
                  onClick={handleAbrirEntrada}
                  sx={{ borderRadius: "50px", px: 4 }}
                >
                  Abrir
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  disabled={!connected}
                  onClick={handleCerrarEntrada}
                  sx={{ borderRadius: "50px", px: 4 }}
                >
                  Cerrar
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Puerta Salida */}
          <Card
            elevation={5}
            sx={{
              bgcolor: puertaSalidaAbierta ? "#e3f2fd" : "#f5f5f5",
              py: 2,
              transition: "0.3s",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  bgcolor: puertaSalidaAbierta ? "info.main" : "grey.500",
                  mx: "auto",
                  mb: 1,
                }}
              >
                <DoorFrontIcon />
              </Avatar>
              <Chip
                label={puertaSalidaAbierta ? "Puerta Salida Abierta" : "Puerta Salida Cerrada"}
                color={puertaSalidaAbierta ? "info" : "default"}
                sx={{ mb: 2 }}
              />
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  color="info"
                  disabled={!connected}
                  onClick={handleAbrirSalida}
                  sx={{ borderRadius: "50px", px: 4 }}
                >
                  Abrir
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  disabled={!connected}
                  onClick={handleCerrarSalida}
                  sx={{ borderRadius: "50px", px: 4 }}
                >
                  Cerrar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* ALERTA */}
        {!connected && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            La conexión MQTT está inactiva. No se pueden controlar la puerta ni mostrar los últimos estados.
          </Alert>
        )}

        {/* FOOTER */}
        <Box textAlign="center" mt={3} color="#889">
          <Typography variant="caption">
            Smart Parking Dashboard · React · MQTT · Material UI · 2025
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
}
