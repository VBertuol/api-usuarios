const express = require('express')
const cors = require('cors')
require('dotenv').config()

const usuariosRoutes = require('./src/routes/usuarioRoutes')

const app = express()
const PORT = process.env.PORT || 3000

app.set('trust proxy', 1)

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    next()
})

app.get('/saude', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
    })
})

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API de Usuários funcionando!',
        versao: '1.0.0',
        endpoints: {
            cadastro: 'POST /api/usuarios/cadastro',
            login: 'POST /api/usuarios/login',
            listar: 'GET /api/usuarios (autenticado)',
            buscarPorId: 'GET /api/usuarios/:id (autenticado)',
            atualizar: 'PUT /api/usuarios/:id (autenticado)',
            deletar: 'DELETE /api/usuarios/:id (autenticado)',
        },
    })
})

app.use('/api/usuarios', usuariosRoutes)

app.use((req, res) => {
    res.status(404).json({
        sucesso: false,
        mensagem: 'Endpoint não encontrado',
        rota: req.url,
    })
})

app.use((err, req, res, next) => {
    console.error('Erro interno do servidor:', err)
    res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor',
        erro: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Por favor, tente novamente mais tarde.',
    })
})

// Na Vercel não existe app.listen(): o app é exportado. Na máquina, roda com node server.js
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
        - Servidor rodando na porta ${PORT}
        - API de Usuários
        - http://localhost:${PORT}
    `)
    })
}

process.on('unhandledRejection', (err) => {
    console.error('Rejeição não tratada:', err)
    process.exit(1)
})

module.exports = app
