import app from './app';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(` API Gateway corriendo en puerto ${PORT}`);
    console.log(`  Seguridad: Helmet Activado`);
    console.log(` Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=================================`);
});