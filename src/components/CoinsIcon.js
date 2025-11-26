import React from "react";
import SvgIcon from "@mui/material/SvgIcon";

export default function CoinsIcon(props) {
    return (
        <SvgIcon {...props} viewBox="0 0 24 24">
            {/* Moneda frontal */}
            <circle cx="10" cy="12" r="6" fill="currentColor" opacity="0.9" />
            {/* Moneda trasera desplazada */}
            <circle cx="14" cy="10" r="6" fill="currentColor" opacity="0.45" />
        </SvgIcon>
    );
}
