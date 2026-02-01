import { useState } from "react";

export const useMeasurements = () => {
  const [measurements, setMeasurements] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);

  const addMeasurement = (measurement) => {
    const newMeasurement = {
      ...measurement,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
    };
    setMeasurements((prev) => [...prev, newMeasurement]);
  };

  const clearMeasurements = () => {
    setMeasurements([]);
    setAnnotations([]);
    setIsDrawing(false);
    setStartPoint(null);
  };

  const removeMeasurement = (id) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const startMeasurement = (point) => {
    setStartPoint(point);
    setIsDrawing(true);
  };

  const completeMeasurement = (endPoint, activeTool) => {
    if (!startPoint) return;
    
    const measurement = {
      id: Date.now() + Math.random(),
      type: activeTool,
      start: startPoint,
      end: endPoint,
    };
    
    addMeasurement(measurement);
    setIsDrawing(false);
    setStartPoint(null);
  };

  const addAnnotation = (point, text) => {
    const annotation = {
      id: Date.now(),
      x: point.x,
      y: point.y,
      text,
    };
    setAnnotations((prev) => [...prev, annotation]);
  };

  return {
    measurements,
    annotations,
    isDrawing,
    startPoint,
    addMeasurement,
    clearMeasurements,
    removeMeasurement,
    startMeasurement,
    completeMeasurement,
    addAnnotation,
  };
};