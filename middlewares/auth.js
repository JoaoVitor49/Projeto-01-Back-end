const jwt = require("jsonwebtoken")
const SENHA = "123@abc#"

//autenticação de token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    if (!token) return res.status(401).json({ message: 'Acesso negado: Token não fornecido' })

    try {
        const decoded = jwt.verify(token, SENHA)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(403).json({ message: 'Token inválido ou expirado' })
    }
}

//verificar se o usuário é administrador
function admin(req, res, next) {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Acesso negado: Apenas admins tem acesso' })
    }
    next();
}

module.exports = { authenticateToken, admin }