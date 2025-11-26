import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function PageHeader({ title, subtitle, icon, iconColor = 'primary' }) {
    const getGradient = (color) => {
        switch (color) {
            case 'primary':
                return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            case 'secondary':
                return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
            case 'success':
                return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            case 'warning':
                return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            case 'error':
                return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            default:
                return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Paper
                elevation={0}
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: getGradient(iconColor),
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            >
                {React.cloneElement(icon, { sx: { fontSize: 24 } })}
            </Paper>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', letterSpacing: '-0.5px', mb: 0 }}>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {subtitle}
                </Typography>
            </Box>
        </Box>
    );
}
