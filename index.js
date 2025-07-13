import express from "express";
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { cadastrar, login } from './services/cadastrar_C.js'; 
import { cadastropt2, editar_c, mudar_senha } from "./services/editar_C.js";
import { cadastrar_A } from "./services/cadastrar_A.js";
import { editar_A } from "./services/editar_A.js";
import { validarCEP, validarCPF, validarEmail, validarTelefone } from "./services/validacoes.js";
import upload from "./services/moovi de tinguis/deTinguis.js";
import { listarAnimaisDisponiveis } from "./services/listar_A.js";
import { solicitarAdocao } from "./services/solicitar_adocao.js";
import { resolverAdocao } from "./services/resolver_adocao.js";
import { deletarCliente } from "./services/deletar_C.js";
import { meusAnimais } from "./services/animais_do_C.js";
import { removerAnimal } from "./services/remover_A.js";
import { minhasAdocoes } from "./services/adocoes_C.js";
import { solicitacoesRecebidas } from "./services/solicitacoes_recebidas.js";
import { cancelarAdocao } from "./services/cancelar_adocao.js";
import { buscarCliente } from './services/info_C.js'; 
import { detalharAnimal } from './services/info_A.js';
import { filtrarAnimaisSimples } from './services/filtrar_A.js';

import { databankCheck } from './DataBankCheck.js';

const check = databankCheck('./DataBank.ISO');

const app = express();

// Configuração de CORS mais robusta
const allowedOrigins = [
    'http://localhost:3000',
    'http://26.113.18.78:3000',
    'https://petsworld.dev.vilhena.ifro.edu.br'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permite requisições sem 'origin' (ex: Postman) ou se a origem estiver na lista de permitidas
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Acesso não permitido pela política de CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

app.options('*', cors(corsOptions)); // Habilita pre-flight para todas as rotas
app.use(cors(corsOptions)); // Aplica a configuração de CORS

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API funcionando');
});

function checkAvailability(req, res, next) {
    if (!check()) {
        return res.status(503).send('Serviço temporariamente indisponível');
    }
    next();
}
app.use(checkAvailability);

app.get('/api/status', (req, res) => {
    res.json({ status: true });
});



app.post('/cadastrar_c', async (req, res) => {
    const { email, senha } = req.body;

    try {
        validarEmail(email);

        const retorno = await cadastrar(email, senha);
        // O service já lança erro se o e-mail existir, então só precisamos tratar o sucesso.
        if (retorno && retorno[1]) {
            res.status(201).json({ message: "Cadastro iniciado com sucesso!", data: { key: retorno[1] } });
        } else {
            res.status(400).json({ error: "Não foi possível iniciar o cadastro." });
        }

    } catch (error) {
        // Logar o erro completo no console do backend para facilitar a depuração
        console.error("Erro na rota /cadastrar_c:", error);
        // Trata erros específicos para dar um feedback melhor ao usuário
        if (error.message === 'Email inválido' || error.message === "Este e-mail já está em uso.") {
            res.status(400).json({ error: error.message });
        } else {
            // Erro genérico para outras falhas inesperadas
            res.status(500).json({ error: "Erro interno no servidor. Verifique os logs do backend para mais detalhes." });
        }
    }
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const retorno = await login(email, senha);
        res.status(200).json({ data: { key: retorno } });
    } catch (error) {
        console.error("Erro no login:", error.message);
        res.status(401).json({ error: error.message });
    }
})

app.get('/info_c/:key', async (req, res) => {
    try {
        const cliente = await buscarCliente(req.params.key);
        res.status(200).json({ data: cliente });
    } catch (error) {
        console.error("Erro ao buscar cliente:", error.message);
        res.status(error.status || 400).json({ error: error.message });
    }
})

app.patch('/editar_cliente/:key', async (req, res) => {
    const { key } = req.params;
    const updates = req.body || {};

    // A senha atual é necessária para confirmar as alterações
    if (!updates.senhaAtual) { // A lógica de validação de senha está no service
        return res.status(400).json({ error: "A senha atual é obrigatória para editar o perfil." });
    }

    try {
        const retorno = await editar_c(key, updates);

        if (retorno && retorno.affectedRows > 0) {
            res.status(200).json({ message: "Alterações nas informações feitas com sucesso", data: { newKey: retorno.newKey } });
        } else {
            res.status(400).json({ error: "Nenhuma alteração foi feita. Verifique os dados." });
        }
    } catch (error) {
        console.error("Erro ao editar cliente:", error.message);
        res.status(400).json({ error: error.message });
    }
});

app.patch('/mudar_senha/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const resultado = await mudar_senha(key, req.body);
        res.status(200).json({
            message: resultado.message,
            data: { newKey: resultado.newKey }
        });
    } catch (error) {
        console.error("Erro ao mudar senha:", error.message);
        // Retorna 400 para erros de validação ou de usuário, que são os esperados aqui.
        res.status(400).json({ error: error.message });
    }
});

app.patch('/cadastrar_c_pt2/:key', async (req, res) => {
    const { key } = req.params;
    const { nome, cpf, rg, dt_nascimento, sexo, cep, endereco, bairro, estado, cidade, complemento, telefone, telefone2 } = req.body;

    // TODO: RG é opcional apenas para desenvolvimento. Reativar a obrigatoriedade.
    if (!nome || !cpf || !cep || !dt_nascimento || !telefone || !sexo || !bairro || !estado || !endereco || !cidade) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
    }

    try {
        validarCPF(cpf);
        validarTelefone(telefone);

        const cepValido = await validarCEP(cep);
        if (!cepValido) {
            return res.status(400).json({ error: "CEP inválido" });
        }

        const retorno = await cadastropt2(key, nome, cpf, rg, dt_nascimento, sexo, cep, endereco, bairro, estado, cidade, complemento, telefone, telefone2);

        if (retorno.affectedRows > 0) {
            res.status(200).json({ message: "Cadastro Finalizado com sucesso" });
        } else {
            res.status(400).json({ error: "O cadastro que deseja realizar já é existente" });
        }
    } catch (error) {
        console.error("Erro na parte 2 do cadastro:", error.message);
        res.status(400).json({ error: error.message });
    }
})

app.delete('/deletar_c/:key', async (req, res) => {
    try {
        const resultado = await deletarCliente(req.params.key);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Cliente não encontrado ou já deletado." });
        }

        res.status(200).json({ message: "Cliente deletado com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar cliente:", error.message);
        res.status(400).json({ error: error.message });
    }
});

app.post('/cadastrar_a/:key', async (req, res) => {
    const { key } = req.params;
    const {
        nome, dt_nascimento, sexo, descricao,
        castrado, vacinado, vermifugado, idEspecie, idRaca, idCor, idPorte
    } = req.body;

    // Validação dos campos obrigatórios
    if (
        !nome || !dt_nascimento || !sexo ||
        idEspecie === undefined || idRaca === undefined ||
        idCor === undefined || idPorte === undefined
    ) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }
    try {
        const retorno = await cadastrar_A(
            key, nome, dt_nascimento, sexo, descricao,
            castrado, vacinado, vermifugado, idEspecie, idRaca, idCor, idPorte
        );
        if (retorno && retorno.affectedRows > 0) {
            if (!retorno.insertId) {
                throw new Error("Falha ao obter o ID do novo animal após o cadastro.");
            }
            res.status(201).json({
                message: "Cadastro do animal realizado com sucesso.",
                data: { animalId: retorno.insertId }
            });
        } else {
            res.status(400).json({ error: "Não foi possível cadastrar o animal. Verifique os dados enviados." });
        }
    } catch (error) {
        console.error("Erro ao cadastrar animal:", error.message);
        res.status(400).json({ error: error.message });
    }
});

app.get('/meus_animais/:key', async (req, res) => {
    try {
        const animais = await meusAnimais(req.params.key);
        res.status(200).json({ data: animais });
    } catch (error) {
        console.error("Erro ao listar meus animais:", error.message);
        res.status(400).json({ error: error.message });
    }
})

app.get('/minhas_adocoes/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const adotados = await minhasAdocoes(key);
        res.status(200).json({ data: adotados });
    } catch (error) {
        console.error("Erro ao listar minhas adoções:", error.message);
        res.status(400).json({ error: error.message });
    }
});

app.get('/solicitacoes_recebidas/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const solicitacoes = await solicitacoesRecebidas(key);
        res.status(200).json({ data: solicitacoes });
    } catch (error) {
        console.error("Erro ao listar solicitações recebidas:", error.message);
        res.status(400).json({ error: error.message });
    }
});

app.delete('/cancelar_adocao/:key/:animalID', async (req, res) => {
    const { key, animalID } = req.params;

    try {
        const resultado = await cancelarAdocao(key, animalID);

        if (resultado.cancelado) {
            res.status(200).json({ message: "Adoção cancelada com sucesso." });
        } else {
            res.status(404).json({
                error: resultado.motivo || "Não foi possível cancelar a adoção."
            });
        }
    } catch (error) {
        console.error("Erro ao cancelar adoção:", error.message);
        res.status(400).json({ error: error.message });
    }
});

app.delete('/remover_a/:key/:animalID', async (req, res) => {
    try {
        await removerAnimal(req.params.key, req.params.animalID);
        res.status(200).json({ message: "Animal removido com sucesso." });
    } catch (error) {
        console.error("Erro ao remover animal:", error.message);
        res.status(400).json({ error: error.message });
    }
})

app.patch('/editar_a/:key/:animalID', async (req, res) => {
    const { key, animalID } = req.params;
    const {
        nome, dt_nascimento, sexo, disponivel, descricao, // Remove animalID daqui
        castrado, vacinado, vermifugado, adotador,
        idEspecie, idRaca, idCor, idPorte
    } = req.body;

    // Verifica se pelo menos um campo foi enviado para edição
    if (
        nome === undefined && dt_nascimento === undefined && sexo === undefined &&
        disponivel === undefined && descricao === undefined &&
        castrado === undefined && vacinado === undefined && vermifugado === undefined &&
        adotador === undefined && idEspecie === undefined && idRaca === undefined &&
        idCor === undefined && idPorte === undefined
    ) { // Validação para garantir que pelo menos um campo foi enviado
        return res.status(400).json({ error: "Nenhum campo para atualizar foi fornecido." });
    }

    try {
        const retorno = await editar_A(
            key, nome, dt_nascimento, sexo, disponivel, descricao,
            castrado, vacinado, vermifugado, adotador,
            idEspecie, idRaca, idCor, idPorte, animalID
        );
        if (retorno && retorno.affectedRows > 0) {
            res.status(200).json({ message: "Informações do animal alteradas com sucesso." });
        } else {
            res.status(400).json({ error: "Nenhuma alteração foi feita. Verifique os dados e permissões." });
        }
    } catch (error) {
        console.error("Erro ao editar animal:", error.message);
        res.status(400).json({ error: error.message });
    }
});

app.get('/listar_animais', async (req, res) => {
    try {
        const animais = await listarAnimaisDisponiveis();
        if (animais && animais.length > 0) {
            res.status(200).json({ data: animais });
        } else {
            res.status(200).json({ data: [] }); // Retorna array vazio se não houver animais
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno ao listar animais." });
    }
})

app.get('/filtrar_animais', async (req, res) => {
    try {
        const { especie, sexo, porte, disponivel } = req.query;
        const animais = await filtrarAnimaisSimples({
            especie,
            sexo,
            porte,
            disponivel: disponivel !== undefined ? disponivel === "true" : undefined
        });
        res.status(200).json({ data: animais });
    } catch (error) {
        console.error("Erro ao filtrar animais:", error.message);
        res.status(400).json({ error: error.message });
    }
});

app.get('/animal/:id', async (req, res) => {
    try {
        const animal = await detalharAnimal(req.params.id);
        res.status(200).json({ data: animal });
    } catch (error) {
        console.error("Erro ao detalhar animal:", error.message);
        res.status(404).json({ error: error.message });
    }
});

app.get('/imagem/:nome', (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const nomeArquivo = req.params.nome;

    // Segurança básica: impede que acessem pastas superiores (ex: ../../)
    if (!nomeArquivo || nomeArquivo.includes('..')) {
      return res.status(400).json({ error: "Nome de arquivo inválido." });
    }

    // Cria o caminho absoluto para o arquivo
    const caminho = path.join(__dirname, 'as tinguis', nomeArquivo);

    // Log para depuração: mostra no console o caminho exato que está sendo procurado
    console.log(`Tentando servir a imagem: ${caminho}`);

    res.sendFile(caminho, (err) => {
      if (err) {
        console.error(`Falha ao enviar arquivo: ${caminho}`, err);
        res.status(404).json({ error: "Imagem não encontrada." });
      }
    });
  } catch (error) {
    console.error("Erro interno na rota /imagem/:nome:", error);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

app.post('/solicitar_adocao/:key', async (req, res) => {
    const { key } = req.params;
    const { id_animal } = req.body;

    if (!id_animal) { // Validação de entrada
        return res.status(400).json({ error: "O ID do animal é obrigatório." });
    }
    try {
        const resultado = await solicitarAdocao(key, id_animal);
        res.status(200).json({ message: "Adoção solicitada com sucesso." });
    } catch (error) {
        console.error("Erro ao solicitar adoção:", error.message);
        res.status(400).json({ error: error.message });
    }
});

app.patch('/resolver_adocao/:key', async (req, res) => {
    const { key } = req.params;
    const { id_adocao, status } = req.body;

    if (!id_adocao || !status || !["aprovado", "recusado"].includes(status)) {
        return res.status(400).json({ error: "Dados inválidos. Forneça id_adocao e um status válido ('aprovado' ou 'recusado')." });
    }

    try {
        await resolverAdocao(key, id_adocao, status); // Lança erro em caso de falha
        res.status(200).json({ message: `Solicitação de adoção foi ${status === 'aprovado' ? 'aprovada' : 'recusada'} com sucesso.` });
    } catch (error) {
        console.error("Erro ao resolver adoção:", error.message);
        res.status(403).json({ error: error.message }); // 403 pode ser apropriado para falha de permissão
    }
})

// app.use('/', upload); // <--- DESABILITADO TEMPORARIAMENTE

// O erro "Missing parameter name" indica que há uma rota malformada
// dentro do arquivo './services/moovi de tinguis/deTinguis.js'.
// Procure por rotas com erro de sintaxe como "router.post('/:')" ou "router.get('/: nomeComEspaco')".

app.listen(9000, () => {
    const data = new Date();
    console.log('Servidor iniciado às ' + data + " em localhost:9000");
})