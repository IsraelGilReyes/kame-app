
//'http://localhost:3000';
// Puedes usar process.env o un archivo de configuración de Expo
//const DEV_API_URL = 'http://localhost:3000'; // Tu IP local para desarrollo


const DEV_API_URL = 'http://192.168.11.8:3000'; // IP de tu PC en la red local + puerto de NestJS
const PROD_API_URL = 'https://tu-api-en-railway.app'; // Tu URL pública en la nube

const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}