import { cpf } from 'cpf-cnpj-validator';
import emailValidator from 'email-validator';
import cep from 'cep-promise';
import { isValidPhoneNumber } from 'libphonenumber-js';

export function validarCPF(numCPF) {
    if (!cpf.isValid(numCPF)) {
        throw new Error('CPF inválido');
    }
}

// export function validarTelefone(numero, codigoPais = 'BR') {
//   return isValidPhoneNumber(numero, codigoPais);
// }

// console.log(validarTelefone('+55 11 91234-5678')); // true

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