import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ParkingProvider } from "./context/ParkingContext";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ParkingLotPage from "./pages/ParkingLotPage";
import SettingsPage from "./pages/SettingsPage";
import useMqtt from "./hooks/useMqtt";
import "./App.css";

export default function App() {
  const mqttData = useMqtt();

  return (
    <ParkingProvider>
      <BrowserRouter>
        <DashboardLayout connected={mqttData.connected}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route
              path="/parking"
              element={<ParkingLotPage {...mqttData} />}
            />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  connected={mqttData.connected}
                  publishWifiConfig={mqttData.publishWifiConfig}
                />
              }
            />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </ParkingProvider>
  );
}
