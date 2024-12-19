const Joi = require('joi')

const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    crm: Joi.string().required(),
    phone: Joi.number().required(),
    speciality: Joi.string().required()
})

const updateUserSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    crm: Joi.string(),
    phone: Joi.number(),
    speciality: Joi.string()
})

module.exports = {userSchema, updateUserSchema}