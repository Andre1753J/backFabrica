export function calcularIdade(dataNascimento) {
    if (!dataNascimento) return null;
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}

/*
como usar:
import { calcularIdade } from './services/calcularIdade.js';
const idade = calcularIdade('2015-06-15'); 
use o formato 'YYYY-MM-DD' para a data de nascimento
mas pode usar algo como animal.dt_nascimento, que ele ja deve funcionar
*/