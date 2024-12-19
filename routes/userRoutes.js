const express = require('express')
const jwt = require("jsonwebtoken")
const router = express.Router()
const path = require('path')
const { authenticateToken, admin } = require('../middlewares/auth')
const {validate} = require('../middlewares/validate')
const { paginate } = require('../utils/paginate')
const {read, write} = require('../utils/readAndWrite')
const {idGenerate} = require('../utils/idGenerate')
const {userSchema, updateUserSchema} = require('../schemas/userSchema')
const {patientSchema, updatePatientSchema} = require('../schemas/patientSchema')
const {appointmentSchema,updateAppointmentSchema} = require('../schemas/appointementSchema')

const usersFilePath = path.join(__dirname, '../data/users.json')
const patientsFilePath = path.join(__dirname, '../data/patients.json')
const appointmentsFilePath = path.join(__dirname, '../data/appointments.json')

// Rota install que cria um administrador
router.get('/install', async(req,res)=>{
    try {
        const users = await read(usersFilePath)
        const adminExist = users.filter(user => user.isAdmin == true)
        if(adminExist.length != 0){
            return res.status(400).json({ message: 'Ja existem administradores!' });
        }
        const admin = {
            id: idGenerate(users),
            name: "Dr. Roberto Costa",
            email: "roberto.costa@example.com",
            password: "senha123",
            crm: "123456-DF",
            phone: "61987654321",
            speciality: "Cardiologista",
            isAdmin: true
        }
        users.push(admin)
        await write(usersFilePath, users)
        res.status(200).json({message: 'Admin criado com sucesso'})
    } catch (error) {
        console.error('Erro ao criar admin:', error)
        res.status(500).json({message: 'Erro interno'})
    } 
})

// Rota de login
router.post('/login', async(req, res) => {
    try {
        const users = await read(usersFilePath)
        const { email, password } = req.body
        const user = users.find(user => user.email === email && user.password === password)
        if (!user) {
            return res.status(401).json({ message: 'Email ou senha incorretos!' })
        }
        const token = jwt.sign({ email: user.email, isAdmin: user.isAdmin, id: user.id }, process.env.SENHA , { expiresIn: '30m' })
        res.status(200).json({ message: 'Login feito com sucesso', token })
    } catch (error) {
        console.error('Erro ao criar admin:', error)
        res.status(500).json({message: 'Erro interno'})
    }
});

//====================USERS==========================//

// Rota prar criar usuários (somente admin pode criar)
router.post('/createUser', authenticateToken, admin, validate(userSchema), async(req, res) => {
    try {
        const users = await read(usersFilePath)
        const { name, email, password, crm, phone, speciality} = req.body
        if(users.some(user=> user.email === email)){
            return res.status(400).json({message: 'Usuario ja cadastrado'})
        }
        const newUser = { id: idGenerate(users), name, email, password, crm, phone, speciality, isAdmin: false }
        users.push(newUser)
        await write(usersFilePath, users)
        res.status(201).json([{ message: 'Usuário cadastrado' }, { newUser }])
    } catch (error) {
        console.error('Erro ao criar usuario:', error)
        res.status(500).json({message: 'Erro interno'})
    }
});

// Rota para criar admins (somente admin pode criar)
router.post('/createAdmin', authenticateToken, admin, validate(userSchema), async(req, res) => {
    try {
        const users = await read(usersFilePath)
        const { name, email, password, crm, phone, speciality} = req.body
        if(users.some(user=> user.email === email)){
            return res.status(400).json({message: 'Usuario ja cadastrado'})
        }
        const newAdmin = { id: idGenerate(users), name, email, password, crm, phone, speciality, isAdmin: true }
        users.push(newAdmin)
        await write(usersFilePath, users)
        res.status(201).json([{ message: 'Usuário cadastrado' }, { newAdmin }])
    } catch (error) {
        console.error('Erro ao criar admin:', error)
        res.status(500).json({message: 'Erro interno'})
    }
});

// Rota para alterar dados dos usuario (admin podem alterar qualquer usuario)
router.put('/updateUser/:id', authenticateToken, validate(updateUserSchema), async(req,res)=>{
    try {
        const users = await read(usersFilePath)
        const { id } = req.params
        const { name, email, password, crm, phone, speciality, isAdmin } = req.body
        const index = users.findIndex(user => user.id == id)
        if (index === -1) {
            return res.status(404).json({ message: 'Usuário não encontrado!' })
        }
        if(req.user.isAdmin){
            users[index] = {...users[index], 
                name: name || users[index].name,
                email: email || users[index].email,
                password: password || users[index].password,
                crm: crm || users[index].crm,
                phone: phone || users[index].phone,
                speciality: speciality || users[index].speciality,
                isAdmin: isAdmin !== undefined ? isAdmin : users[index].isAdmin}
            await write(usersFilePath, users)
            return res.status(200).json({message: 'Usuario alterado com sucesso'})
        }
        if(req.user.email === users[index].email){
            users[index] = {...users[index], ...users[index], 
                name: name || users[index].name,
                email: email || users[index].email,
                password: password || users[index].password,
                crm: crm || users[index].crm,
                phone: phone || users[index].phone,
                speciality: speciality || users[index].speciality}
            await write(usersFilePath, users)
            res.status(200).json({message: 'Usuario alterado com sucesso'})
        }  
        res.status(403).json({ message: 'Acesso negado: Você só pode alterar seus próprios dados!' });
    } catch (error) {
        console.error('Erro ao atualizar dados do usuario:', error)
        res.status(500).json({message: 'Erro interno'})
    }      
})

// Rota para deletar usuários (somente admin pode deletar)
router.delete('/delUser/:id', authenticateToken, admin, async(req, res) => {
    try {
        const users = await read(usersFilePath)
        const { id } = req.params
        const userIndex = users.findIndex(user => user.id == id)
        if (userIndex === -1) {
            return res.status(401).json({ message: "Usuário não existe!" })
        }
        if(users[userIndex].isAdmin === false){
            users.splice(userIndex, 1)
            await write(usersFilePath, users)
            return res.status(200).json({ message: "Usuário deletado" })
        }else{
            return res.status(401).json({ message: "Usuário é um adminstrador, portanto não pode ser excluido!" })
        }  
    } catch (error) {
        console.error('Erro ao deletar usuario:', error)
        res.status(500).json({message: 'Erro interno'})
    }   
});

// Rota para ver todos os usuários
router.get('/getUsers', authenticateToken, async(req, res) => {
    try {
        const users = await read(usersFilePath)
        const {limit, page} = req.query
        const showUsers = paginate(users, limit, page)
        res.status(200).json(showUsers)
    } catch (error) {
        console.error('Erro ao listar usuarios:', error)
        res.status(500).json({message: 'Erro interno'})
    }   
});

// Rota para pesquisar por especialidade
router.get('/getSpeciality/:speciality', authenticateToken, async(req, res)=>{
    try {
        const users = await read(usersFilePath)
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
    } catch (error) {
        console.error('Erro ao buscar por especialidade:', error)
        res.status(500).json({message: 'Erro interno'})
    }   
})

//================PATIENTS=======================//

// Criar pacientes
router.post('/createPatient', authenticateToken, validate(patientSchema), async(req, res)=>{
    try {
        const patients = await read(patientsFilePath)
        const {name, cpf, birthDate, phone} = req.body
        const newPatient = {id: idGenerate(patients), name, cpf, birthDate, phone}
        if(patients.some(patients=> patients.cpf === cpf)){
            return res.status(400).json({message: 'Paciente ja cadastrado'})
        }
        patients.push(newPatient)
        await write(patientsFilePath, patients)
        res.status(201).json([{message: 'Paciente Cadastrado'}, {newPatient}])
    } catch (error) {
        console.error('Erro ao criar paciente:', error)
        res.status(500).json({message: 'Erro interno'})
    }      
})

// Atualiza dados do paciente
router.put('/updatePatient/:id', authenticateToken, validate(updatePatientSchema), async(req,res)=>{
    try {
        const patients = await read(patientsFilePath)
        const {id} = req.params
        const {name, birthDate, phone} = req.body
        const index = patients.findIndex(patient => patient.id == id)
        if(index === -1){
            return res.status(404).json({ message: 'Paciente não encontrado!' })
        }
        patients[index] = {
            ...patients[index],
            name: name || patients[index].name,
            birthDate: birthDate || patients[index].birthDate,
            phone: phone || patients[index].phone
        }
        await write(patientsFilePath, patients)
        res.status(200).json({message: 'Dados do pacientes atualizados com sucesso!'})
    } catch (error) {
        console.error('Erro ao atualizar paciente:', error)
        res.status(500).json({message: 'Erro interno'})
    }  
})

// Deleta pacientes
router.delete('/deletePatient/:id', authenticateToken, async(req,res)=>{
    try {
        const patients = await read(patientsFilePath)
        const {id} = req.params
        const index = patients.findIndex(patient => patient.id == id)
        if(index === -1){
            return res.status(404).json({ message: 'Paciente não encontrado!' })
        }
        patients.splice(index,1)
        await write(patientsFilePath, patients)
        res.status(200).json({message: 'Paciente deletado com sucesso!'})
    } catch (error) {
        console.error('Erro ao deletar paciente:', error)
        res.status(500).json({message: 'Erro interno'})
    }
})

// Ver todos os pacientes
router.get('/getAllPatient', authenticateToken, async(req,res)=>{
    try {
        const patients = await read(patientsFilePath)
        const {limit, page} = req.query
        const showPatients = paginate(patients, limit, page)
        res.status(200).json(showPatients)
    } catch (error) {
        console.error('Erro ao listar pacientes:', error)
        res.status(500).json({message: 'Erro interno'})
    }     
})

// Pesquisar paciente por nome
router.get('/getPatientName/:name', authenticateToken, async(req,res)=>{
    try {
        const patients = await read(patientsFilePath)
        const {name} = req.params
        const namePatients = patients.filter(patient => patient.name.toLowerCase().includes(name.toLowerCase()))
        if(namePatients.length === 0){
            return res.status(404).json({message: "Não existe nenhum paciente com esse nome!"})
        }
        const {limit, page} = req.query
        const showPatients = paginate(namePatients, limit, page)
        res.status(200).json(showPatients)
    } catch (error) {
        console.error('Erro ao buscar paciente por nome:', error)
        res.status(500).json({message: 'Erro interno'})
    }
})

//=============APPOINTEMENTS=====================//

// Cria uma nova consulta
router.post('/createAppointement', authenticateToken, validate(appointmentSchema), async(req,res)=>{
    try {
        const appointments = await read(appointmentsFilePath)
        const users = await read(usersFilePath)
        const patients = await read(patientsFilePath)
        const {idDoctor, idPatient, date, time, reason} = req.body
        const doctorExists = users.some(user => user.id === idDoctor)
        const patientExists = patients.some(patient => patient.id === idPatient)
        if (!doctorExists || !patientExists) {
            return res.status(404).json({message: 'Médico ou paciente não encontrado'})
        }
        const newAppointment = {id: idGenerate(appointments), idDoctor, idPatient, date, time, reason}
        appointments.push(newAppointment)
        await write(appointmentsFilePath, appointments)
        res.status(200).json({message: 'Consulta marcada com sucesso!'})
    } catch (error) {
        console.error('Erro ao criar consulta:', error)
        res.status(500).json({message: 'Erro interno'})
    }
})

// Atualiza os dados da consulta
router.put('/updateAppointment/:id', authenticateToken, validate(updateAppointmentSchema), async(req,res)=>{
    try {
        const appointments = await read(appointmentsFilePath)
        const users = await read(usersFilePath)
        const patients = await read(patientsFilePath)
        const {id} = req.params
        const index = appointments.findIndex(appointment => appointment.id == id)
        if(index === -1){
            return res.status(404).json({ message: 'Consulta não encontrada!' })
        }
        const {idDoctor, idPatient, date, time, reason} = req.body
        /*const doctorExists = users.some(user => user.id === idDoctor)
        const patientExists = patients.some(patient => patient.id === idPatient)
        if (!doctorExists || !patientExists) {
            return res.status(404).json({message: 'Médico ou paciente não encontrado'})
        }*/
        if(req.user.id == appointments[index].idDoctor){
            appointments[index] = {
                ...appointments[index], 
                idDoctor: idDoctor || appointments[index].idDoctor, 
                idPatient: idPatient || appointments[index].idPatient, 
                date: date || appointments[index].date, 
                time: time || appointments[index].time, 
                reason: reason || appointments[index].reason}
            await write(appointmentsFilePath, appointments)
            return res.status(200).json({message: 'Consulta atualizada com sucesso!'})
        }else{
            return res.status(401).json({message: 'Apenas o médico responsável pela consulta pode alterar os dados!'})
        }
    } catch (error) {
        console.error('Erro ao atualizar consulta:', error)
        res.status(500).json({message: 'Erro interno'})
    }
    
    
})

// Deleta uma consulta
router.delete('/deleteAppointment/:id', authenticateToken, async(req,res)=>{
    try {
        const appointments = await read(appointmentsFilePath)
        const {id} = req.params
        const index = appointments.findIndex(appointment => appointment.id == id)
        if(index === -1){
            return res.status(404).json({ message: 'Consulta não encontrada!' })
        }
        if(req.user.id == appointments[index].idDoctor){
            appointments.splice(index, 1)
            await write(appointmentsFilePath, appointments)
            return res.status(200).json({message: 'Consulta deletada com sucesso!'})
        }else{
            return res.status(401).json({message: 'Apenas o médico responsável pela consulta pode deletar!'})
        }
    } catch (error) {
        console.error('Erro ao deletar consulta:', error)
        res.status(500).json({message: 'Erro interno'})
    }
    
})

// Ver todas as consultas
router.get('/getAppointment', authenticateToken, async(req,res)=>{ 
    try {
        const appointments = await read(appointmentsFilePath)
        const {limit, page} = req.query
        const showAppointments = paginate(appointments, limit, page)
        res.status(200).json(showAppointments)
    } catch (error) {
        console.error('Erro ao listas consultas:', error)
        res.status(500).json({message: 'Erro interno'})
    }     
})

// Pesquisar consultas por data
router.get('/getDateAppointment/:date', authenticateToken, async(req, res)=>{
    try {
        const appointments = await read(appointmentsFilePath)
        const {date} = req.params
        const appointmentsDate = appointments.filter(appointments => appointments.date == date)
        if(appointmentsDate.length === 0){
            return res.status(401).json({message: "Não existe consultas nessa data!"})
        }
        const {limit, page} = req.query
        const showAppointments = paginate(appointmentsDate, limit, page)
        res.status(200).json(showAppointments)
    } catch (error) {
        console.error('Erro ao buscar consultas por data:', error)
        res.status(500).json({message: 'Erro interno'})
    }  
})

module.exports = router