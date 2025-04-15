import express from "express";
import cors from 'cors';
import multer from "multer";

const app = express();

app.use(cors());

app.post('/login', async (req, res) => {
    const { email,  senha } = req.body;


})


app.listen(9000, ()=>{
    const data = new Date();
    console.log('Servidor inci')
})