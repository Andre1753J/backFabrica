import multer from 'multer';
import path from 'path';

// Define o local de armazenamento das imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // O caminho é relativo à raiz do projeto
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Cria um nome de arquivo único para evitar sobreposição
    // Ex: 1716842866349-nomedoarquivo.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Filtro para aceitar apenas arquivos de imagem
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo não suportado! Apenas imagens são permitidas.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

export default upload;