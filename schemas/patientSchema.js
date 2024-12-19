const Joi = require('joi')

const patientSchema = Joi.object({
    name: Joi.string().required(),
    cpf: Joi.string().required(),
    birthDate: Joi.date().required(),
    phone: Joi.number().required(),
})

const updatePatientSchema = Joi.object({
    name: Joi.string(),
    birthDate: Joi.date(),
    phone: Joi.number(),
})

module.exports = {patientSchema, updatePatientSchema}