import { toJpeg } from 'html-to-image';

export const takeSnapshot = async (elementId) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`❌ Elemento ${elementId} no encontrado`);
        return null;
    }

    try {
        console.log('📸 Iniciando captura de:', elementId);
        
        // Espera para asegurar renderizado completo
        await new Promise(resolve => setTimeout(resolve, 300));

        // ESTRATEGIA 1: Captura directa del Canvas de Cornerstone
        const canvas = element.querySelector('canvas');
        
        if (canvas) {
            console.log('🎯 Canvas de Cornerstone encontrado');
            try {
                // Capturar directamente del canvas
                const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                
                if (dataUrl && dataUrl.length > 5000) {
                    console.log('✅ Captura exitosa desde canvas (', dataUrl.length, 'bytes)');
                    return dataUrl;
                }
            } catch (e) {
                console.warn('⚠️ Error capturando canvas:', e.message);
            }
        } else {
            console.warn('⚠️ No se encontró canvas en el elemento');
        }

        // ESTRATEGIA 2: Usar html-to-image como fallback
        console.log('🔄 Intentando con html-to-image...');
        const dataUrl = await toJpeg(element, { 
            quality: 0.95,
            backgroundColor: '#000000',
            pixelRatio: 2,
            cacheBust: true,
            skipFonts: true,
            includeQueryParams: false,
            style: {
                margin: '0',
                padding: '0',
                width: '100%',
                height: '100%'
            }
        });

        if (dataUrl && dataUrl.length > 5000) {
            console.log('✅ Captura exitosa con html-to-image');
            return dataUrl;
        }

        console.error('❌ Imagen capturada es muy pequeña o inválida');
        return null;

    } catch (err) {
        console.error('❌ Error completo en captura:', err);
        return null;
    }
};