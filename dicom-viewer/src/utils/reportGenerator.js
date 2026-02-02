import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TOOLS } from "./constants";

/**
 * Generador de Reporte Médico Completo
 * Incluye: Datos del paciente, informe médico, evidencias con fotos y mediciones
 */
export const generateMedicalReport = (patientInfo, generalFindings, clinicalEvidence) => {
    console.log("🚀 Generando PDF completo con", clinicalEvidence.length, "evidencias");

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    // ========================================
    // HELPER: Encabezado consistente
    // ========================================
    const drawHeader = () => {
        doc.setFillColor(15, 23, 42); 
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("BioBox Diagnostic", margin, 16);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text("Informe Técnico Radiológico", pageWidth - margin, 16, { align: 'right' });
    };

    // ========================================
    // HELPER: Pie de página con numeración
    // ========================================
    const drawFooter = (pageNum, totalPages) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setDrawColor(200);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.text(
            `Generado automáticamente por BioBox Med Viewer`,
            margin,
            pageHeight - 10
        );
        doc.text(
            `Página ${pageNum} de ${totalPages}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: 'right' }
        );
    };

    // ========================================
    // HELPER: Formatear valor de medición
    // ========================================
    const formatMeasurementValue = (measurement) => {
        let value = measurement.value;
        let unit = "";
        let displayValue = "";

        switch (measurement.type) {
            case TOOLS.RULER:
                displayValue = parseFloat(value).toFixed(1);
                unit = " mm";
                break;

            case TOOLS.ANGLE:
                displayValue = parseFloat(value).toFixed(1);
                unit = "°";
                break;

            case TOOLS.ELLIPSE:
            case TOOLS.RECTANGLE:
            case TOOLS.ROI:
                displayValue = parseFloat(value).toFixed(1);
                unit = " mm²";
                break;

            case TOOLS.POLYLINE:
                displayValue = parseFloat(value).toFixed(1);
                unit = " mm";
                break;

            case TOOLS.ICT_COMPLEX:
            case TOOLS.ICT:
                displayValue = parseFloat(value).toFixed(1);
                unit = "%";
                break;

            case TOOLS.BIDIRECTIONAL:
                if (measurement.complexData) {
                    const l = measurement.complexData.axis1?.value || 0;
                    const w = measurement.complexData.axis2?.value || 0;
                    displayValue = `${parseFloat(l).toFixed(1)}mm x ${parseFloat(w).toFixed(1)}mm`;
                    unit = "";
                } else {
                    displayValue = value;
                }
                break;

            case TOOLS.ANNOTATION:
                displayValue = measurement.text || "Sin texto";
                unit = "";
                break;

            default:
                displayValue = value;
        }

        return displayValue + unit;
    };

    // ========================================
    // HELPER: Obtener nombre de tipo de medición
    // ========================================
    const getMeasurementTypeName = (type) => {
        const typeNames = {
            [TOOLS.RULER]: "Distancia Lineal",
            [TOOLS.ANGLE]: "Ángulo",
            [TOOLS.ELLIPSE]: "ROI Elíptico",
            [TOOLS.RECTANGLE]: "ROI Rectangular",
            [TOOLS.ROI]: "ROI Libre (Freehand)",
            [TOOLS.POLYLINE]: "Polilínea",
            [TOOLS.ANNOTATION]: "Anotación",
            [TOOLS.ICT_COMPLEX]: "Índice Cardiotorácico",
            [TOOLS.ICT]: "ICT",
            [TOOLS.BIDIRECTIONAL]: "Tumoral (RECIST)"
        };
        return typeNames[type] || type;
    };

    // ========================================
    // HELPER: Obtener detalles clínicos
    // ========================================
    const getMeasurementDetails = (measurement) => {
        switch (measurement.type) {
            case TOOLS.ELLIPSE:
                if (measurement.complexData) {
                    const rX = parseFloat(measurement.complexData.radiusX).toFixed(1);
                    const rY = parseFloat(measurement.complexData.radiusY).toFixed(1);
                    return `Radios: ${rX}mm x ${rY}mm`;
                }
                break;

            case TOOLS.BIDIRECTIONAL:
                return "Ejes Bidireccionales";

            case TOOLS.POLYLINE:
                return `Segmentos: ${measurement.points?.length - 1 || 0}`;

            case TOOLS.ICT_COMPLEX:
                if (measurement.complexData?.diagnosis) {
                    return measurement.complexData.diagnosis.label || "Normal";
                }
                break;

            case TOOLS.ANNOTATION:
                return measurement.text || "Sin descripción";
        }
        return "-";
    };

    // ========================================
    // PÁGINA 1: INFORMACIÓN DEL PACIENTE
    // ========================================
    drawHeader();
    let yPos = 40;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Información del Estudio", margin, yPos);

    const today = new Date().toLocaleDateString("es-AR", {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    autoTable(doc, {
        startY: yPos + 5,
        body: [
            ['Paciente', patientInfo.name || "Paciente Anónimo"],
            ['ID Historia', patientInfo.id || "---"],
            ['Fecha Reporte', today],
            ['Total de Evidencias', clinicalEvidence.length.toString()]
        ],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 50 }
        }
    });

    // ========================================
    // SECCIÓN: INFORME MÉDICO (HALLAZGOS)
    // ========================================
    yPos = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Informe Médico", margin, yPos);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    if (generalFindings && generalFindings.trim() !== "") {
        // Si hay hallazgos, mostrarlos con formato
        const splitText = doc.splitTextToSize(
            generalFindings,
            pageWidth - (margin * 2)
        );
        doc.text(splitText, margin, yPos + 7);
    } else {
        // Si no hay hallazgos, mostrar espacio para completar a mano
        doc.setTextColor(100, 100, 100);
        doc.text(
            "[El médico puede completar esta sección manualmente en el documento impreso]",
            margin,
            yPos + 7
        );
        
        // Dibujar líneas para escribir
        doc.setDrawColor(200, 200, 200);
        for (let i = 0; i < 8; i++) {
            const lineY = yPos + 15 + (i * 8);
            if (lineY < pageHeight - 30) {
                doc.line(margin, lineY, pageWidth - margin, lineY);
            }
        }
    }

    // ========================================
    // PÁGINAS SIGUIENTES: EVIDENCIAS CLÍNICAS
    // ========================================
    if (clinicalEvidence && clinicalEvidence.length > 0) {
        
        clinicalEvidence.forEach((evidence, evidenceIndex) => {
            // Nueva página para cada evidencia
            doc.addPage();
            drawHeader();

            let cursorY = 35;

            // Título de la evidencia
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(`Evidencia Clínica #${evidenceIndex + 1}`, margin, cursorY);

            cursorY += 10;

            // ========================================
            // IMAGEN DE LA EVIDENCIA
            // ========================================
            if (evidence.image && evidence.image.length > 1000) {
                try {
                    // Detectar formato de imagen
                    let format = "JPEG";
                    if (evidence.image.includes("image/png")) {
                        format = "PNG";
                    }

                    const imgProps = doc.getImageProperties(evidence.image);
                    const maxImgWidth = pageWidth - (margin * 2);
                    const maxImgHeight = 120;

                    let imgWidth = maxImgWidth;
                    let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

                    // Ajustar si la altura excede el máximo
                    if (imgHeight > maxImgHeight) {
                        imgHeight = maxImgHeight;
                        imgWidth = (imgProps.width * imgHeight) / imgProps.height;
                    }

                    // Centrar la imagen
                    const xOffset = (pageWidth - imgWidth) / 2;

                    doc.addImage(
                        evidence.image,
                        format,
                        xOffset,
                        cursorY,
                        imgWidth,
                        imgHeight
                    );

                    cursorY += imgHeight + 10;

                } catch (error) {
                    console.error(`❌ Error al insertar imagen #${evidenceIndex + 1}:`, error);
                    doc.setFontSize(10);
                    doc.setTextColor(255, 0, 0);
                    doc.text(
                        "[Error: No se pudo cargar la imagen]",
                        margin,
                        cursorY
                    );
                    cursorY += 10;
                }
            } else {
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text("[Imagen no disponible]", margin, cursorY);
                cursorY += 10;
            }

            // ========================================
            // TABLA DE MEDICIONES DE ESTA EVIDENCIA
            // ========================================
            if (evidence.measurements && evidence.measurements.length > 0) {
                const tableData = evidence.measurements.map((m, idx) => [
                    idx + 1,
                    getMeasurementTypeName(m.type),
                    formatMeasurementValue(m),
                    getMeasurementDetails(m)
                ]);

                autoTable(doc, {
                    startY: cursorY,
                    head: [['#', 'Tipo de Análisis', 'Resultado', 'Detalles Clínicos']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [37, 99, 235],
                        fontSize: 9,
                        halign: 'center',
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: { halign: 'center', cellWidth: 10 },
                        2: { fontStyle: 'bold', halign: 'center' }
                    },
                    styles: { fontSize: 9, cellPadding: 3 },
                    foot: [['', '', 'Total', evidence.measurements.length]],
                    footStyles: {
                        fillColor: [241, 245, 249],
                        textColor: 0,
                        fontStyle: 'bold'
                    }
                });

            } else {
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(
                    "Esta imagen no tiene mediciones asociadas (referencia anatómica).",
                    margin,
                    cursorY
                );
            }
        });
    }

    // ========================================
    // PÁGINA FINAL: RESUMEN DE TODAS LAS MEDICIONES
    // ========================================
    doc.addPage();
    drawHeader();

    let summaryY = 35;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen de Todas las Mediciones", margin, summaryY);

    summaryY += 10;

    // Recopilar todas las mediciones de todas las evidencias
    const allMeasurements = [];
    clinicalEvidence.forEach((evidence, evidenceIdx) => {
        if (evidence.measurements) {
            evidence.measurements.forEach((m) => {
                allMeasurements.push({
                    evidenceNum: evidenceIdx + 1,
                    ...m
                });
            });
        }
    });

    if (allMeasurements.length > 0) {
        const summaryTableData = allMeasurements.map((m, idx) => [
            idx + 1,
            `Evidencia #${m.evidenceNum}`,
            getMeasurementTypeName(m.type),
            formatMeasurementValue(m),
            getMeasurementDetails(m)
        ]);

        autoTable(doc, {
            startY: summaryY,
            head: [['#', 'Origen', 'Tipo', 'Resultado', 'Detalles']],
            body: summaryTableData,
            theme: 'striped',
            headStyles: {
                fillColor: [37, 99, 235],
                fontSize: 9,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                3: { fontStyle: 'bold', halign: 'center' }
            },
            styles: { fontSize: 8, cellPadding: 2 },
            foot: [['', '', '', 'Total Mediciones', allMeasurements.length]],
            footStyles: {
                fillColor: [241, 245, 249],
                textColor: 0,
                fontStyle: 'bold'
            }
        });
    } else {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("No se realizaron mediciones en este estudio.", margin, summaryY);
    }

    // ========================================
    // APLICAR PIE DE PÁGINA A TODAS LAS PÁGINAS
    // ========================================
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(i, totalPages);
    }

    // ========================================
    // GUARDAR DOCUMENTO
    // ========================================
    const cleanName = (patientInfo.name || "paciente")
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '');
    
    const fileName = `BioBox_Reporte_${cleanName}_${Date.now()}.pdf`;
    
    console.log("✅ PDF generado exitosamente:", fileName);
    doc.save(fileName);
};


/**
 * Generador de reporte simple de mediciones
 * (Para uso rápido sin evidencias fotográficas)
 */
export const generateQuickMeasurementsReport = (patientInfo, measurements, activeIndex) => {
    const currentMeasurements = measurements.filter(m => m.imageIndex === activeIndex);

    if (currentMeasurements.length === 0) {
        alert("No hay mediciones para generar un reporte.");
        return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;

    // Encabezado
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("BioBox Diagnostic", margin, 16);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("Reporte Rápido de Mediciones", pageWidth - margin, 16, { align: 'right' });

    // Información del paciente
    let yPos = 40;
    const today = new Date().toLocaleDateString("es-AR", {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Información del Estudio", margin, yPos);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Paciente: ${patientInfo?.name || "Anónimo"}`, margin, yPos + 7);
    doc.text(`ID Historia: ${patientInfo?.id || "---"}`, margin, yPos + 12);
    doc.text(`Fecha: ${today}`, margin, yPos + 17);

    // Tabla de mediciones
    const tableBody = currentMeasurements.map((m, index) => {
        const formatValue = (measurement) => {
            let value = measurement.value;
            let unit = "";
            
            switch (measurement.type) {
                case TOOLS.RULER:
                    return `${parseFloat(value).toFixed(1)} mm`;
                case TOOLS.ANGLE:
                    return `${parseFloat(value).toFixed(1)}°`;
                case TOOLS.ELLIPSE:
                case TOOLS.RECTANGLE:
                case TOOLS.ROI:
                    return `Área: ${parseFloat(value).toFixed(1)} mm²`;
                case TOOLS.ICT_COMPLEX:
                case TOOLS.ICT:
                    return `${parseFloat(value).toFixed(1)}%`;
                case TOOLS.BIDIRECTIONAL:
                    if (measurement.complexData) {
                        const l = measurement.complexData.axis1?.value || 0;
                        const w = measurement.complexData.axis2?.value || 0;
                        return `${parseFloat(l).toFixed(1)}mm x ${parseFloat(w).toFixed(1)}mm`;
                    }
                    return value;
                default:
                    return value;
            }
        };

        const getMeasurementTypeName = (type) => {
            const typeNames = {
                [TOOLS.RULER]: "Distancia Lineal",
                [TOOLS.ANGLE]: "Ángulo",
                [TOOLS.ELLIPSE]: "ROI Elíptico",
                [TOOLS.RECTANGLE]: "ROI Rectangular",
                [TOOLS.ROI]: "ROI Libre",
                [TOOLS.POLYLINE]: "Polilínea",
                [TOOLS.ICT_COMPLEX]: "ICT",
                [TOOLS.BIDIRECTIONAL]: "Tumoral (RECIST)"
            };
            return typeNames[type] || type;
        };

        return [
            index + 1,
            getMeasurementTypeName(m.type),
            formatValue(m),
            m.text || "-"
        ];
    });

    autoTable(doc, {
        head: [['#', 'Tipo', 'Resultado', 'Notas']],
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
        foot: [['', '', 'Total', currentMeasurements.length]],
        footStyles: {
            fillColor: [241, 245, 249],
            textColor: 0,
            fontStyle: 'bold'
        }
    });

    // Pie de página
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    doc.text("Generado por BioBox Med Viewer", margin, pageHeight - 10);

    const cleanName = (patientInfo?.name || "paciente").replace(/\s+/g, '_');
    const fileName = `BioBox_Mediciones_${cleanName}_${Date.now()}.pdf`;
    
    doc.save(fileName);
};