const Joi = require('joi')

const appointmentSchema = Joi.object({
    idDoctor: Joi.number().integer().positive().required().messages({
        'number.base': 'ID do medico deve ser um número',
        'number.empty': 'ID do medico não pode ser vazio',
        'number.positive': 'ID do medico deve ser positivo',
        'any.required': 'ID do médico é obrigatório'
    }),
    idPatient: Joi.number().integer().positive().required().messages({
        'number.base': 'ID do paciente deve ser um número',
        'number.empty': 'ID do paciente não pode ser vazio',
        'number.positive': 'ID do paciente deve ser positivo',
        'any.required': 'ID do paciente é obrigatório'
    }),
    date: Joi.date().iso().min('now').required().messages({
        'date.base': 'Data inválida',
        'date.empty': 'Data não pode ser vazia',
        'date.format': 'Data deve estar no formato YYYY-MM-DD',
        'date.min': 'A data não pode ser no passado',
        'any.required': 'Data é obrigatória'
    }),

    time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        'string.pattern.base': 'Horário deve estar no formato HH:mm',
        'string.empty': 'Horario não pode ser vazia',
        'any.required': 'Horário é obrigatório'
    }),
    reason: Joi.string().min(3).max(500).required().messages({
        'string.empty': 'Motivo não pode ser vazia',
        'string.min':'Motivo deve ter no minimo 3 caracteres',
        'string.max': 'Motivo deve ter no máximo 500 caracteres',
        'any.required': 'Motivo é obrigatorio'
    })
})

const updateAppointmentSchema = Joi.object({
    idDoctor: Joi.number().integer().positive().messages({
        'number.base': 'ID do medico deve ser um número',
        'number.empty': 'ID do medico não pode ser vazio',
        'number.positive': 'ID do medico deve ser positivo',
    }),
    idPatient: Joi.number().integer().positive().messages({
        'number.base': 'ID do paciente deve ser um número',
        'number.empty': 'ID do paciente não pode ser vazio',
        'number.positive': 'ID do paciente deve ser positivo',
    }),
    date: Joi.date().iso().min('now').messages({
        'date.base': 'Data inválida',
        'date.empty': 'Data não pode ser vazia',
        'date.format': 'Data deve estar no formato YYYY-MM-DD',
        'date.min': 'A data não pode ser no passado',
    }),

    time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
        'string.pattern.base': 'Horário deve estar no formato HH:mm',
        'string.empty': 'Horario não pode ser vazia',
    }),
    reason: Joi.string().min(3).max(500).messages({
        'string.min':'Motivo deve ter no minimo 3 caracteres',
        'string.max': 'Motivo deve ter no máximo 500 caracteres',
    })
})

module.exports = {appointmentSchema, updateAppointmentSchema}