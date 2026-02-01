import { useState } from "react";
import { DEFAULT_IMAGE_SETTINGS, ZOOM_LIMITS } from "../utils/constants";

export const useImageManipulation = () => {
  const [zoom, setZoom] = useState(DEFAULT_IMAGE_SETTINGS.zoom);
  const [rotation, setRotation] = useState(DEFAULT_IMAGE_SETTINGS.rotation);
  const [brightness, setBrightness] = useState(DEFAULT_IMAGE_SETTINGS.brightness);
  const [contrast, setContrast] = useState(DEFAULT_IMAGE_SETTINGS.contrast);

  const handleZoomChange = (newZoom) => {
    const clampedZoom = Math.max(ZOOM_LIMITS.MIN, Math.min(ZOOM_LIMITS.MAX, newZoom));
    setZoom(clampedZoom);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleBrightnessChange = (newBrightness) => {
    setBrightness(newBrightness);
  };

  const handleContrastChange = (newContrast) => {
    setContrast(newContrast);
  };

  const resetSettings = () => {
    setZoom(DEFAULT_IMAGE_SETTINGS.zoom);
    setRotation(DEFAULT_IMAGE_SETTINGS.rotation);
    setBrightness(DEFAULT_IMAGE_SETTINGS.brightness);
    setContrast(DEFAULT_IMAGE_SETTINGS.contrast);
  };

  return {
    zoom,
    rotation,
    brightness,
    contrast,
    setZoom: handleZoomChange,
    handleRotate,
    handleBrightnessChange,
    handleContrastChange,
    resetSettings,
  };
};