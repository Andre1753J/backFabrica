import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../connection.js'
import { quebrarKey } from '../quebraKey.js';

// Para lidar com __dirname em ESModules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../as tinguis'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const novoNome = `clienteImg_${id}${ext}`;
        cb(null, novoNome);
    }
});

const upload = multer({ storage });

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

async function verificar(conexao, key) {
    const keyParts = await quebrarKey(key);
    const [id, email, senha] = keyParts;
    console.log(keyParts);
    console.log("teste" + id, email, senha);

    const query = "SELECT id FROM cliente WHERE id = ? AND email = ? AND senha = ?";
    const retorno = await executaQuery(conexao, query, [id, email, senha]);

    return retorno;
}

let podeSalvar = false;
let id;

router.post('/upload/:key', async (req, res, next) => {
    const { key } = req.params; // Obtém o parâmetro key da URL
    if (!key) return res.status(400).send('Parâmetro key é obrigatório.');

    try {
        const conexao = await pool.getConnection(); // Obtém uma conexão do pool
        const resultado = await verificar(conexao, key); // Usa Conexao para a verificação
        if (resultado.length > 0) {
            podeSalvar = true; // Define como verdadeiro se a verificação for bem-sucedida
            id = resultado[0].id; // Armazena o ID do cliente
            console.log("ID do cliente: " + id);
        } else {
            podeSalvar = false;
        }
        conexao.release(); // Libera a conexão
    } catch (error) {
        return res.status(500).send('Erro ao verificar a chave.' + error.message);
    }

    if (!podeSalvar) {
        return res.status(403).send('Upload não permitido.');
    }

    next(); // Passa para o próximo middleware
}, upload.single('imagem'), (req, res) => {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado.');
    res.send(`Imagem salva como: ${req.file.filename}, com a chave: ${req.params.key}`);
});

export default router;