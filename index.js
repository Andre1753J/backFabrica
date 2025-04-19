import express from "express";
import cors from 'cors';
import { cadastrar, login } from './services/cadastrar.js';
import { cadastropt2, editar } from "./services/editar.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post('/cadastrar', async (req, res) => {
    const { email,  senha } = req.body;
    const retorno = await cadastrar(email, senha);

    if(retorno.affectedRows > 0){
        res.status(200).json({ response: "Afetou ai tlg"});
    }else{
        res.status(400).json({ response : "Isso ai já existe, ou tá errado"});
    }
})

app.get('/login', async (req, res) => {
    const { email, senha } = req.body;
    try{
        const retorno = await login(email, senha);
        res.status(200).json({ response: retorno });
    }catch(error){
        res.status(400).json({ response: error.message });
    }
})

app.patch('/cadastropt2/:key', async (req, res) => {
    const { key } = req.params;
    const { nome, cpf, estado, rua, cep, complemento, dt_nascimento } = req.body;
    if (nome == undefined || cpf == undefined || estado == undefined || rua == undefined || cep == undefined || dt_nascimento == undefined) {
        res.status(400).json({ response: "Preencha todos os campos OBRIGATÓRIOS" });
    } else {
        try {
            const retorno = await cadastropt2(key, nome, cpf, estado, rua, cep, complemento, dt_nascimento);

            if(retorno.affectedRows > 0){
                res.status(200).json({ response: "Afetou ai tlg"});
            }else{
                res.status(400).json({ response : "Isso ai já existe, ou tá errado"});
            }
        }
        catch (error) {
            res.status(400).json({ response: error.message });
        }
    }

})

app.patch('/editar/:key', async (req, res) => {
    const { key } = req.params;
    const { nome, cpf, estado, rua, cep, complemento, dt_nascimento } = req.body;
    if (nome == undefined && cpf == undefined && estado == undefined && rua == undefined && cep == undefined && complemento == undefined && dt_nascimento == undefined) {
        res.status(400).json({ response: "Preencha pelo menos UM CAMPO" });
    } else {
        try {
            const retorno = await editar(key, nome, cpf, estado, rua, cep, complemento, dt_nascimento);

            if(retorno.affectedRows > 0){
                res.status(200).json({ response: "Afetou ai tlg"});
            }else{
                res.status(400).json({ response : "Isso ai já existe, ou tá errado"});
            }
        }
        catch (error) {
            res.status(400).json({ response: error.message });
        }
    }

})

app.listen(9000, ()=>{
    const data = new Date();
    console.log('Servidor inciado ass ' + data);
})