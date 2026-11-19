const { Pool } = require('pg')
require('dotenv').config()

const isProduction = process.env.NODE_ENV === 'production'

if (!process.env.DATABASE_URL) {
    console.warn('AVISO: DATABASE_URL não definida. Defina-a no .env ou nas variáveis da Vercel.')
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction
        ? { rejectUnauthorized: false }
        : false,
    max: isProduction ? 3 : 20,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 3000,
})

pool.on('connect', () => {
    console.log('Conexão estabelecida com o banco de dados')
})

pool.on('error', (err) => {
    console.error('Erro em conexão ociosa do pool (a conexão será descartada):', err.message)
})

const query = (text, params) => pool.query(text, params)
const obterCliente = () => pool.connect()

const transacao = async (operacoes) => {
    const cliente = await pool.connect()
    try {
        await cliente.query('BEGIN')
        const resultado = await operacoes(cliente)
        await cliente.query('COMMIT')
        return resultado
    } catch (error) {
        await cliente.query('ROLLBACK')
        throw error
    } finally {
        cliente.release()
    }
}

module.exports = { query, obterCliente, transacao }