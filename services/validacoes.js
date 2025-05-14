import { cpf } from 'cpf-cnpj-validator';
import emailValidator from 'email-validator';
import cep from 'cep-promise';
import { isValidPhoneNumber } from 'libphonenumber-js';

export function validarCPF(numCPF) {
    if (!cpf.isValid(numCPF)) {
        throw new Error('CPF inválido');
    }
}

export function validarTelefone(telefone) {
    if (!isValidPhoneNumber(telefone, 'BR')) {
        throw new Error('Telefone inválido');
    }
}

export function validarEmail(email) {
    if (!emailValidator.validate(email)) {
        throw new Error('Email inválido');
    }
}

export async function validarCEP(cepInput) {
    try {
        await cep(cepInput);
        return true;
    } catch (error) {
        return false;
    }
}
