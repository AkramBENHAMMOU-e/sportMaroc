// Point d'entrée pour Vercel
import app from './server/index.js';

// Cette fonction est le gestionnaire serverless
export default function handler(req, res) {
  return app(req, res);
} 