import React, { useState, useEffect, useRef } from "react";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import axios from "axios";
import { Upload, Layers } from "lucide-react"; 

// Componentes
import DicomViewer from "./components/DicomViewer";
import Toolbar from "./components/Toolbar";
import MeasurementsPanel from "./components/MeasurementsPanel";
import ImageControls from "./components/ImageControls";
import DragDropZone from "./components/DragDropZone";
import TagBrowser from "./components/TagBrowser";
import Header from "./components/Header";
import ThumbnailStrip from "./components/ThumbnailStrip";
import MprViewer from "./components/MprViewer";
import ReportModal from "./components/ReportModal"; 
import StudyList from "./components/StudyList";

// Utils
import initCornerstone from "./utils/initCornerstone";
import { extractDicomTags } from "./utils/dicomHelpers";
import { TOOLS } from "./utils/constants";
import { sortImagesByZ, buildVolume, getMprSlice } from "./utils/mprHelpers";
import { takeSnapshot } from "./utils/screenshotUtils";
import { generateMedicalReport } from "./utils/reportGenerator";

function App() {
  // Inicializar motor una sola vez
  useEffect(() => {
    initCornerstone();
  }, []);

  const fileInputRef = useRef(null);

  // --- ESTADOS DE DATOS ---
  const [images, setImages] = useState([]);
  const [patientInfo, setPatientInfo] = useState({ name: "Sin Estudio", id: "---" });
  const [viewMode, setViewMode] = useState("list"); 

  // --- ESTADOS DE VISTA ---
  const [grid, setGrid] = useState({ rows: 1, cols: 1 });
  const [activeViewportId, setActiveViewportId] = useState(0);
  const [viewportIndices, setViewportIndices] = useState(Array(9).fill(0));

  // --- ESTADOS DE IMAGEN ---
  const [activeTool, setActiveTool] = useState(TOOLS.NONE);
  const [measurements, setMeasurements] = useState([]);
  
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [colormap, setColormap] = useState('gray');

  // --- ESTADOS PARA REPORTE PDF ---
  const [clinicalEvidence, setClinicalEvidence] = useState([]); 
  const [showReportModal, setShowReportModal] = useState(false);

  // --- ESTADOS PARA MPR 3D ---
  const [isMprMode, setIsMprMode] = useState(false);
  const [volume, setVolume] = useState(null);
  const [isBuildingVolume, setIsBuildingVolume] = useState(false);
  const [mprSlices, setMprSlices] = useState({ coronal: 50, sagittal: 50 });

  // --- EXTRAS ---
  const [isCinePlaying, setIsCinePlaying] = useState(false);
  const [showTags, setShowTags] = useState(false);

  // ==========================================
  // LÓGICA DE SELECCIÓN DESDE EL PACS (REMOTO)
  // ==========================================
  const handleSelectStudyFromList = async (study) => {
    setImages([]);
    setMeasurements([]);
    setClinicalEvidence([]);
    
    setPatientInfo({
      name: study.PatientMainDicomTags?.PatientName || "Paciente Desconocido",
      id: study.PatientMainDicomTags?.PatientID || study.ID.substring(0, 8),
      studyId: study.ID 
    });

    setViewMode("viewer");

    try {
      const response = await axios.get(`http://localhost:3000/api/pacs/studies/${study.ID}/instances`, {
        headers: { 'x-api-key': import.meta.env.VITE_API_KEY }
      });

      const instanceData = response.data.data;
      const instanceIds = instanceData.map(item => typeof item === 'object' ? item.ID : item);

      cornerstoneWADOImageLoader.configure({
        beforeSend: function(xhr) {
          xhr.setRequestHeader('x-api-key', import.meta.env.VITE_API_KEY);
        }
      });

      const remoteImagesList = instanceIds.map((id, index) => ({
        imageId: `wadouri:http://localhost:3000/api/pacs/wado/instance/${id}`,
        name: `Capa ${index + 1}`,
        instanceNumber: index
      }));

      console.log(`✅ Preparadas ${remoteImagesList.length} imágenes para el visor`);
      
      setImages(remoteImagesList);
      setViewportIndices(Array(9).fill(0));

    } catch (error) {
      console.error("❌ Error en la carga remota:", error);
      alert("No se pudo conectar con el servidor de imágenes.");
      setViewMode("list");
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setImages([]); 
    setMeasurements([]); 
    console.log("Volviendo al panel de gestión");
  };

  // ==========================================
  // CARGA DE IMÁGENES (LOCAL / DROP)
  // ==========================================
  const handleNewImagesFromDrop = (newImagesList) => {
    setViewMode("viewer");
    loadImagesIntoViewer(newImagesList);
  };

  const handleManualUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newImagesList = files.map(file => {
        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
        return { imageId, name: file.name, instanceNumber: 0 };
    });
    setViewMode("viewer"); 
    loadImagesIntoViewer(newImagesList);
  };

  const loadImagesIntoViewer = (list) => {
    if (list.length === 0) return;
    setImages(list);
    setViewportIndices(Array(9).fill(0));
    setMeasurements([]); 
    setIsMprMode(false);
    setVolume(null);
    setClinicalEvidence([]); 

    const fName = list[0]?.name?.replace('.dcm', '') || "Paciente";
    setPatientInfo({
        name: fName,
        id: `ID-${Date.now().toString().slice(-4)}`
    });
  };

  // ==========================================
  // CAPTURA INTELIGENTE (FOTO + DATOS)
  // ==========================================
  const handleScreenshot = async () => {
    const activeId = isMprMode ? "mpr-container" : `viewport-${activeViewportId}`;
    
    const loadingToast = document.createElement("div");
    loadingToast.innerText = "⏳ Procesando evidencia...";
    loadingToast.className = "fixed top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg z-[999] shadow-xl text-sm font-bold border border-gray-600";
    document.body.appendChild(loadingToast);

    const dataUrl = await takeSnapshot(activeId);
    document.body.removeChild(loadingToast);
    
    if (dataUrl) {
        const relatedMeasurements = measurements.filter(m => 
            isMprMode ? true : m.imageIndex === viewportIndices[activeViewportId]
        );

        const newEvidence = {
            id: Date.now(),
            image: dataUrl,
            measurements: JSON.parse(JSON.stringify(relatedMeasurements)), 
            comments: ""
        };

        setClinicalEvidence(prev => [...prev, newEvidence]);
        
        const notification = document.createElement("div");
        notification.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl z-[100] font-bold animate-bounce";
        notification.innerText = `📸 Evidencia Guardada (${relatedMeasurements.length} datos)`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    } else {
        alert("❌ Error al generar la captura. Intente nuevamente.");
    }
  };

  const handleGeneratePDF = (findings) => {
    generateMedicalReport(patientInfo, findings, clinicalEvidence);
    setShowReportModal(false);
  };

  // ==========================================
  // LÓGICA MPR 3D
  // ==========================================
  const handleStartMpr = async () => {
    if (images.length < 5) {
        alert("Necesitas al menos 5 imágenes para crear un volumen 3D.");
        return;
    }
    setIsMprMode(true);
    setIsBuildingVolume(true);
    try {
        const sorted = sortImagesByZ([...images]);
        const vol = await buildVolume(sorted);
        setVolume(vol);
        setMprSlices({
            coronal: Math.floor(vol.dimensions.y / 2),
            sagittal: Math.floor(vol.dimensions.x / 2)
        });
    } catch (e) {
        console.error("Error MPR:", e);
        alert("Error construyendo volumen 3D.");
        setIsMprMode(false);
    } finally {
        setIsBuildingVolume(false);
    }
  };

  // ==========================================
  // NAVEGACIÓN Y GRILLA
  // ==========================================
  const handleLayoutChange = (rows, cols) => {
    setGrid({ rows, cols });
    if (activeViewportId >= rows * cols) setActiveViewportId(0);
  };

  const scrollStack = (delta) => {
    if (images.length === 0) return;
    setViewportIndices(prev => {
        const newIndices = [...prev];
        const currentIndex = newIndices[activeViewportId];
        let nextIndex = currentIndex + delta;
        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= images.length) nextIndex = images.length - 1;
        newIndices[activeViewportId] = nextIndex;
        return newIndices;
    });
  };

  const jumpToImage = (index) => {
    if (images.length === 0) return;
    setViewportIndices(prev => {
        const newIndices = [...prev];
        newIndices[activeViewportId] = index;
        return newIndices;
    });
  };

  const handleWheel = (e) => {
      if (images.length > 0) {
        const direction = e.deltaY > 0 ? 1 : -1;
        scrollStack(direction);
      }
  };

  const handleApplyPreset = (centerVal, widthVal) => {
    if (centerVal === 40 && widthVal === 80) { 
        setBrightness(100); setContrast(40); 
    } else if (widthVal > 1000) { 
        setBrightness(80); setContrast(300); 
    } else if (centerVal > 300) {
        setBrightness(150); setContrast(200);
    } else {
        setBrightness(100); setContrast(100);
    }
  };

  const handleReset = () => {
      setZoom(100); 
      setBrightness(100); 
      setContrast(100); 
      setInvert(false); 
      setRotation(0); 
      setColormap('gray');
  };

  useEffect(() => {
    let interval;
    if (isCinePlaying && images.length > 1) {
      interval = setInterval(() => {
        setViewportIndices(prev => {
            const newIndices = [...prev];
            const currentIndex = newIndices[activeViewportId];
            const nextIndex = (currentIndex + 1) % images.length;
            newIndices[activeViewportId] = nextIndex;
            return newIndices;
        });
      }, 100); 
    }
    return () => clearInterval(interval);
  }, [isCinePlaying, images, activeViewportId]);

  // ==========================================
  // RENDER FINAL CON CORRECCIÓN DE INPUT
  // ==========================================
  const activeImageIndex = viewportIndices[activeViewportId] || 0;
  const activeImageId = images[activeImageIndex]?.imageId;

  return (
    <DragDropZone onNewImages={handleNewImagesFromDrop}>
      {/* 🔴 INPUT GLOBAL: Ahora fuera de los condicionales para que siempre exista en el DOM */}
      <input 
        type="file" 
        multiple 
        accept=".dcm, application/dicom" 
        ref={fileInputRef} 
        onChange={handleManualUpload} 
        className="hidden" 
      />

      {/* --- MODO LISTADO --- */}
      {viewMode === "list" && (
        <div className="flex h-screen w-screen bg-black overflow-hidden flex-col text-white font-sans">
          <Header 
              patientData={{ name: "Panel de Gestión BioBox", id: "PACS v1.0" }}
              currentLayout={grid} 
              onLayoutChange={handleLayoutChange} 
              isListView={true} 
          />
          <StudyList 
              onSelectStudy={handleSelectStudyFromList} 
              onTriggerFile={() => fileInputRef.current.click()} 
          />
        </div>
      )}

      {/* --- MODO VISOR --- */}
      {viewMode === "viewer" && !isMprMode && (
        <div className="flex h-screen w-screen bg-black overflow-hidden font-sans flex-col text-white">
          {showReportModal && (
              <ReportModal 
                  patientInfo={patientInfo}
                  clinicalEvidence={clinicalEvidence}
                  setClinicalEvidence={setClinicalEvidence}
                  onClose={() => setShowReportModal(false)}
                  onGenerate={handleGeneratePDF}
              />
          )}

          {showTags && activeImageId && (
              <TagBrowser imageId={activeImageId} onClose={() => setShowTags(false)} />
          )}

          <Header 
              patientData={patientInfo}
              currentLayout={grid}
              onLayoutChange={handleLayoutChange}
              activeIndex={activeImageIndex}
              totalImages={images.length}
              onTriggerFile={() => fileInputRef.current.click()}
              onShowTags={() => setShowTags(true)}
              onGoBack={handleBackToList}
          />

          <div className="flex-1 flex overflow-hidden relative">
              <Toolbar 
                  activeTool={activeTool} 
                  onToolChange={setActiveTool}
                  onClearMeasurements={() => setMeasurements([])}
                  onRotate={() => setRotation(r => r + 90)}
                  onReset={handleReset}
                  zoom={zoom} onZoomChange={setZoom}
                  isCinePlaying={isCinePlaying} onToggleCine={() => setIsCinePlaying(!isCinePlaying)}
                  onApplyPreset={handleApplyPreset}
                  onOpenTags={() => setShowTags(true)}
                  onOpenMpr={handleStartMpr}
                  onScreenshot={handleScreenshot}
                  onOpenReport={() => setShowReportModal(true)}
              />

              {images.length > 0 && (
                  <ThumbnailStrip images={images} activeIndex={viewportIndices[activeViewportId]} onSelectImage={jumpToImage} />
              )}

              <main className="flex-1 bg-gray-950 relative overflow-hidden" onWheel={handleWheel}>
                  {images.length > 0 ? (
                      <div className="w-full h-full grid gap-1 bg-gray-900 p-1" style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gridTemplateRows: `repeat(${grid.rows}, 1fr)` }}>
                          {[...Array(grid.rows * grid.cols)].map((_, i) => (
                              <div key={i} id={`viewport-${i}`} onClick={() => setActiveViewportId(i)} className={`relative w-full h-full bg-black overflow-hidden transition-all duration-200 ${activeViewportId === i ? 'border-2 border-blue-500 z-10 shadow-lg shadow-blue-500/20' : 'border border-gray-800 opacity-90'}`}>
                                  <div className={`absolute top-2 right-2 z-40 text-[9px] px-1.5 py-0.5 rounded font-bold pointer-events-none ${activeViewportId === i ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}>PANEL {i + 1}</div>
                                  <DicomViewer images={images} activeIndex={viewportIndices[i] || 0} zoom={zoom} brightness={brightness} contrast={contrast} invert={invert} colormap={colormap} activeTool={activeViewportId === i ? activeTool : TOOLS.NONE} measurements={measurements} setMeasurements={setMeasurements} onLevelsChange={(c, w) => { setBrightness(c); setContrast(w); }} />
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-6">
                          <div className="w-24 h-24 bg-gray-900 border-2 border-gray-800 rounded-full flex items-center justify-center animate-pulse"><span className="text-5xl filter grayscale">🩻</span></div>
                          <div className="text-center">
                              <h2 className="text-2xl font-bold text-gray-300">Cargando Estudio Remoto</h2>
                              <p className="text-sm text-gray-500 italic">Sincronizando capas desde el servidor BioBox...</p>
                          </div>
                          <button onClick={() => setViewMode("list")} className="px-6 py-2 bg-gray-800 text-white rounded-lg">VOLVER AL PANEL</button>
                      </div>
                  )}
              </main>

              <aside className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl">
                  <div className="p-4 border-b border-gray-800">
                      <ImageControls zoom={zoom} onZoomChange={setZoom} brightness={brightness} onBrightnessChange={setBrightness} contrast={contrast} onContrastChange={setContrast} colormap={colormap} onColormapChange={setColormap} onReset={handleReset} />
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <MeasurementsPanel measurements={measurements} activeIndex={viewportIndices[activeViewportId]} setMeasurements={setMeasurements} patientInfo={patientInfo} />
                  </div>
              </aside>
          </div>
        </div>
      )}

      {/* --- MODO MPR --- */}
      {isMprMode && viewMode === "viewer" && (
        <div className="w-full h-screen bg-black flex flex-col font-sans text-white overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-gray-800 bg-gray-900">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg"><Layers className="w-5 h-5"/></div>
                    <div>
                        <h2 className="text-lg font-bold">Reconstrucción Multiplanar</h2>
                        <p className="text-xs text-gray-400">Volumen generado: {images.length} capas</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleScreenshot} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg font-bold text-sm transition-colors">FOTO 3D</button>
                    <button onClick={() => setIsMprMode(false)} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-sm transition-colors">CERRAR</button>
                </div>
            </div>

            <div id="mpr-container" className="flex-1 p-4 bg-black">
                {isBuildingVolume ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-400 animate-pulse font-mono">Procesando Vóxeles... Por favor espere.</p>
                    </div>
                ) : volume ? (
                    <div className="h-full grid grid-cols-2 gap-4">
                        <div className="relative bg-black border-2 border-yellow-700/50 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                            <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-yellow-900/80 text-yellow-400 text-xs font-bold rounded border border-yellow-700">PLANO CORONAL (Y)</div>
                            <div className="flex-1 relative">
                                <MprViewer {...getMprSlice(volume, 'coronal', mprSlices.coronal)} aspectRatio={volume.aspectRatio} referenceIndex={mprSlices.sagittal} maxIndex={volume.dimensions.x} color="green" />
                            </div>
                            <div className="p-3 bg-gray-900 border-t border-gray-800">
                                <input type="range" min="0" max={volume.dimensions.y - 1} value={mprSlices.coronal} onChange={(e) => setMprSlices(p => ({...p, coronal: parseInt(e.target.value)}))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                                <div className="text-center text-xs text-gray-500 mt-1">Corte {mprSlices.coronal} / {volume.dimensions.y}</div>
                            </div>
                        </div>

                        <div className="relative bg-black border-2 border-green-700/50 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                            <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-green-900/80 text-green-400 text-xs font-bold rounded border border-green-700">PLANO SAGITAL (X)</div>
                            <div className="flex-1 relative">
                                <MprViewer {...getMprSlice(volume, 'sagittal', mprSlices.sagittal)} aspectRatio={volume.aspectRatio} referenceIndex={mprSlices.coronal} maxIndex={volume.dimensions.y} color="yellow" />
                            </div>
                            <div className="p-3 bg-gray-900 border-t border-gray-800">
                                <input type="range" min="0" max={volume.dimensions.x - 1} value={mprSlices.sagittal} onChange={(e) => setMprSlices(p => ({...p, sagittal: parseInt(e.target.value)}))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
                                <div className="text-center text-xs text-gray-500 mt-1">Corte {mprSlices.sagittal} / {volume.dimensions.x}</div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
      )}
    </DragDropZone>
  );
}

export default App;