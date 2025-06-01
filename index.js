import express from "express";
import cors from 'cors';
import { fileURLToPath } from 'url';
import { cadastrar, login } from './services/cadastrar_C.js';
import { cadastropt2, editar_c } from "./services/editar_C.js";
import { cadastrar_A } from "./services/cadastrar_A.js";
import { editar_A } from "./services/editar_A.js";
import { validarCEP, validarCPF, validarEmail, validarTelefone } from "./services/validacoes.js";
import upload from "./services/moovi de tinguis/deTinguis.js";
import { listarAnimaisDiponiveis } from "./services/listar_A.js";
import { solicitarAdocao } from "./services/solicitar_adocao.js";
import { resolverAdocao } from "./services/resolver_adocao.js";
import { deletarCliente } from "./services/deletar_C.js";
import { meusAnimais } from "./services/animais_do_C.js";
import { removerAnimal } from "./services/remover_A.js";
import { minhasAdocoes } from "./services/adocoes_C.js";
import { solicitacoesRecebidas } from "./services/solicitacoes_recebidas.js";
import { cancelarAdocao } from "./services/cancelar_adocao.js";
import { buscarCliente } from './services/info_C.js';


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
            res.status(400).json({ response: "Email não existente, favor colocar um valido" });
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

app.get('/info_c/:key', async (req, res) => {
    try {
        const cliente = await buscarCliente(req.params.key);
        res.status(200).json({ cliente });
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
})

app.patch('/cadastrar_c_pt2/:key', async (req, res) => {
    const { key } = req.params;
    const { nome, cpf, cep, complemento, dt_nascimento, telefone, rg, sexo, bairro } = req.body;

    console.log(key, nome, cpf, cep, complemento, dt_nascimento, rg, sexo, bairro);


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
            res.status(200).json({ response: "Cadastro Finalizado com sucesso" });
        } else {
            res.status(400).json({ response: "O cadastro que deseja realizar já é existente" });
        }

    } catch (error) {

        res.status(400).json({ response: error.message });
    }
});

app.patch('/editar_c/:key', async (req, res) => {
    const { key } = req.params;
    const { nome, cpf, cep, complemento, dt_nascimento } = req.body || {};
    if (nome == undefined && cpf == undefined && cep == undefined && complemento == undefined && dt_nascimento == undefined) {
        res.status(400).json({ response: "Preencha pelo menos UM CAMPO" });
    } else {
        try {
            const retorno = await editar_c(key, nome, cpf, cep, complemento, dt_nascimento);

            if (retorno.affectedRows > 0) {
                res.status(200).json({ response: "Alterações nas informações feitas com sucesso" });
            } else {
                res.status(400).json({ response: "alguma informação esta invalida" });
            }
        }
        catch (error) {
            res.status(400).json({ response: error.message });
        }
    }

})

app.delete('/deletar_c/:key', async (req, res) => {
    try {
        await deletarCliente(req.params.key);
        res.status(200).json({ mensagem: "Cliente deletado com sucesso" });
    } catch (error) {
        res.status(400).json({ error: error.message });
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
                res.status(200).json({ response: "Cadastro do animal realizado com sucesso" });
            }
            else {
                res.status(400).json({ response: "Informação invalida ou animal ja cadastrado" });
            }
        }
        catch (error) {
            res.status(400).json({ response: error.message });
        }

    }
})

app.get('/meus_animais/:key', async (req, res) => {
    try {
        const animais = await meusAnimais(req.params.key);
        res.status(200).json({ animais });
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
})

app.get('/minhas_adocoes/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const adotados = await minhasAdocoes(key);
        res.status(200).json({ response: adotados });
    } catch (error) {
        res.status(400).json({ response: error.message });
    }
});

app.get('/solicitacoes_recebidas/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const solicitacoes = await solicitacoesRecebidas(key);
        res.status(200).json({ response: solicitacoes });
    } catch (error) {
        res.status(400).json({ response: error.message });
    }
});

app.delete('/cancelar_adocao/:key/:animalID', async (req, res) => {
    const { key, animalID } = req.params;
    try {
        const retorno = await cancelarAdocao(key, animalID);
        if (retorno.affectedRows > 0) {
            res.status(200).json({ response: "Adoção cancelada com sucesso" });
        } else {
            res.status(400).json({ response: "Não foi possível cancelar a adoção (verifique a chave e o ID do animal)" });
        }
    } catch (error) {
        res.status(400).json({ response: error.message });
    }
});

app.delete('/remover_a/:key/:animalID', async (req, res) => {
    try {
        await removerAnimal(req.params.key, req.params.animalID);
        res.status(200).json({ mensagem: "Animal removido com sucesso." });
    } catch (error) {
        res.status(400).json({ erro: error.message });
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
                    res.status(200).json({ response: "Informações alteradas com sucesso" });
                }
                else {
                    res.status(400).json({ response: "Campo inválido ou ID informado inválido" });
                }
            }
            catch (error) {
                res.status(400).json({ response: error.message });
            }
        }
    }
})

app.get('/listar_animais', async (req, res) => {
    try {
        const animais = await listarAnimaisDiponiveis();
        if (animais.length > 0) {
            res.status(200).json({ response: animais });
        } else {
            res.status(404).json({response: "Nenhum animal disponível para adoção no momento."})
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ response: "Erro interno ao listar animais" });
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

app.post('/solicitar_adocao/:key', async (req, res) => {
    const { key } = req.params;
    const { id_animal } = req.body;

    if (!id_animal) {
        return res.status(400).json({ response: "ID do animal é obrigatório" });
    }
    try {
        const resultado = await solicitarAdocao(key, id_animal);
        res.status(200).json({ response: "Adoção solicitada com sucesso"});
    } catch (error) {
        res.status(400).json({ response: error.message });
    }
});

app.patch('/resolver_adocao/:key', async (req, res) => {
    const {key} = req.params;
    const { id_adocao, status } = req.body;

    if (!id_adocao || !["aprovado", "recusado"].includes(status)) {
        return res.status(400).json({ response: "Dados invalidos" });
    }

    try {
        await resolverAdocao(key, id_adocao, status);
        res.status(200).json({ response: `Solicitação ${status} com sucesso.` });
    }catch (error) {
        res.status(403).json({ response: error.message });
    }
})

app.use('/', upload);

app.listen(9000, () => {
    const data = new Date();
    console.log('Servidor inciado ass ' + data);
})