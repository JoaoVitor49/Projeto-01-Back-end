const express = require('express')
const jwt = require("jsonwebtoken")
const router = express.Router()
const { authenticateToken, admin } = require('../middlewares/auth')

const users = []
users.push({
    id: 1,
    name: "Dr. Roberto Costa",
    email: "roberto.costa@example.com",
    password: "senha123",
    crm: "123456-DF",
    phone: "61987654321",
    especialidade: "Cardiologista",
    isAdmin: true
})

const patients = []
const appointments = []

let idPatient = 1
let idDoctor = 2
let idAppointment = 1

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body
    const user = users.find(user => user.email === email && user.password === password)
    if (!user) {
        return res.status(401).json({ message: 'Email ou senha incorretos!' })
    }
    const token = jwt.sign({ email: user.email, isAdmin: user.isAdmin, id: user.idDoctor }, "123@abc#", { expiresIn: '30m' })
    res.status(200).json({ message: 'Login feito com sucesso', token })
});

// Criar usuários (somente admin pode criar)
router.post('/createUser', authenticateToken, admin, (req, res) => {
    const { name, email, password, crm, phone, specialty} = req.body
    const newUser = { idDoctor, name, email, password, crm, phone, specialty, isAdmin: false }
    users.push(newUser)
    idDoctor++
    res.status(201).json([{ message: 'Usuário cadastrado' }, { newUser }])
});

// Criar admins (somente admin pode criar)
router.post('/createAdmin', authenticateToken, admin, (req, res) => {
    const { name, email, password, crm, phone, specialty} = req.body
    const newAdmin = { idDoctor, name, email, password, crm, phone, specialty, isAdmin: true }
    users.push(newAdmin)
    idDoctor++
    res.status(201).json([{ message: 'Usuário cadastrado' }, { newAdmin }])
});

// Alterar dados dos usuario (admin podem alterar qualquer usuario)
router.put('/updateUser/:id', authenticateToken, (req,res)=>{
    const { id } = req.params
    const { name, email, password, crm, phone, specialty, isAdmin } = req.body
    const index = users.findIndex(user => user.idDoctor == id)
    if (index === -1) {
        return res.status(404).json({ message: 'Usuário não encontrado!' })
    }
    if(req.user.isAdmin){
        users[index] = {...users[index], idDoctor, name: name, email: email, password: password, crm: crm, phone:phone, specialty:specialty, isAdmin: isAdmin}
        return res.status(200).json({message: 'Usuario alterado com sucesso'})
    }
    if(req.user.email === users[index].email){
        users[index] = {...users[index], idDoctor, name: name, email: email, password: password, crm: crm, phone:phone, specialty:specialty}
        res.status(200).json({message: 'Usuario alterado com sucesso'})
    }  
    res.status(403).json({ message: 'Acesso negado: Você só pode alterar seus próprios dados!' });   
})

// Deletar usuários (somente admin pode deletar)
router.delete('/delUser/:id', authenticateToken, admin, (req, res) => {
    const { id } = req.params
    const userIndex = users.findIndex(user => user.idDoctor == id)
    if (userIndex === -1) {
        return res.status(401).json({ message: "Usuário não existe!" })
    }
    if(users[userIndex].isAdmin === false){
        users.splice(userIndex, 1)
        return res.status(200).json({ message: "Usuário deletado" })
    }else{
        return res.status(401).json({ message: "Usuário é um adminstrador, portanto não pode ser excluido!" })
    }  
});

// Ver todos os usuários
router.get('/getUsers', authenticateToken, (req, res) => {
    res.status(200).json(users)
});

// Pesquisar através de especialidade
router.get('/getSpeciality/:speciality', authenticateToken, (req, res)=>{
    const {specialty} = req.params
    for(let i=0; i<users.length;i++){
        if(users[i].specialty === specialty){
            return res.json(users[i])
        }else{
            return res.status(401).json({message: "Nenhum médico tem essa especialidade!"})
        }
    }
})

// Criar pacientes
router.post('/createPatient', authenticateToken, (req, res)=>{
    const {name, cpf, birthDate, phone} = req.body
    const newPatient = {idPatient, name, cpf, birthDate, phone}
    patients.push(newPatient)
    idPatient++
    res.json([{message: 'Paciente Cadastrado'}, {newPatient}])
})

// Atualiza dados do paciente
router.put('/updatePatient/:id', authenticateToken, (req,res)=>{
    const {id} = req.params
    const {name, birthDate, phone} = req.body
    const index = patients.findIndex(patient => patient.idPatient == id)
    if(index === -1){
        return res.status(404).json({ message: 'Paciente não encontrado!' })
    }
    patients[index] = {...patients[index], name: name, birthDate: birthDate, phone: phone}
    res.status(200).json({message: 'Dados do pacientes atualizados com sucesso!'})
})

// Deleta pacientes
router.delete('deletePatient/:id', authenticateToken, (req,res)=>{
    const {id} = req.params
    const index = patients.findIndex(patient => patient.idPatient == id)
    if(index === -1){
        return res.status(404).json({ message: 'Paciente não encontrado!' })
    }
    patients.splice(index,1)
    res.status(200).json({message: 'Paciente deletado com sucesso!'})
})

// Ver todos os pacientes
router.get('/getAllPatient', authenticateToken, (req,res)=>{
    res.status(200).json(patients)
})

// Pesquisar paciente por nome
router.get('/getPatientName:/name', authenticateToken, (req,res)=>{
    const {name} = req.params
    for(let i=0; i<patients.length; i++){
        if(name === patients[i].name){
            return res.status(200).json(patients[i])
        }else{
            return res.status(404).json({message: "Paciente não encontrado!"})
        }
    }
})

// Cria uma nova consulta
router.post('/createAppointement', authenticateToken, (req,res)=>{
    const {idDoctor, idPatient, date, time, reason} = req.body
    const newAppointment = {idAppointment, idDoctor, idPatient, date, time, reason}
    appointments.push(newAppointment)
    idAppointment++
    res.status(200).json({message: 'Consulta marcada com sucesso!'})
})

// Atualiza os dados da consulta
router.put('/updateAppointment/:id', authenticateToken, (req,res)=>{
    const {id} = req.params
    const {idDoctor, idPatient, date, time, reason} = req.body
    const index = appointments.findIndex(appointment => appointment.idAppointment == id)
    if(index === -1){
        return res.status(404).json({ message: 'Consulta não encontrada!' })
    }
    if(req.user.id == appointments[index].idDoctor){
        appointments[index] = {...appointments[index], idDoctor, idPatient, date, time, reason}
        return res.status(200).json({message: 'Consulta atualizada com sucesso!'})
    }else{
        return res.status(401).json({message: 'Apenas o médico responsável pela consulta pode alterar os dados!'})
    }
})

// Deleta uma consulta
router.delete('/deleteAppointment/:id', authenticateToken, (req,res)=>{
    const {id} = req.params
    const index = appointments.findIndex(appointment => appointment.idAppointment == id)
    if(req.user.id == appointments[index].idDoctor){
        appointments.splice(index, 1)
        return res.status(200).json({message: 'Consulta deletada com sucesso!'})
    }else{
        return res.status(401).json({message: 'Apenas o médico responsável pela consulta pode deletar!'})
    }
})

// Ver todas as consultas
router.get('getAppointment', authenticateToken, (req,res)=>{
    res.status(200).json(appointments)
})

// Pesquisar consultas por data
router.get('/getDateAppointment/:date', authenticateToken, (req, res)=>{
    const {date} = req.params
    for(let i=0; i<appointments.length; i++){
        if(date == appointments[i].date){
            return res.status(200).json(appointments[i])
        }else{
            return res.status(401).json({message: "Não existe consultas nessa data!"})
        }
    }
})

module.exports = router