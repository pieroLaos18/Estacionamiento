/**
 * Calcula la tarifa de estacionamiento basada en el tiempo transcurrido
 *
 * Reglas:
 * - Primera hora: S/. 5.00 (tarifa mínima)
 * - Después de la primera hora: S/. 0.10 por minuto adicional
 */
export function calculateParkingFee(entryTimestamp, nowTimestamp = Date.now(), rates = { base: 5.00, minute: 0.10 }) {
    const now = nowTimestamp;
    const elapsed = now - entryTimestamp;
    const minutes = Math.floor(elapsed / 60000);

    // Tarifa mínima: Costo base (primera hora)
    if (minutes <= 60) {
        return {
            minutes,
            fee: rates.base
        };
    }

    // Después de la primera hora: Costo por minuto adicional
    const additionalMinutes = minutes - 60;
    const fee = rates.base + (additionalMinutes * rates.minute);

    return {
        minutes,
        fee: parseFloat(fee.toFixed(2))
    };
}

/**
 * Formatea el tiempo transcurrido en formato legible
 * @param {number} minutes - Minutos transcurridos
 * @returns {string} Formato "Xh Ymin Zs"
 */
export function formatElapsedTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.round((minutes * 60) % 60);

    if (hours === 0) {
        return `${mins}min ${secs}s`;
    }

    return `${hours}h ${mins}min ${secs}s`;
}

/**
 * Formatea la tarifa en soles peruanos
 * @param {number} fee - Tarifa en soles
 * @returns {string} Formato "S/. X.XX"
 */
export function formatCurrency(fee) {
    return `S/. ${fee.toFixed(2)}`;
}
