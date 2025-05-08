import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Para lidar com __dirname em ESModules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../as tinguis'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const novoNome = `img_${Date.now()}${ext}`;
    cb(null, novoNome);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('imagem'), (req, res) => {
  if (!req.file) return res.status(400).send('Nenhum arquivo enviado.');
  res.send(`Imagem salva como: ${req.file.filename}`);
});

export default router;