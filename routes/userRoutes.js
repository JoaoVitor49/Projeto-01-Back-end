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

    const token = jwt.sign({ email: user.email, isAdmin: user.isAdmin }, "123@abc#", { expiresIn: '10m' })
    res.status(200).json({ message: 'Login feito com sucesso', token })
});

// Criar usuários (somente admin pode criar)
router.post('/createUser', authenticateToken, admin, (req, res) => {
    const { name, email, password, crm, phone, specialty, isAdmin } = req.body
    const newUser = { id, name, email, password, crm, phone, specialty, isAdmin }
    users.push(newUser)
    id++
    res.status(201).json([{ message: 'Usuário cadastrado' }, { newUser }])
});

router.put('/updateUser/:id', authenticateToken, admin, (req,res)=>{
    const { id } = req.params
    const { name, email, password, crm, phone, specialty, isAdmin } = req.body
    const index = users.findIndex(user => user.id == id)
    if (index === -1) {
        return res.status(404).json({ message: 'Usuário não encontrado!' })
    }
    users[index] = {id, name: name, email: email, password: password, crm: crm, phone:phone, specialty:specialty, isAdmin: isAdmin}
    res.status(200).json({message: 'Usuario alterado com sucesso'})
    
})

// Deletar usuários (somente admin pode deletar)
router.delete('/delUser', authenticateToken, admin, (req, res) => {
    const { crm } = req.body
    const userIndex = users.findIndex(user => user.crm === crm)

    if (userIndex === -1) {
        return res.status(401).json({ message: "Usuário não existe!" })
    }

    users.splice(userIndex, 1)
    res.status(200).json({ message: "Usuário deletado" })
});

// Ver todos os usuários
router.get('/getUsers', authenticateToken, (req, res) => {
    res.status(200).json(users)
});

module.exports = router