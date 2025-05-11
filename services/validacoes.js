import { cpf } from 'cpf-cnpj-validator';
import emailValidator from 'email-validator';
import cep from 'cep-promise';

export async function validarCPF(numCPF) {
    if (!cpf.isValid(numCPF)) {
        throw new Error('CPF inválido');
    }
}

export async function validarEmail(email) {
    if (!emailValidator.validate(email)) {
        throw new Error('Email inválido');
    }
}

export async function validarCEP(cepInput, estado, rua) {
    try {
        const resultado = await cep(cepInput);
        const estadoValido = resultado.state.toLowerCase() === estadoEsperado.toLowerCase();
        const ruaValida = resultado.street.toLowerCase().includes(ruaEsperada.toLowerCase());
        return estadoValido && ruaValida;
    } catch (error) {
        return false;
    }
}