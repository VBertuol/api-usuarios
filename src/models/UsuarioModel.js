const pool = require('../config/database')

const CAMPOS_PUBLICOS = 'id, nome, sobrenome, email, usuario, ativo, created_at, updated_at'

class UsuarioModel {

    static async criar({ nome, sobrenome, email, usuario, senha }) {
        try {
            const query = `
                INSERT INTO app.usuarios (nome, sobrenome, email, usuario, senha)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING ${CAMPOS_PUBLICOS}
            `
            const values = [nome, sobrenome, email, usuario, senha]
            const result = await pool.query(query, values)
            return result.rows[0]
        } catch (error) {
            throw new Error(`Erro ao criar usuário: ${error.message}`)
        }
    }

    static async listarTodos() {
        try {
            const query = `SELECT ${CAMPOS_PUBLICOS} FROM app.usuarios ORDER BY created_at DESC`
            const result = await pool.query(query)
            return result.rows
        } catch (error) {
            throw new Error(`Erro ao listar usuários: ${error.message}`)
        }
    }

    static async buscarPorId(id) {
        try {
            const query = `SELECT ${CAMPOS_PUBLICOS} FROM app.usuarios WHERE id = $1`
            const result = await pool.query(query, [id])
            return result.rows[0] || null
        } catch (error) {
            throw new Error(`Erro ao buscar usuário por ID: ${error.message}`)
        }
    }

    static async buscarPorEmail(email) {
        try {
            const query = `SELECT ${CAMPOS_PUBLICOS} FROM app.usuarios WHERE email = $1`
            const result = await pool.query(query, [email])
            return result.rows[0] || null
        } catch (error) {
            throw new Error(`Erro ao buscar usuário por email: ${error.message}`)
        }
    }

    static async buscarPorUsuario(usuario) {
        try {
            const query = `SELECT ${CAMPOS_PUBLICOS} FROM app.usuarios WHERE usuario = $1`
            const result = await pool.query(query, [usuario])
            return result.rows[0] || null
        } catch (error) {
            throw new Error(`Erro ao buscar usuário por nome de usuário: ${error.message}`)
        }
    }

    static async buscarPorEmailComSenha(email) {
        try {
            const query = 'SELECT * FROM app.usuarios WHERE email = $1'
            const result = await pool.query(query, [email])
            return result.rows[0] || null
        } catch (error) {
            throw new Error(`Erro ao buscar usuário para login: ${error.message}`)
        }
    }

    static async buscarPorUsuarioComSenha(usuario) {
        try {
            const query = 'SELECT * FROM app.usuarios WHERE usuario = $1'
            const result = await pool.query(query, [usuario])
            return result.rows[0] || null
        } catch (error) {
            throw new Error(`Erro ao buscar usuário para login: ${error.message}`)
        }
    }

    static async atualizar(id, dados) {
        try {
            const { nome, sobrenome, email, usuario, senha, ativo } = dados

            const query = `
                UPDATE app.usuarios
                SET nome       = COALESCE($1, nome),
                    sobrenome  = COALESCE($2, sobrenome),
                    email      = COALESCE($3, email),
                    usuario    = COALESCE($4, usuario),
                    senha      = COALESCE($5, senha),
                    ativo      = COALESCE($6, ativo),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7
                RETURNING ${CAMPOS_PUBLICOS}
            `
            const values = [nome, sobrenome, email, usuario, senha, ativo, id]
            const result = await pool.query(query, values)
            return result.rows[0] || null
        } catch (error) {
            throw new Error(`Erro ao atualizar usuário: ${error.message}`)
        }
    }

    static async deletar(id) {
        try {
            const query = 'DELETE FROM app.usuarios WHERE id = $1 RETURNING id'
            const result = await pool.query(query, [id])
            return result.rowCount > 0
        } catch (error) {
            throw new Error(`Erro ao deletar usuário: ${error.message}`)
        }
    }
}

module.exports = UsuarioModel