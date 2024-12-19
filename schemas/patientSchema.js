const Joi = require('joi')

const patientSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.base': 'Nome deve ser um texto',
        'string.empty': 'Nome não pode estar vazio',
        'any.required': 'Nome é obrigatório'
    }),
    cpf: Joi.string().pattern(/^\d{11}$/).required().messages({
        'string.base': 'CPF deve ser um texto',
        'string.empty': 'CPF não pode estar vazio',
        'string.pattern.base': 'CPF deve conter exatamente 11 dígitos',
        'any.required': 'CPF é obrigatório'
    }),
    birthDate: Joi.date().iso().max('now').required().messages({
        'date.base': 'Data de nascimento inválida',
        'date.max': 'Data de nascimento não pode ser no futuro',
        'date.format': 'Data deve estar no formato YYYY-MM-DD',
        'any.required': 'Data de nascimento é obrigatória'
    }),
    phone: Joi.number().required().messages({
        'number.base': 'Telefone deve ser so numeros',
        'number.empty': 'Telefone não pode estar vazio',
        'any.required': 'Telefone é obrigatório'
    })
})

const updatePatientSchema = Joi.object({
    name: Joi.string().messages({
        'string.base': 'Nome deve ser um texto',
        'string.empty': 'Nome não pode estar vazio',
    }),
    birthDate: Joi.date().iso().max('now').messages({
        'date.base': 'Data de nascimento inválida',
        'date.format': 'Data deve estar no formato YYYY-MM-DD',
        'date.max': 'Data de nascimento não pode ser no futuro',
    }),
    phone: Joi.number().messages({
        'number.base': 'Telefone deve ser so numeros',
        'number.empty': 'Telefone não pode estar vazio',
    }),
})

module.exports = {patientSchema, updatePatientSchema}