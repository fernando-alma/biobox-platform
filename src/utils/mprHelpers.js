import cornerstone from "cornerstone-core";

// 1. Ordenar imágenes por posición Z
export const sortImagesByZ = (images) => {
    return images.sort((a, b) => {
        const imagePlaneA = cornerstone.metaData.get('imagePlaneModule', a.imageId);
        const imagePlaneB = cornerstone.metaData.get('imagePlaneModule', b.imageId);
        if (!imagePlaneA || !imagePlaneB) return a.instanceNumber - b.instanceNumber;
        return imagePlaneA.imagePositionPatient[2] - imagePlaneB.imagePositionPatient[2];
    });
};

// 2. Construir Volumen (AUTO-DETECTA EL TIPO DE DATOS)
export const buildVolume = async (sortedImages) => {
    if (!sortedImages || sortedImages.length === 0) return null;

    const firstImage = await cornerstone.loadAndCacheImage(sortedImages[0].imageId);
    const { width, height } = firstImage;
    const depth = sortedImages.length;
    const totalSize = width * height * depth;

    // DETECCIÓN AUTOMÁTICA DE TIPO (Uint8 vs Int16)
    const sampleData = firstImage.getPixelData();
    const ArrayConstructor = sampleData.constructor; 
    const volumeBuffer = new ArrayConstructor(totalSize);

    // Llenar el buffer
    for (let z = 0; z < depth; z++) {
        const image = await cornerstone.loadAndCacheImage(sortedImages[z].imageId);
        const pixelData = image.getPixelData();
        volumeBuffer.set(pixelData, z * width * height);
    }

    // Calcular Aspect Ratio
    const meta = cornerstone.metaData.get('imagePlaneModule', sortedImages[0].imageId) || {};
    const pixelSpacingXY = meta.pixelSpacing ? meta.pixelSpacing[0] : 1.0;
    const sliceThickness = meta.sliceThickness || 1.0;
    
    let zAspectRatio = sliceThickness / pixelSpacingXY;

    return {
        buffer: volumeBuffer,
        dimensions: { x: width, y: height, z: depth },
        aspectRatio: zAspectRatio,
        ArrayConstructor: ArrayConstructor 
    };
};

// 3. Extraer Cortes
export const getMprSlice = (volume, plane, sliceIndex) => {
    const { x: width, y: height, z: depth } = volume.dimensions;
    const buffer = volume.buffer;
    const ArrayConstructor = volume.ArrayConstructor;

    let outWidth, outHeight, outPixelData;

    // --- CORONAL ---
    if (plane === 'coronal') {
        outWidth = width;
        outHeight = depth;
        outPixelData = new ArrayConstructor(outWidth * outHeight);
        
        const y = Math.min(Math.max(sliceIndex, 0), height - 1); 

        for (let z = 0; z < depth; z++) {
            const zOffset = z * width * height;
            const yOffset = y * width;
            
            for (let x = 0; x < width; x++) {
                const value = buffer[zOffset + yOffset + x];
                const outputIndex = ((depth - 1 - z) * outWidth) + x; 
                outPixelData[outputIndex] = value;
            }
        }
    }

    // --- SAGITAL ---
    else if (plane === 'sagittal') {
        outWidth = height;
        outHeight = depth;
        outPixelData = new ArrayConstructor(outWidth * outHeight);

        const x = Math.min(Math.max(sliceIndex, 0), width - 1);

        for (let z = 0; z < depth; z++) {
            const zOffset = z * width * height;
            
            for (let y = 0; y < height; y++) {
                const value = buffer[zOffset + (y * width) + x];
                const outputIndex = ((depth - 1 - z) * outWidth) + y;
                outPixelData[outputIndex] = value;
            }
        }
    }

    return {
        pixelData: outPixelData,
        width: outWidth,
        height: outHeight,
        aspectRatio: volume.aspectRatio
    };
};