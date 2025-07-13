import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../connection.js'
import { quebrarKey } from '../quebraKey.js';


// imgType(1 pra gente, 2 pra bixo)_ID(O idê de quem postou, ou do animal)_subID(O idê no banco de dados)_(A extensão)


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../as tinguis'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const imageID = req.imageID;
        const novoNome = `${imageID}${ext}`;
        cb(null, novoNome);
    }
});
const upload = multer({ storage });


async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

async function verificar(conexao, key) {
    const keyParts = quebrarKey(key);
    const [id, email, senha] = keyParts;

    const query = "SELECT id FROM cliente WHERE id = ? AND email = ? AND senha = ?";
    const retorno = await executaQuery(conexao, query, [id, email, senha]);

    return retorno;
}

async function addInBank(imageType, id, animalID) {
    const conexao = await pool.getConnection();
    try {
        let query;
        let retorno;
        if (imageType == 1) {
            query = "INSERT INTO clienteImg (cliente) VALUES (?)";
            retorno = await executaQuery(conexao, query, [id]);
        } else if (imageType == 2) {
            // Verifica se o animal existe antes de inserir
            const animalExiste = await executaQuery(conexao, "SELECT id FROM animal WHERE id = ?", [animalID]);
            if (!animalExiste || animalExiste.length === 0) {
                conexao.release();
                throw new Error('Animal não encontrado no banco de dados.');
            }
            query = "INSERT INTO animalImg (animal) VALUES (?)";
            retorno = await executaQuery(conexao, query, [animalID]);
        } else {
            conexao.release();
            throw new Error('Tipo de imagem inválido');
        }
        conexao.release();
        return retorno;
    } catch (error) {
        conexao.release();
        throw error; // Propaga o erro para ser tratado no endpoint
    }
}

router.post('/upload/:key/type/:imageType/animal/:idAnimal', async (req, res, next) => {
    const { key, imageType, idAnimal } = req.params;

    // Verificações adicionais
    if (!key || !imageType) {
        return res.status(400).json('Parâmetro key e imageType são obrigatórios.');
    }
    // imageType só pode ser '1' ou '2'
    if (!['1', '2'].includes(imageType)) {
        return res.status(400).json('imageType deve ser 1 (cliente) ou 2 (animal).');
    }
    // Se imageType for '2', idAnimal deve ser um número válido
    if (imageType === '2' && (!idAnimal || isNaN(Number(idAnimal)) || Number(idAnimal) <= 0)) {
        return res.status(400).json('idAnimal inválido.');
    }

    try {
        const conexao = await pool.getConnection();
        const resultado = await verificar(conexao, key);
        conexao.release();

        if (resultado.length === 0) {
            return res.status(403).json('Upload não permitido. Chave inválida.');
        }

        const userId = resultado[0].id;
        const resposta = await addInBank(Number(imageType), userId, Number(idAnimal));

        if (!resposta || resposta.affectedRows === 0) {
            return res.status(500).json('Erro ao adicionar no banco de dados.');
        }

        // Armazena temporariamente no req para o multer acessar
        req.imageType = imageType;
        req.userId = userId;
        req.imageID = resposta.insertId;

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json('Erro interno: ' + error.message);
    }
}, upload.single('imagem'), async (req, res) => {
    // Verificação do tipo de arquivo
    if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }
    if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ erro: 'Arquivo enviado não é uma imagem.' });
    }

    const filename = req.file.filename;
    const imageID = req.imageID;
    const imageType = req.imageType;

    if (!imageID) {
        return res.status(500).json({ erro: 'ID da imagem não foi gerado no passo anterior.' });
    }

    const conexao = await pool.getConnection();
    try {
        const tableToUpdate = imageType == 1 ? 'clienteImg' : 'animalImg';
        const query = `UPDATE ${tableToUpdate} SET nome_imagem = ? WHERE id = ?`;
        await executaQuery(conexao, query, [filename, imageID]);
        conexao.release();

        res.status(200).json({ mensagem: `Imagem salva como: ${filename}`, filename: filename });
    } catch (error) {
        conexao.release();
        console.error("Erro ao atualizar o nome da imagem no banco:", error);
        res.status(500).json({ erro: "Falha ao salvar a referência da imagem no banco de dados." });
    }
});

export default router;
