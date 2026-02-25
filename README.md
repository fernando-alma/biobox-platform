#  Biobox Platform: Arquitectura de Grado Clínico

Este documento detalla la infraestructura técnica de la plataforma Biobox Med. El sistema ha sido diseñado bajo un modelo de **microservicios desacoplados**, permitiendo una transición fluida desde entornos de prueba (Orthanc) hacia infraestructuras hospitalarias de gran escala (**dcm4che**).

El diagrama a continuación representa los componentes principales y sus interacciones.

##  Diagrama de Arquitectura (Patrón BFF)

![Arquitectura del proyecto: diagrama que muestra los tres componentes principales](/docs/diagramaarquitectura.png)

> **Nota:** La implementación del patrón **Backend for Frontend (BFF)** permite que el sistema sea agnóstico al PACS. Aunque la demo actual utiliza Orthanc, el core está preparado para operar sobre cualquier servidor compatible con DICOMweb/DIMSE, como **dcm4che**.


## Levantamiento del Entorno Local

Sigue estos pasos para levantar el entorno de desarrollo completo en tu máquina local.

### Prerrequisitos

Asegúrate de tener instalado el siguiente software:

*   [**Docker**](https://www.docker.com/get-started) y [**Docker Compose**](https://docs.docker.com/compose/install/)
*   [**Node.js**](https://nodejs.org/en/) (se recomienda v18 o superior)
*   [**npm**](https://www.npmjs.com/get-npm) o [**yarn**](https://classic.yarnpkg.com/en/docs/install/)

### Pasos de Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/fernando-alma/biobox-platform.git
    cd biobox-platform
    ```

2.  **Instala las dependencias de cada servicio:**
    ```bash
    # Para el frontend
    cd dicom-viewer
    npm install

    # Para el backend
    cd ../backend-bff
    npm install
    ```

3.  **Configuración del Entorno:**
    *   En la carpeta `backend-bff`, crea un archivo `.env`. Necesitarás añadir las variables de entorno para la configuración del PACS y los secretos para los tokens JWT.

4.  **Levanta los servicios con Docker Compose:**
    Desde la raíz del proyecto, ejecuta:
    ```bash
    docker-compose up --build
    ```

5.  **¡Listo!**
    *   El **Visor DICOM** estará disponible en `http://localhost`.
    *   El **Backend BFF** estará escuchando en `http://localhost:3000`.
    *   La **API del PACS Orthanc** estará en `http://localhost:8042`.

---

##  Desglose de Componentes

### 1. DICOM Viewer (Frontend)
- **Tecnología:** React + Vite + Tailwind CSS.
- **Motor de Renderizado:** Cornerstone.js (16-bit nativo).
- **Rol:** Procesamiento en el lado del cliente para buscar, visualizar y manipular imágenes DICOM y hacer uso de las herramientas ROI, MPR e informes PDF. 
- **Contenedor:** `biobox-frontend` (Puerto 80).

### 2. Backend for Frontend (BFF)
- **Tecnología:** Node.js + TypeScript (Robustez de tipado).
- **Responsabilidades Clave:**
    - **Aislamiento de Infraestructura:** El visor nunca conoce la IP o credenciales del PACS.
    - Actúa como una puerta de enlace segura entre el frontend y los servicios de backend.
    - Implementa la autenticación y autorización (validación de tokens JWT).
    - Orquesta las llamadas al servidor PACS de Orthanc.
    - **Resiliencia:** Implementación de "fail-safe" que permite al visor seguir operativo (modo local) incluso si el servidor PACS institucional no responde.
    - **Sanitización de Datos:** Limpieza de metadatos sensibles antes de enviar la respuesta al cliente.
- **Contenedor:** `biobox-backend` (Puerto 3000).

### 3. Servidor PACS (Capa de Persistencia)
- **Tecnología:** Orthanc (Demo) / **Preparado para dcm4che** (Producción).
- **Responsabilidad:**
    - Almacena y gestiona los estudios de imágenes médicas en formato DICOM.
    - Expone una API REST para interactuar con los datos.
- **Persistencia:** Utiliza un volumen de Docker para garantizar que los datos médicos persistan entre reinicios del contenedor.
- **Versatilidad:** La lógica del BFF traduce las peticiones del frontend a estándares industriales, facilitando la integración con el ecosistema actual de Biobox sin necesidad de modificar su monolito.
- **Contenedor:** `biobox-pacs-core` (expone el puerto 8042 para la API).

---

##  Flujo de Datos y Ciclo de Vida

![Diagrama de secuencia: Diagrama que ilustra la arquitectura de tres capas de la plataforma Biobox. La capa superior muestra el DICOM Viewer frontend en React ejecutándose en el puerto 80, la capa intermedia presenta el Backend BFF en Node.js en el puerto 3000 con autenticación JWT, y la capa inferior contiene el servidor Orthanc PACS en el puerto 8042 con almacenamiento persistente en base de datos. Las flechas bidireccionales entre capas indican la comunicación REST y el flujo de datos de solicitudes y respuestas entre componentes.](/docs/diagramasecuencia.png)


## Flujo de Datos
1.  El **usuario** interactúa con el **DICOM Viewer** en su navegador.
2.  El **DICOM Viewer** envía solicitudes (por ejemplo, para buscar un estudio) al **Backend BFF**.
3.  El **BFF** intercepta la solicitud, valida el token de autenticación del usuario a través de su **Auth Middleware**.
4.  Si la autenticación es exitosa, el **BFF** traduce y reenvía la solicitud (vía WADO-RS) a la API REST del servidor **Orthanc PACS**.
5.  **Orthanc** procesa la solicitud, interactuando con su base de datos/almacenamiento de archivos para recuperar o guardar los datos DICOM.
6.  La respuesta sigue el camino inverso hasta llegar al cliente.
7. **Streaming Binario:** Cuando el médico abre un estudio, el BFF actúa como un túnel de bytes. Recupera el archivo `.dcm` del PACS y lo envía como un stream binario al navegador, donde el motor Cornerstone realiza el renderizado de alta fidelidad.

##  Escalabilidad y Futuro (Modernización)
Este diseño es la base para el desacoplamiento estratégico del monolito de Biobox. Al mover la lógica del visor y la gestión de imágenes a este ecosistema modular, reducimos la deuda técnica y preparamos la empresa para un crecimiento en microservicios.


##  Endpoints Principales

### Sistema
- `GET /api/health`
  - *Verifica el estado del Gateway y la conexión a internet.*

### PACS (Imágenes Médicas)
- `GET /api/pacs/system`
  - *Devuelve información del servidor Orthanc conectado (versión, almacenamiento).*
- `GET /api/pacs/patients`
  - *Lista los pacientes indexados en la base de datos médica.* 
- `GET /api/pacs/studies`
  - *Lista todos los estudios disponibles en el PACS.*
- `GET /api/pacs/studies/{studyId}/instances`
  - *Obtiene la lista de IDs de instancias de un estudio.* 
- `GET /api/pacs/wado/instance/{instanceId}`
  - *Obtiene el archivo DICOM binario mediante proxy.*



##  VISOR DICOM 

**Características Principales**
- Carga de Imágenes Híbrida:



- Motor de Renderizado Profesional:

  - Basado en Cornerstone.js con soporte para 16-bits de profundidad.

- Window / Level (W/L): Ajuste de brillo y contraste con sensibilidad dinámica (modo hueso vs. modo cerebro).

- Presets Rápidos: Atajos para Pulmón, Hueso y Tejido Blando.

- Zoom y Pan: Navegación fluida e intuitiva.

- Cine Loop: Reproducción automática de series (CT/MRI).


**Herramientas de Diagnóstico (ROI):**

📏 Regla: Medición de distancias lineales.

⭕ Elipse / Rectángulo: Cálculo de área en mm².

✏️ Lápiz Libre (Freehand): Para áreas irregulares.

📐 Ángulo Cobb: Para medición de curvatura espinal.

🩺 Índice Cardiotorácico (ICT): Cálculo automático asistido.

📝 Anotaciones: Notas de texto sobre la imagen.

Sonda de Densidad: Inspección de Unidades Hounsfield (HU) en tiempo real bajo el cursor.

**Gestión de Datos:**

- Inspector de Metadatos: Visor de etiquetas DICOM (Tags) con búsqueda y filtrado.

- Reportes PDF: Generación automática de informes con tablas de mediciones usando jsPDF.

## Licencia

Este proyecto se distribuye bajo la Licencia MIT.

## Equipo y créditos

Este proyecto es el resultado de una investigación técnica profunda y un desarrollo ágil, diseñado para validar el potencial de Biobox en el sector HealthTech.


- Rocío Aguirre (PMO & Documentation): Responsable de la gestión estratégica del proyecto (Project Management Officer), elaboración del Manual de Usuario y soporte en la estructuración de la documentación técnica.

- Juan Bisaguirre: Motor de Renderizado basado en adaptaciones de grado clínico para Biobox.

- Fernando Alma (Lead Architect): Diseño de infraestructura, desarrollo del BFF, lógica de integración PACS, desarrollo de dashboard médico y optimización del visor.

---

© 2026 Biobox Med Platform | Usina Software Factory