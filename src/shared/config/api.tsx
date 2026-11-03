
//'http://localhost:3000';
// Puedes usar process.env o un archivo de configuración de Expo
const DEV_API_URL = 'http://localhost:3000'; // Tu IP local para desarrollo
const PROD_API_URL = 'https://tu-api-en-railway.app'; // Tu URL pública en la nube

// Detecta automáticamente si está en desarrollo o compilado (APK/Producción)
const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}