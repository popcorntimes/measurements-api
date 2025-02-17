"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInput = validateInput;
function validateInput(image, customer_code, measure_datetime, measure_type) {
    const errors = [];
    if (!image) {
        errors.push('Imagem (image) é obrigatória.');
    }
    if (!customer_code) {
        errors.push('Código do cliente (customer_code) é obrigatório.');
    }
    if (!measure_datetime) {
        errors.push('Data e hora da medição (measure_datetime) é obrigatória.');
    }
    if (!measure_type) {
        errors.push('Tipo de medição (measure_type) é obrigatório.');
    }
    else if (measure_type.toUpperCase() !== 'WATER' && measure_type.toUpperCase() !== 'GAS') {
        errors.push('Tipo de medição (measure_type) inválido. Deve ser "WATER" ou "GAS".');
    }
    return errors;
}
