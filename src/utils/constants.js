// --- HERRAMIENTAS Y CONFIGURACIÓN ---
export const TOOLS = {
  NONE: 'none',
  WWWC: 'wwwc',
  RULER: 'ruler',
  ANGLE: 'angle',
  ROI: 'roi',
  ELLIPSE: 'ellipse',
  RECTANGLE: 'rectangle',
  ICT_COMPLEX: 'ict_complex',
  BIDIRECTIONAL: 'bidirectional',
  POLYLINE: 'polyline', // ¡Importante para oncología!
  ANNOTATION: 'annotation',
  ICT_HEART: 'ict_heart',
  ICT_THORAX: 'ict_thorax',
  WLEVEL: 'wlevel' 
};

export const TOOL_CONFIG = {
  [TOOLS.RULER]: { name: "Regla", icon: "Ruler", description: "Medir distancias lineales" },
  [TOOLS.ANGLE]: { name: "Cobb", icon: "Triangle", description: "Medir ángulos de Cobb" },
  [TOOLS.ROI]: { name: "ROI", icon: "Square", description: "Región de interés (Área)" },
  [TOOLS.BIDIRECTIONAL]: { name: "Bidireccional", icon: "Crosshair", description: "Ejes mayor y menor (Tumores)" },
  [TOOLS.ICT_COMPLEX]: { name: "ICT Auto", icon: "Activity", description: "Índice Cardiotorácico Automático" },
  [TOOLS.ANNOTATION]: { name: "Texto", icon: "Type", description: "Agregar anotación médica" },
};

export const DEFAULT_IMAGE_SETTINGS = {
  zoom: 100, 
  rotation: 0, 
  brightness: 100, 
  contrast: 100,
  invert: false
};

export const ZOOM_LIMITS = { MIN: 50, MAX: 400, STEP: 10 };
export const IMAGE_ADJUSTMENT_CONFIG = { MIN: 0, MAX: 200, DEFAULT: 100 };

export const PATIENT_INFO = {
  name: "Paciente Anónimo",
  id: "---",
  modality: "DICOM",
  viewPosition: "N/A",
  seriesUID: ""
};

export const MEASUREMENT_COLORS = {
  [TOOLS.RULER]: "#4ade80", 
  [TOOLS.ANGLE]: "#10b981", 
  [TOOLS.ROI]: "#f59e0b", 
  [TOOLS.ELLIPSE]: "#fbbf24", 
  [TOOLS.BIDIRECTIONAL]: "#a855f7", 
  [TOOLS.ANNOTATION]: "#ef4444", 
  [TOOLS.ICT_COMPLEX]: "#3b82f6", 
};

export const CANVAS_CONFIG = {
  LINE_WIDTH: 2, 
  FONT_SIZE: 12, 
  FONT_FAMILY: "Inter, system-ui, Arial",
};

export const IS_MOBILE = typeof window !== 'undefined' && 
    (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2));