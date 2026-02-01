🚀 Características Principales
Carga de Imágenes Híbrida:

Drag & Drop: Arrastra carpetas o archivos .dcm directamente sobre la pantalla.

Selector de Archivos: Botón clásico para explorar directorios locales.

Motor de Renderizado Profesional:

Basado en Cornerstone.js con soporte para 16-bits de profundidad.

Window / Level (W/L): Ajuste de brillo y contraste con sensibilidad dinámica (modo hueso vs. modo cerebro).

Presets Rápidos: Atajos para Pulmón, Hueso y Tejido Blando.

Zoom y Pan: Navegación fluida e intuitiva.

Cine Loop: Reproducción automática de series (CT/MRI).

Herramientas de Diagnóstico (ROI):

📏 Regla: Medición de distancias lineales.

⭕ Elipse / Rectángulo: Cálculo de área en mm².

✏️ Lápiz Libre (Freehand): Para áreas irregulares.

📐 Ángulo Cobb: Para medición de curvatura espinal.

🩺 Índice Cardiotorácico (ICT): Cálculo automático asistido.

📝 Anotaciones: Notas de texto sobre la imagen.

Sonda de Densidad: Inspección de Unidades Hounsfield (HU) en tiempo real bajo el cursor.

Gestión de Datos:

Inspector de Metadatos: Visor de etiquetas DICOM (Tags) con búsqueda y filtrado.

Reportes PDF: Generación automática de informes con tablas de mediciones usando jsPDF.

Interfaz Moderna:

Diseño Dark Mode profesional con Tailwind CSS.

Grid Layout: Visualización de 1x1, 1x2, 2x2 paneles simultáneos.

🛠️ Stack Tecnológico
Core: React + Vite

Motor DICOM:

cornerstone-core (Renderizado)

cornerstone-wado-image-loader (Carga de archivos locales)

dicom-parser (Lectura de tags)

Estilos: Tailwind CSS

Iconos: Lucide React

Reportes: jspdf + jspdf-autotable

## 📂 Arquitectura del Proyecto

El proyecto sigue una arquitectura modular basada en componentes funcionales.

```text
src/
├── components/
│   ├── DicomViewer.jsx       # EL NÚCLEO. Maneja el canvas, Cornerstone y eventos.
│   ├── Toolbar.jsx           # Barra lateral izquierda (Herramientas y Presets).
│   ├── MeasurementsPanel.jsx # Panel derecho (Lista de mediciones y PDF).
│   ├── ImageControls.jsx     # Sliders de Brillo, Contraste y Zoom.
│   ├── Header.jsx            # Barra superior (Grilla, Info Paciente).
│   ├── DragDropZone.jsx      # Wrapper que detecta archivos soltados.
│   ├── TagBrowser.jsx        # Modal inspector de etiquetas DICOM.
│   └── herramientas/         # Renderizadores SVG (Regla, Elipse, Ángulo, etc.).
├── utils/
│   ├── initCornerstone.js    # Configuración inicial de WADO y WebWorkers.
│   ├── dicomHelpers.js       # Extracción robusta de metadatos.
│   ├── calculations.js       # Matemática geométrica (Áreas, Distancias).
│   ├── pdfGenerator.js       # Lógica de creación del reporte PDF.
│   └── constants.js          # Diccionario de constantes.
└── App.jsx                   # Orquestador. Maneja el estado global.
```
💻 Instalación y Uso
Clonar el repositorio:

Bash
git clone https://github.com/juanbisaguirre/dicom-viewer.git
cd dicom-viewer
Instalar dependencias:

Bash
npm install
Iniciar servidor de desarrollo:

Bash
npm run dev
Abrir en el navegador: Visita http://localhost:5173 (o el puerto que indique Vite).

📖 Guía Rápida
Cargar Estudio: Arrastra tus archivos .dcm a la pantalla negra o usa el botón "Abrir Estudio".

Ajustar Imagen: Selecciona el icono de Sol (primero en la barra) y arrastra sobre la imagen (Derecha/Izquierda para contraste, Arriba/Abajo para brillo).

Medir: Elige una herramienta (Regla, Elipse, etc.) en la barra lateral y dibuja sobre la lesión.

Ver Datos: Haz clic en el botón "METADATOS" en la barra superior para ver la info técnica del paciente.

Exportar: Haz clic en "EXPORTAR INFORME PDF" en el panel derecho para descargar tus hallazgos.

📄 Licencia
Este proyecto está bajo la licencia MIT. Siéntete libre de usarlo y mejorarlo.

Desarrollado con ❤️ por Juan Bisaguirre