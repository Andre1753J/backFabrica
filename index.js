import express from "express";
import cors from 'cors';
import { cadastrar } from "./services/cadastrar";

const app = express();

app.use(cors());

app.post('/cadastrar', async (req, res) => {
    const { email,  senha } = req.body;
    const retorno = await cadastrar(email, senha);

    if(retorno.affectedRows > 0){
        res.status(200).json({ response: "Afetou ai tlg"});
    }else{
        res.status(400).json({ response : "Isso ai já existe, ou tá errado"});
    }
})


app.listen(9000, ()=>{
    const data = new Date();
    console.log('Servidor inciado ass ' + data);
})