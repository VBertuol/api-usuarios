const jwt = require('jsonwebtoken')

const autenticar = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token de autenticação não fornecido',
        })
    }

    const partes = authHeader.split(' ')

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Formato do token inválido. Use: Authorization: Bearer <token>',
        })
    }

    const token = partes[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = payload
        return next()
    } catch (error) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token inválido ou expirado',
        })
    }
}

module.exports = autenticar