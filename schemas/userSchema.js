const Joi = require('joi')

const userSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.base': 'Nome deve ser um texto',
        'string.empty': 'Nome não pode estar vazio',
        'any.required': 'Nome é obrigatório'
    }),
    email: Joi.string().email().required().messages({
        'string.base': 'Email deve ser um texto',
        'string.empty': 'Email não pode estar vazio',
        'string.email': 'Email inválido',
        'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
        'string.base': 'Senha deve ser um texto',
        'string.empty': 'Senha não pode estar vazia',
        'string.min': 'Senha deve ter no mínimo 6 caracteres',
        'any.required': 'Senha é obrigatória'
    }),
    crm: Joi.string().required().messages({
        'string.base': 'CRM deve ser um texto',
        'string.empty': 'CRM não pode estar vazio',
        'any.required': 'CRM é obrigatório'
    }),
    phone: Joi.number().required().messages({
        'number.base': 'Telefone deve ser so numeros',
        'number.empty': 'Telefone não pode estar vazio',
        'any.required': 'Telefone é obrigatório'
    }),
    speciality: Joi.string().required().messages({
        'string.base': 'Especialidade deve ser um texto',
        'string.empty': 'Especialidade não pode estar vazia',
        'any.required': 'Especialidade é obrigatória'
    })
})

const updateUserSchema = Joi.object({
    name: Joi.string().messages({
        'string.base': 'Nome deve ser um texto',
        'string.empty': 'Nome não pode estar vazio'
    }),
    email: Joi.string().email().messages({
        'string.base': 'Email deve ser um texto',
        'string.empty': 'Email não pode estar vazio',
        'string.email': 'Email inválido',
    }),
    password: Joi.string().min(6).messages({
        'string.base': 'Senha deve ser um texto',
        'string.empty': 'Senha não pode estar vazia',
        'string.min': 'Senha deve ter no mínimo 6 caracteres'
    }),
    crm: Joi.string().messages({
        'string.base': 'CRM deve ser um texto',
        'string.empty': 'CRM não pode estar vazio',
    }),
    phone: Joi.number().messages({
        'number.base': 'Telefone deve ser  so numeros',
        'number.empty': 'Telefone não pode estar vazio'
    }),
    speciality: Joi.string().messages({
        'string.base': 'Especialidade deve ser um texto',
        'string.empty': 'Especialidade não pode estar vazia',
    }),
    isAdmin: Joi.boolean().messages({
        'boolean.base': 'isAdmin deve ser um valor booleano (true/false)'})
})

module.exports = {userSchema, updateUserSchema}