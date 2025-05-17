import express from "express";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { cadastrar, login } from './services/cadastrar_C.js';
import { cadastropt2, editar } from "./services/editar_C.js";
import { cadastrar_A } from "./services/cadastrar_A.js";
import { editar_A } from "./services/editar_A.js";
import { validarCEP, validarCPF, validarEmail, validarTelefone } from "./services/validacoes.js";
import upload from "./services/moovi de tinguis/deTinguis.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post('/cadastrar_c', async (req, res) => {
    const { email, senha } = req.body;

    try {
        validarEmail(email);

        const retorno = await cadastrar(email, senha);

        if (retorno[0].affectedRows > 0) {
            res.status(200).json({ response: retorno[1] });
        } else {
            res.status(400).json({ response: "Isso ai já existe, ou tá errado" });
        }

    } catch (error) {
        if (error.message === 'Email inválido') {
            res.status(400).json({ erro: 'E-mail inválido' });
        } else {
            console.error(error);
            res.status(500).json({ error: "Erro interno ao cadastrar" });
        }
    }
});

app.get('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const retorno = await login(email, senha);
        res.status(200).json({ response: retorno });
    } catch (error) {
        res.status(400).json({ response: error.message });
    }
})

app.patch('/cadastro_c_pt2/:key', async (req, res) => {
    const { key } = req.params;
    const { nome, cpf, cep, complemento, dt_nascimento, telefone } = req.body;

    if (!nome || !cpf || !cep || !dt_nascimento || !telefone) {
        return res.status(400).json({ response: "Preencha todos os campos OBRIGATÓRIOS" });
    }

    try {
        validarCPF(cpf);
        validarTelefone(telefone);

        const cepValido = await validarCEP(cep);
        if (!cepValido) {
            return res.status(400).json({ response: "CEP inválido" });
        }

        const retorno = await cadastropt2(key, nome, cpf, cep, complemento, dt_nascimento, telefone);

        if (retorno.affectedRows > 0) {
            res.status(200).json({ response: "Afetou ai tlg" });
        } else {
            res.status(400).json({ response: "Isso ai já existe, ou tá errado" });
        }

    } catch (error) {
        console.log(key, nome, cpf, cep, complemento, dt_nascimento, telefone)
        res.status(400).json({ response: error.message });
    }
});

app.patch('/editar/:key', async (req, res) => {
    const { key } = req.params;
    const { nome, cpf, cep, complemento, dt_nascimento } = req.body;
    if (nome == undefined && cpf == undefined && cep == undefined && complemento == undefined && dt_nascimento == undefined) {
        res.status(400).json({ response: "Preencha pelo menos UM CAMPO" });
    } else {
        try {
            const retorno = await editar(key, nome, cpf, cep, complemento, dt_nascimento);

            if (retorno.affectedRows > 0) {
                res.status(200).json({ response: "Afetou ai tlg" });
            } else {
                res.status(400).json({ response: "Isso ai já existe, ou tá errado" });
            }
        }
        catch (error) {
            res.status(400).json({ response: error.message });
        }
    }

})

app.post('/cadastrar_a/:key', async (req, res) => {
    const { key } = req.params;
    const { nome, idade, sexo, disponivel } = req.body;
    if (nome == undefined || idade == undefined || sexo == undefined || disponivel == undefined) {
        res.status(400).json({ response: "Preencha todos os campos OBRIGATÓRIOS" });
    } else {
        try {
            const retorno = await cadastrar_A(key, nome, idade, sexo, disponivel);
            if (retorno.affectedRows > 0) {
                res.status(200).json({ response: "Afetou ai tlg" });
            }
            else {
                res.status(400).json({ response: "Isso ai já existe, ou tá errado" });
            }
        }
        catch (error) {
            res.status(400).json({ response: error.message });
        }

    }
})

app.patch('/editar_a/:key', async (req, res) => {
    const { key } = req.params;
    const { nome, idade, sexo, disponivel, adotador, animalID } = req.body;
    if (nome == undefined && idade == undefined && sexo == undefined && disponivel == undefined && adotador == undefined) {
        res.status(400).json({ response: "Preencha pelo menos UM CAMPO" });
    } else {
        if (animalID == undefined) {
            res.status(404).json({ response: "Preencha o ID do animal" });
        } else {
            try {
                const retorno = await editar_A(key, nome, idade, sexo, disponivel, adotador, animalID);
                if (retorno.affectedRows > 0) {
                    res.status(200).json({ response: "Afetou ai tlg" });
                }
                else {
                    res.status(400).json({ response: "Isso ai já existe, ou tá errado" });
                }
            }
            catch (error) {
                res.status(400).json({ response: error.message });
            }
        }
    }
})

app.get('/imagem/:nome', (req, res) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const nomeArquivo = req.params.nome;
        if (!nomeArquivo) {
            return res.status(400).json({ erro: "Nome do arquivo não fornecido" });
        }

        const caminho = path.join(__dirname, './as tinguis', nomeArquivo);

        res.sendFile(caminho, (err) => {
            if (err) {
                console.error("Erro:", err.message);
                res.status(404).json({ erro: "Imagem não encontrada" });
            }
        });
    } catch (error) {
        res.status(500).json({ erro: "Erro interno" });
        console.log(error);
    }

});

app.use('/', upload);

app.listen(9000, () => {
    const data = new Date();
    console.log('Servidor inciado ass ' + data);
})