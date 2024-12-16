const express = require('express')
const jwt = require("jsonwebtoken")
const router = express.Router()
const { authenticateToken, admin } = require('../middlewares/auth')
const { paginate } = require('../utils/paginação')

const users = []
const patients = []
const appointments = []

let idPatient = 1
let idDoctor = 2
let idAppointment = 1

router.get('/install', (req,res)=>{
    const adminExist = users.filter(user => user.isAdmin == true)
    if(adminExist.length != 0){
        return res.status(400).json({ message: 'Ja existem administradores!' });
    }
    const admin = {
        id: 1,
        name: "Dr. Roberto Costa",
        email: "roberto.costa@example.com",
        password: "senha123",
        crm: "123456-DF",
        phone: "61987654321",
        speciality: "Cardiologista",
        isAdmin: true
    }
    users.push(admin)
    res.status(200).json({message: 'Admin criado com sucesso'})
})

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
    const { name, email, password, crm, phone, speciality} = req.body
    const newUser = { idDoctor, name, email, password, crm, phone, speciality, isAdmin: false }
    users.push(newUser)
    idDoctor++
    res.status(201).json([{ message: 'Usuário cadastrado' }, { newUser }])
});

// Criar admins (somente admin pode criar)
router.post('/createAdmin', authenticateToken, admin, (req, res) => {
    const { name, email, password, crm, phone, speciality} = req.body
    const newAdmin = { idDoctor, name, email, password, crm, phone, speciality, isAdmin: true }
    users.push(newAdmin)
    idDoctor++
    res.status(201).json([{ message: 'Usuário cadastrado' }, { newAdmin }])
});

// Alterar dados dos usuario (admin podem alterar qualquer usuario)
router.put('/updateUser/:id', authenticateToken, (req,res)=>{
    const { id } = req.params
    const { name, email, password, crm, phone, speciality, isAdmin } = req.body
    const index = users.findIndex(user => user.idDoctor == id)
    if (index === -1) {
        return res.status(404).json({ message: 'Usuário não encontrado!' })
    }
    if(req.user.isAdmin){
        users[index] = {...users[index], idDoctor, name: name, email: email, password: password, crm: crm, phone:phone, speciality:speciality, isAdmin: isAdmin}
        return res.status(200).json({message: 'Usuario alterado com sucesso'})
    }
    if(req.user.email === users[index].email){
        users[index] = {...users[index], idDoctor, name: name, email: email, password: password, crm: crm, phone:phone, speciality:speciality}
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
    try {
        const {limit, page} = req.query
        const showUsers = paginate(users, limit, page)
        res.status(200).json(showUsers)
    } catch (error) {
        res.status(400).json({message: error.message})
    }   
});

// Pesquisar através de especialidade
router.get('/getSpeciality/:speciality', authenticateToken, (req, res)=>{
    const {speciality} = req.params
    const specialityUsers = users.filter(user => user.speciality == speciality)
    if(specialityUsers.length === 0){
        return res.status(401).json({message: "Nenhum médico tem essa especialidade!"})
    }
    try {
        const {limit, page} = req.query
        const showUsers = paginate(specialityUsers, limit, page)
        res.status(200).json(showUsers)
    } catch (error) {
        res.status(400).json({message: error.message})
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
router.delete('/deletePatient/:id', authenticateToken, (req,res)=>{
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
    try {
        const {limit, page} = req.query
        const showPatients = paginate(patients, limit, page)
        res.status(200).json(showPatients)
    } catch (error) {
        res.status(400).json({message: error.message})
    }     
})

// Pesquisar paciente por nome
router.get('/getPatientName/:name', authenticateToken, (req,res)=>{
    const {name} = req.params
    const namePatients = patients.filter(patient => patient.name == name)
    if(namePatients.length === 0){
        return res.status(404).json({message: "Não existe nenhum paciente com esse nome!"})
    }
    try {
        const {limit, page} = req.query
        const showPatients = paginate(namePatients, limit, page)
        res.status(200).json(showPatients)
    } catch (error) {
        res.status(400).json({message: error.message})
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
router.get('/getAppointment', authenticateToken, (req,res)=>{ 
    try {
        const {limit, page} = req.query
        const showAppointments = paginate(appointments, limit, page)
        res.status(200).json(showAppointments)
    } catch (error) {
        res.status(400).json({message: error.message})
    }     
})

// Pesquisar consultas por data
router.get('/getDateAppointment/:date', authenticateToken, (req, res)=>{
    const {date} = req.params
    const appointmentsDate = appointments.filter(appointments => appointments.date == date)
    if(appointmentsDate.length === 0){
        return res.status(401).json({message: "Não existe consultas nessa data!"})
    }
    try {
        const {limit, page} = req.query
        const showAppointments = paginate(appointmentsDate, limit, page)
        res.status(200).json(showAppointments)
    } catch (error) {
        res.status(400).json({message: error.message})
    }     
})

module.exports = router