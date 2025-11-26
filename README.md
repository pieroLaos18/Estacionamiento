# 🚗 Sistema de Gestión de Estacionamiento

Sistema inteligente de gestión de estacionamiento con dashboard en tiempo real, control de entradas/salidas y monitoreo de plazas mediante sensores IoT.

## 📋 Descripción

Aplicación web moderna desarrollada con React que permite:
- **Dashboard en tiempo real** con métricas y gráficos
- **Control de entradas y salidas** de vehículos
- **Monitoreo de plazas** con sensores ultrasónicos
- **Control de barreras** automáticas
- **Cálculo automático de tarifas** en Soles Peruanos (S/.)
- **Integración MQTT** para comunicación IoT

## 🛠️ Tecnologías

### Frontend
- **React 19** - Framework principal
- **Material-UI (MUI)** - Componentes de interfaz
- **Recharts** - Visualización de datos
- **React Router** - Navegación
- **MQTT.js** - Comunicación IoT

### Backend (Separado)
- **Node.js + Express** - API REST
- **MySQL** - Base de datos
- **MQTT Broker** - HiveMQ Cloud

## 📦 Requisitos Previos

- **Node.js** >= 14.x
- **npm** >= 6.x
- **Backend** del sistema corriendo (ver repositorio backend)
- **Broker MQTT** configurado (HiveMQ Cloud)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Estacionamiento
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto copiando el archivo de ejemplo:

```bash
cp .env_example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# URL del Backend API
REACT_APP_API_URL=http://localhost:3001/api

# Configuración MQTT Broker (HiveMQ Cloud)
REACT_APP_MQTT_BROKER_URL=wss://tu-broker.hivemq.cloud:8884/mqtt
REACT_APP_MQTT_USER=tu-usuario-mqtt
REACT_APP_MQTT_PASSWORD=tu-password-mqtt
```

> ⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` a GitHub. Las credenciales deben mantenerse privadas.

### 4. Iniciar el Backend

Antes de iniciar el frontend, asegúrate de que el backend esté corriendo:

```bash
# En el directorio del backend
npm start
```

El backend debe estar corriendo en `http://localhost:3001`

### 5. Iniciar la Aplicación

```bash
npm start
```

La aplicación se abrirá automáticamente en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
Estacionamiento/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── DoorControl.js
│   │   ├── ParkingSpots.js
│   │   └── StatCard.js
│   ├── context/         # Context API
│   │   └── ParkingContext.js
│   ├── hooks/           # Custom hooks
│   │   └── useMQTT.js
│   ├── layouts/         # Layouts de página
│   │   └── DashboardLayout.js
│   ├── pages/           # Páginas principales
│   │   ├── DashboardPage.js
│   │   ├── ParkingLotPage.js
│   │   └── SettingsPage.js
│   ├── App.js           # Componente principal
│   └── index.js         # Punto de entrada
├── .env                 # Variables de entorno (NO SUBIR)
├── .env_example         # Ejemplo de variables
├── .gitignore           # Archivos ignorados por Git
├── package.json         # Dependencias
└── README.md            # Este archivo
```

## 🔧 Scripts Disponibles

```bash
# Iniciar en modo desarrollo
npm start

# Crear build de producción
npm run build

# Ejecutar tests
npm test

# Eject (no recomendado)
npm run eject
```

## 🌐 Configuración del Backend

El frontend se comunica con un backend Node.js/Express. Asegúrate de:

1. **Backend corriendo** en el puerto configurado (default: 3001)
2. **Base de datos MySQL** configurada y con las tablas creadas
3. **MQTT Broker** accesible desde el backend

Ver el README del backend para instrucciones detalladas de configuración.

## 📡 Configuración MQTT

El sistema usa MQTT para comunicación en tiempo real con los sensores IoT:

### Tópicos MQTT

- `parking/plaza1` - Estado de plaza 1
- `parking/plaza2` - Estado de plaza 2
- `parking/plaza3` - Estado de plaza 3
- `parking/puerta_entrada` - Control barrera entrada
- `parking/puerta_salida` - Control barrera salida

### Formato de Mensajes

```json
{
  "distancia": 15,
  "ocupado": true
}
```

## 💰 Sistema de Tarifas

El sistema calcula automáticamente las tarifas en **Soles Peruanos (S/.)**:

- Tarifa base configurable
- Cálculo por minutos
- Visualización en tiempo real

## 🎨 Características de la UI

- **Dashboard moderno** con gráficos interactivos
- **Diseño responsive** (desktop, tablet, móvil)
- **Tema minimalista** con degradados
- **Sidebar colapsable** con navegación
- **Iconos outlined** de Material-UI
- **Animaciones suaves** con transiciones CSS

## 🔒 Seguridad

- Variables de entorno para credenciales sensibles
- `.env` excluido de Git
- Validación de datos en frontend y backend
- Conexión segura MQTT (WSS)

## 📝 Notas para el Equipo

### Antes de hacer Push a GitHub

1. ✅ Verificar que `.env` NO esté en el repositorio
2. ✅ Actualizar `.env_example` con las variables necesarias
3. ✅ Asegurar que `node_modules/` esté en `.gitignore`
4. ✅ Verificar que `build/` esté en `.gitignore`
5. ✅ Documentar cambios importantes en el README

### Para tu Compañero

Tu compañero debe:

1. **Clonar el repositorio**
2. **Instalar dependencias**: `npm install`
3. **Crear archivo `.env`** con las credenciales correctas
4. **Configurar y ejecutar el backend** primero
5. **Ejecutar el frontend**: `npm start`

## 🐛 Troubleshooting

### Error: Cannot connect to backend

- Verifica que el backend esté corriendo en el puerto correcto
- Revisa la variable `REACT_APP_API_URL` en `.env`

### Error: MQTT connection failed

- Verifica las credenciales MQTT en `.env`
- Asegúrate de que el broker HiveMQ esté accesible
- Revisa que la URL use `wss://` (WebSocket Secure)

### Página en blanco

- Limpia la caché del navegador
- Ejecuta `npm install` nuevamente
- Verifica la consola del navegador para errores

## 📄 Licencia

Este proyecto es privado y de uso interno.

## 👥 Autores

- Equipo de Desarrollo - Sistema de Estacionamiento Inteligente

---

**Última actualización**: Noviembre 2024
