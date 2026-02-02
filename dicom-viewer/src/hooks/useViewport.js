import { useState, useCallback, useEffect } from "react";

export const useViewport = (images = []) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // 1. SINCRONIZACIÓN CRÍTICA:
  // Si el índice activo queda fuera de rango al cargar nuevas imágenes, lo reseteamos.
  useEffect(() => {
    if (activeIndex >= images.length && images.length > 0) {
      setActiveIndex(images.length - 1);
    }
  }, [images.length, activeIndex]);

  // 2. FUNCIÓN DE NAVEGACIÓN (Scroll y Flechas)
  const scrollStack = useCallback((direction) => {
    setActiveIndex((prev) => {
      const nextIndex = prev + direction;
      // Validamos contra la longitud actual de las imágenes recibidas por props
      if (nextIndex >= 0 && nextIndex < images.length) {
        return nextIndex;
      }
      return prev;
    });
  }, [images.length]); // Dependencia vital: images.length

  const handleImageSelect = (index) => {
    if (index >= 0 && index < images.length) {
      setActiveIndex(index);
    }
  };

  return {
    activeIndex,
    setActiveIndex,
    scrollStack,
    handleImageSelect
  };
};