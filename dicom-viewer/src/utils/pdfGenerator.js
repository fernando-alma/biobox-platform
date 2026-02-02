import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TOOLS } from "./constants";

export const generateDicomReport = (patientInfo, measurements, activeIndex) => {
    // 1. Filtrar solo las medidas de la imagen actual
    const currentSpecs = measurements.filter(m => m.imageIndex === activeIndex);

    if (currentSpecs.length === 0) {
        alert("No hay mediciones para generar un reporte.");
        return;
    }

    // 2. Inicializar documento
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const today = new Date().toLocaleDateString("es-AR", {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // --- ENCABEZADO "BIOBOX MED" ---
    doc.setFillColor(15, 23, 42); // Azul oscuro
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("BioBox Diagnostic", 14, 16);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Gris azulado
    doc.text("Informe Técnico Radiológico", pageWidth - 14, 16, { align: 'right' });

    // --- DATOS DEL PACIENTE ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    
    let yPos = 40;
    const pName = patientInfo?.name || "Paciente Anónimo";
    const pId = patientInfo?.id || "---";

    doc.setFont("helvetica", "bold");
    doc.text("Información del Estudio", 14, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Paciente: ${pName}`, 14, yPos + 7);
    doc.text(`ID Historia: ${pId}`, 14, yPos + 12);
    doc.text(`Fecha Reporte: ${today}`, 14, yPos + 17);

    // --- PREPARAR DATOS DE LA TABLA ---
    const tableBody = currentSpecs.map((m, index) => {
        let type = "Medición";
        let value = "";
        let notes = "-";

        switch (m.type) {
            case TOOLS.RULER:
                type = "Distancia Lineal";
                value = `${m.value} mm`;
                break;
            
            case TOOLS.ANGLE:
                type = "Ángulo Cobb";
                value = `${m.value}°`;
                break;

            case TOOLS.ELLIPSE:
                type = "ROI Elíptico";
                value = `Área: ${m.value} mm²`;
                if (m.complexData) {
                    const rX = parseFloat(m.complexData.radiusX).toFixed(1);
                    const rY = parseFloat(m.complexData.radiusY).toFixed(1);
                    notes = `Radios: ${rX}mm x ${rY}mm`;
                }
                break;

            // --- NUEVOS CASOS AGREGADOS ---
            case TOOLS.RECTANGLE:
                type = "ROI Rectangular";
                value = `Área: ${m.value} mm²`;
                notes = "Análisis de zona cuadrada";
                break;

            case TOOLS.ROI: // Lápiz Libre
                type = "ROI Libre (Freehand)";
                value = `Área: ${m.value} mm²`;
                notes = "Contorno irregular";
                break;

            case TOOLS.POLYLINE:
                type = "Polilínea";
                value = `Longitud: ${m.value} mm`;
                notes = `Segmentos: ${m.points.length - 1}`;
                break;

            case TOOLS.ANNOTATION:
                type = "Nota Clínica";
                value = "---";
                notes = m.text || "Sin texto";
                break;
            // -----------------------------

            case TOOLS.ICT_COMPLEX:
                type = "Índice Cardiotorácico";
                value = `${m.value}%`;
                if (m.complexData?.diagnosis) {
                    notes = m.complexData.diagnosis.label || "Normal";
                }
                break;

            case TOOLS.BIDIRECTIONAL:
                type = "Tumoral (RECIST)";
                if (m.complexData) {
                    const l = m.complexData.axis1?.value || 0;
                    const w = m.complexData.axis2?.value || 0;
                    value = `${l}mm x ${w}mm`;
                    notes = "Ejes Bidireccionales";
                }
                break;

            default:
                value = `${m.value}`;
        }

        return [index + 1, type, value, notes];
    });

    // --- GENERAR TABLA ---
    autoTable(doc, {
        head: [['#', 'Tipo de Análisis', 'Resultado', 'Detalles Clínicos']],
        body: tableBody,
        startY: yPos + 25,
        theme: 'grid',
        headStyles: { 
            fillColor: [37, 99, 235],
            fontSize: 9,
            halign: 'center',
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            2: { fontStyle: 'bold' }
        },
        styles: { fontSize: 9, cellPadding: 3 },
        foot: [['', '', 'Total Mediciones', currentSpecs.length]],
        footStyles: {
            fillColor: [241, 245, 249],
            textColor: 0,
            fontStyle: 'bold'
        }
    });

    // --- PIE DE PÁGINA ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setDrawColor(200);
        doc.line(14, 285, pageWidth - 14, 285);
        doc.text(`Generado automáticamente por BioBox Med Viewer`, 14, 290);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, 290, { align: 'right' });
    }

    const cleanName = (pName || "paciente").replace(/\s+/g, '_');
    const fileName = `BioBox_Report_${cleanName}_${Date.now()}.pdf`;
    doc.save(fileName);
};