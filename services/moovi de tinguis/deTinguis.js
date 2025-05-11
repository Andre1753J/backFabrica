import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../connection.js'
import { quebrarKey } from '../quebraKey.js';


// imgType(1 pra gente, 2 pra bixo)_ID(O idê de quem postou, ou do animal)_subID(O idê no banco de dados)_(A extensão)



//Trocar os .send pra .json fazendo o favor ai ; ;




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../as tinguis'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const novoNome = `imgType${type}_ID${id}_subID${imageID}_${ext}`;
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

let podeSalvar = false;
let id;
let imageID;
let type;

async function addInBank(imageType, id, animalID) {
    const conexao = await pool.getConnection();
    try {
        let query;
        let retorno;
        if (imageType == 1) {
            query = "INSERT INTO clienteImg (cliente) VALUES (?)"
            retorno = await executaQuery(conexao, query, [id]);
        } else if (imageType == 2 || animalID) {
            query = "INSERT INTO animalImg (animal) VALUES (?)"
            retorno = await executaQuery(conexao, query, [animalID]);
        }else{
            conexao.release();
            throw new Error('Tipo de imagem inválido');
        }
        conexao.release();
        console.log(retorno);
        return retorno;

    } catch (error) {
        console.error('Erro ao adicionar no banco de dados:', error);
    }
}



router.post('/upload/:key/type/:imageType/animal/:idAnimal', async (req, res, next) => {
    const { key, imageType, idAnimal } = req.params;


    console.log(imageType, idAnimal);
    //const { imageType, idAnimal } = jsonData;
    //const { imageType, idAnimal } = req.body;
    if (!key || !imageType) return res.status(400).send('Parâmetro key e imageType são obrigatórios.');

    try {
        const conexao = await pool.getConnection();
        const resultado = await verificar(conexao, key);
        if (resultado.length > 0) {
            podeSalvar = true;
            id = resultado[0].id;
        } else {
            podeSalvar = false;
        }
        conexao.release();
    } catch (error) {
        return res.status(500).send('Erro ao verificar a chave.' + error.message);
    }

    if (!podeSalvar) {
        return res.status(403).send('Upload não permitido.');
    }

    const resposta = await addInBank(imageType, id, idAnimal);
    
    if (resposta.affectedRows > 0) {
        type = imageType;
        imageID = resposta.insertId;

    } else {
        return res.status(500).send('Erro ao adicionar no banco de dados.');
    }

    next();
}, upload.single('imagem'), (req, res) => {
    if (!req.file) { return res.status(400).send('Nenhum arquivo enviado.') } else { }
    res.send(`Imagem salva como: ${req.file.filename}, com a chave: ${req.params.key}`);
});

export default router;

