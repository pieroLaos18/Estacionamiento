import React, { useState } from "react";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Avatar, Badge, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LocalParkingOutlinedIcon from "@mui/icons-material/LocalParkingOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import WifiIcon from "@mui/icons-material/Wifi";
import GarageOutlinedIcon from "@mui/icons-material/GarageOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import "./DashboardLayout.css";

const DRAWER_WIDTH = 260;

export default function DashboardLayout({ children, connected }) {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { text: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/" },
        { text: "Estacionamiento", icon: <LocalParkingOutlinedIcon />, path: "/parking" },
        { text: "Configuración", icon: <SettingsOutlinedIcon />, path: "/settings" },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box className="sidebar-container">
            <Box className="sidebar-header">
                <GarageOutlinedIcon className="sidebar-logo" />
                <Typography variant="h6" className="sidebar-title">
                    ParkAdmin
                </Typography>
            </Box>

            <List className="sidebar-menu">
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding className="sidebar-menu-item">
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) setMobileOpen(false);
                            }}
                            className={`sidebar-button ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <ListItemIcon className="sidebar-icon">
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} className="sidebar-text" />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                className="dashboard-appbar"
                sx={{
                    width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { lg: `${DRAWER_WIDTH}px` },
                }}
            >
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        Smart Parking System
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Badge color={connected ? "success" : "error"} variant="dot">
                            <WifiIcon color={connected ? "success" : "disabled"} />
                        </Badge>
                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {connected ? "Online" : "Offline"}
                        </Typography>
                        <Avatar sx={{ bgcolor: "#1565c0", width: 36, height: 36 }}>A</Avatar>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}
            >
                {isMobile ? (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: DRAWER_WIDTH,
                            },
                        }}
                    >
                        {drawer}
                    </Drawer>
                ) : (
                    <Drawer
                        variant="permanent"
                        sx={{
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: DRAWER_WIDTH,
                            },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                )}
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, sm: 2 },
                    width: '100%',
                    bgcolor: '#f7fafc',
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}
