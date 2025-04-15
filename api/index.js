// Point d'entrée pour les API serverless Vercel
import '../dist/index.js';

// Le fichier principal ../dist/index.js exportera l'application Express
// qui sera utilisée comme gestionnaire de requêtes par Vercel
export { default } from '../dist/index.js'; 