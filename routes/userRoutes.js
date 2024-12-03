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

let id = 2

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body
    const user = users.find(user => user.email === email && user.password === password)
    if (!user) {
        return res.status(401).json({ message: 'Email ou senha incorretos!' })
    }
    const token = jwt.sign({ email: user.email, isAdmin: user.isAdmin }, "123@abc#", { expiresIn: '30m' })
    res.status(200).json({ message: 'Login feito com sucesso', token })
});

// Criar usuários (somente admin pode criar)
router.post('/createUser', authenticateToken, admin, (req, res) => {
    const { name, email, password, crm, phone, specialty} = req.body
    const newUser = { id, name, email, password, crm, phone, specialty, isAdmin: false }
    users.push(newUser)
    id++
    res.status(201).json([{ message: 'Usuário cadastrado' }, { newUser }])
});

// Criar admins (somente admin pode criar)
router.post('/createAdmin', authenticateToken, admin, (req, res) => {
    const { name, email, password, crm, phone, specialty} = req.body
    const newAdmin = { id, name, email, password, crm, phone, specialty, isAdmin: true }
    users.push(newAdmin)
    id++
    res.status(201).json([{ message: 'Usuário cadastrado' }, { newAdmin }])
});

// Alterar usuario (admin podem alterar qualquer usuario)
router.put('/updateUser/:id', authenticateToken, (req,res)=>{
    const { id } = req.params
    const { name, email, password, crm, phone, specialty, isAdmin } = req.body
    const index = users.findIndex(user => user.id == id)
    if (index === -1) {
        return res.status(404).json({ message: 'Usuário não encontrado!' })
    }
    if(req.user.isAdmin){
        users[index] = {...users[index], id, name: name, email: email, password: password, crm: crm, phone:phone, specialty:specialty, isAdmin: isAdmin}
        return res.status(200).json({message: 'Usuario alterado com sucesso'})
    }
    if(req.user.email === users[index].email){
        users[index] = {...users[index], id, name: name, email: email, password: password, crm: crm, phone:phone, specialty:specialty}
        res.status(200).json({message: 'Usuario alterado com sucesso'})
    }  
    res.status(403).json({ message: 'Acesso negado: Você só pode alterar seus próprios dados!' });   
})

// Deletar usuários (somente admin pode deletar)
router.delete('/delUser/:id', authenticateToken, admin, (req, res) => {
    const { id } = req.params
    const userIndex = users.findIndex(user => user.id == id)
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

module.exports = router