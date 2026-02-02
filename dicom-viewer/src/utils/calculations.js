/**
 * CONVERSIÓN PÍXELES A MM REALES
 */
export const pixelsToMmReal = (dx, dy, spacingStr) => {
    if (!spacingStr) return Math.sqrt(dx * dx + dy * dy);
    const [rowSpacing, colSpacing] = spacingStr.split('\\').map(Number);
    const realDX = dx * (colSpacing || 1);
    const realDY = dy * (rowSpacing || 1);
    return Math.sqrt(realDX * realDX + realDY * realDY);
};

/**
 * ÁNGULO DE COBB (ESCOLIOSIS)
 */

export const calculateCobbAngle = (line1, line2) => {
    if (!line1 || !line2) return "0.0";
    const getAngle = (l) => Math.atan2(l.end.y - l.start.y, l.end.x - l.start.x);
    const angle1 = getAngle(line1);
    const angle2 = getAngle(line2);
    let diff = Math.abs(angle1 - angle2) * (180 / Math.PI);
    if (diff > 90) diff = 180 - diff;
    return diff.toFixed(1);
};

/**
 * MEDICIÓN BIDIRECCIONAL (Eje Mayor x Menor)
 * Utilizada para seguimiento de nódulos y masas.
 */

export const calculateBidirectional = (line1, line2) => {
    if (!line1 || !line2) return "0.0 x 0.0";
    return `${parseFloat(line1.value).toFixed(1)} x ${parseFloat(line2.value).toFixed(1)} mm`;
};

/**
 * ÍNDICE CARDIOTORÁCICO (ICT)
 */
export const calculateCTRPercentage = (heartLength, thoraxLength) => {
    const h = parseFloat(heartLength);
    const t = parseFloat(thoraxLength);
    if (!t || t === 0) return "0.00";
    return ((h / t) * 100).toFixed(1);
};

export const getClinicalStatusCTR = (percentage, projection = 'PA') => {
    const val = parseFloat(percentage);
    const normalLimit = projection === 'AP' ? 55.0 : 50.0;

    if (val <= normalLimit) return { label: "NORMAL", color: "#4ade80" };
    if (val <= normalLimit + 5) return { label: "CARDIOMEGALIA G1", color: "#facc15" };
    if (val <= normalLimit + 10) return { label: "CARDIOMEGALIA G2", color: "#fb923c" };
    return { label: "CARDIOMEGALIA G3 (CRÍTICO)", color: "#ef4444" };
};

/**
 * ÁREA DE POLÍGONO (DENSITOMETRÍA / ROI)
 */
export const calculatePolygonArea = (points, spacingStr) => {
    if (!points || points.length < 3) return "0.0";
    const spacing = spacingStr ? spacingStr.split('\\').map(Number) : [1, 1];
    const rowSpacing = spacing[0] || 1;
    const colSpacing = spacing[1] || 1;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        const x1 = points[i].x * colSpacing;
        const y1 = points[i].y * rowSpacing;
        const x2 = points[j].x * colSpacing;
        const y2 = points[j].y * rowSpacing;
        area += (x1 * y2) - (x2 * y1);
    }
    return Math.abs(area / 2).toFixed(1);
};

/**
 * ÁNGULO SIMPLE (3 PUNTOS)
 */
export const calculateAngle = (p1, p2, p3) => {
    if (!p1 || !p2 || !p3) return "0.0";
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    const cos = dot / (mag1 * mag2);
    return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI).toFixed(1);
};

// Aliases de compatibilidad
export const getICTStatus = getClinicalStatusCTR;
/**
 * ÁREA DE ELIPSE
 * Fórmula: π * RadioMayor * RadioMenor
 */
export const calculateEllipseArea = (radiusX, radiusY, spacingStr) => {
    if (!radiusX || !radiusY) return "0.0";
    
    // Obtenemos el espaciado físico del DICOM (Pixel Spacing)
    const spacing = spacingStr ? spacingStr.split('\\').map(Number) : [1, 1];
    const realRX = radiusX * (spacing[1] || 1); // Ancho real
    const realRY = radiusY * (spacing[0] || 1); // Alto real
    
    // Área = π * A * B
    return (Math.PI * realRX * realRY).toFixed(1);
};
export const calculatePolylineLength = (points, pixelSpacing) => {
    if (!points || points.length < 2) return "0.0";
    const spacing = pixelSpacing ? pixelSpacing.split('\\').map(Number) : [1, 1];
    let totalDist = 0;

    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i+1];
        // Pitágoras ajustado al espaciado real del DICOM
        const dx = (p2.x - p1.x) * (spacing[0] || 1);
        const dy = (p2.y - p1.y) * (spacing[1] || 1);
        totalDist += Math.sqrt(dx*dx + dy*dy);
    }
    return totalDist.toFixed(1);
};
// ... al final del archivo ...

export const calculateFreehandArea = (points, pixelSpacing) => {
    if (!points || points.length < 3) return "0.0";
    
    const spacing = pixelSpacing ? pixelSpacing.split('\\').map(Number) : [1, 1];
    const spX = spacing[0] || 1;
    const spY = spacing[1] || 1;

    let area = 0;
    const n = points.length;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n; // El siguiente punto (circular)
        // Multiplicamos coordenadas ajustadas al espaciado real (mm)
        area += (points[i].x * spX * points[j].y * spY);
        area -= (points[j].x * spX * points[i].y * spY);
    }

    return (Math.abs(area) / 2).toFixed(1);
};
export const calculateRectangleArea = (start, end, pixelSpacing) => {
    const spacing = pixelSpacing ? pixelSpacing.split('\\').map(Number) : [1, 1];
    const width = Math.abs(end.x - start.x) * (spacing[0] || 1);
    const height = Math.abs(end.y - start.y) * (spacing[1] || 1);
    return (width * height).toFixed(1);
};