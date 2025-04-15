// Ce fichier sert de point d'entrée pour les API via les fonctions serverless Vercel
import { createServer } from 'http';
import app from '../dist/index.js';

// Créer un serveur HTTP avec l'application Express
const server = createServer(app);

// Exportation pour Vercel serverless
export default server; 