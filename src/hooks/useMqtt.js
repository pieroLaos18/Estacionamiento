
import { useState, useEffect } from "react";
import mqtt from "mqtt";

// ============================================
// CONFIGURACIÓN MQTT - HiveMQ Cloud
// ============================================

// --- Configuración del compañero (comentada) ---
// const MQTT_BROKER_URL = "wss://33602f86bce34f23b85e3669cc41f0a6.s1.eu.hivemq.cloud:8884/mqtt";
// const MQTT_USER = "esp32_user";
// const MQTT_PASSWORD = "18122002Pi";

// --- Configuración de Rodrigo (activa) ---
// URL del broker MQTT (WebSocket Secure - Puerto 8884 para navegadores)
// Nota: El ESP32 usa puerto 8883 (MQTT/TLS), la web usa 8884 (WSS)
const MQTT_BROKER_URL = process.env.REACT_APP_MQTT_BROKER_URL;
const MQTT_USER = process.env.REACT_APP_MQTT_USER;
const MQTT_PASSWORD = process.env.REACT_APP_MQTT_PASSWORD;
const topics = [
    "estacionamiento/plaza1/estado",
    "estacionamiento/plaza2/estado",
    "estacionamiento/plaza3/estado",
    "estacionamiento/puerta/entrada/estado",
    "estacionamiento/puerta/salida/estado",
    "estacionamiento/modo/estado",
    // Nuevos tópicos para eventos de entrada
    "estacionamiento/eventos/entrada",
    "estacionamiento/eventos/estacionado",
    "estacionamiento/eventos/salida",
    "estacionamiento/eventos/salida_detectada", // Nuevo tópico
];

export default function useMqtt() {
    const [plaza1, setPlaza1] = useState({ ocupado: false, distancia: 0 });
    const [plaza2, setPlaza2] = useState({ ocupado: false, distancia: 0 });
    const [plaza3, setPlaza3] = useState({ ocupado: false, distancia: 0 });

    const [puertaEntradaAbierta, setPuertaEntradaAbierta] = useState(false);
    const [puertaSalidaAbierta, setPuertaSalidaAbierta] = useState(false);

    const [modoAutomatico, setModoAutomatico] = useState(false);
    const [connected, setConnected] = useState(false);
    const [mqttClient, setMqttClient] = useState(null);

    // Estados para eventos de entrada/salida
    const [vehiculoDetectado, setVehiculoDetectado] = useState(false);
    const [salidaDetectada, setSalidaDetectada] = useState(false); // Nuevo estado
    const [vehiculoEstacionado, setVehiculoEstacionado] = useState(null); // {plaza, timestamp}
    const [ultimaSalida, setUltimaSalida] = useState(null); // {plaza, timestamp}

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
            console.log("Conectado al broker MQTT");
            topics.forEach((topic) => {
                client.subscribe(topic, (err) => {
                    if (!err) {
                        console.log(`Suscrito a: ${topic}`);
                    } else {
                        console.error(`Error al suscribirse a ${topic}:`, err);
                    }
                });
            });
        });

        client.on("message", (topic, message) => {
            const payload = message.toString();

            if (topic === "estacionamiento/plaza1/estado") {
                const data = JSON.parse(payload);
                setPlaza1(data);
                // Actualizar estado de puerta si viene en el mensaje
                if (data.entradaAbierta !== undefined) {
                    setPuertaEntradaAbierta(data.entradaAbierta === true || data.entradaAbierta === "true");
                }
            } else if (topic === "estacionamiento/plaza2/estado") {
                setPlaza2(JSON.parse(payload));
            } else if (topic === "estacionamiento/plaza3/estado") {
                setPlaza3(JSON.parse(payload));
            } else if (topic === "estacionamiento/puerta/entrada/estado") {
                setPuertaEntradaAbierta(payload === "abierta");
            } else if (topic === "estacionamiento/puerta/salida/estado") {
                setPuertaSalidaAbierta(payload === "abierta");
            } else if (topic === "estacionamiento/modo/estado") {
                setModoAutomatico(payload === "automatico");
            } else if (topic === "estacionamiento/eventos/entrada") {
                const data = JSON.parse(payload);
                if (data.evento === "vehiculo_detectado") {
                    setVehiculoDetectado(true);
                }
            } else if (topic === "estacionamiento/eventos/salida_detectada") { // Nuevo evento
                const data = JSON.parse(payload);
                if (data.evento === "salida_detectada") {
                    setSalidaDetectada(true);
                }
            } else if (topic === "estacionamiento/eventos/estacionado") {
                const data = JSON.parse(payload);
                if (data.evento === "vehiculo_estacionado") {
                    setVehiculoEstacionado({
                        plaza: data.plaza,
                        timestamp: Date.now()
                    });
                    setVehiculoDetectado(false); // Resetear detección de entrada
                }
            } else if (topic === "estacionamiento/eventos/salida") {
                const data = JSON.parse(payload);
                if (data.evento === "plaza_liberada") {
                    setUltimaSalida({
                        plaza: data.plaza,
                        timestamp: Date.now()
                    });
                }
            }
        });

        client.on("close", () => {
            setConnected(false);
            console.log("Desconectado del broker MQTT");
        });

        client.on("error", (err) => {
            console.error("Error en la conexión MQTT:", err);
        });

        return () => client.end(true);
    }, []);

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

    const publishWifiConfig = (ssid, pass) => {
        const config = JSON.stringify({ ssid, pass });
        mqttClient?.publish("estacionamiento/wifi/config", config);
    };

    const resetVehiculoDetectado = () => {
        setVehiculoDetectado(false);
    };
    
    const resetSalidaDetectada = () => { // Nuevo reset
        setSalidaDetectada(false);
    };

    const resetVehiculoEstacionado = () => {
        setVehiculoEstacionado(null);
    };

    const resetUltimaSalida = () => {
        setUltimaSalida(null);
    };

    return {
        plaza1,
        plaza2,
        plaza3,
        puertaEntradaAbierta,
        puertaSalidaAbierta,
        modoAutomatico,
        connected,
        handleAbrirEntrada,
        handleCerrarEntrada,
        handleAbrirSalida,
        handleCerrarSalida,
        handleToggleModo,
        publishWifiConfig,
        // Nuevos estados y funciones para entrada/salida
        vehiculoDetectado,
        salidaDetectada, // Nuevo estado
        vehiculoEstacionado,
        ultimaSalida,
        resetVehiculoDetectado,
        resetSalidaDetectada, // Nueva función
        resetVehiculoEstacionado,
        resetUltimaSalida,
    };
}
