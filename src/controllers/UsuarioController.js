const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UsuarioModel = require('../models/UsuarioModel')

const {
    responderRequisicaoInvalida,
    responderNaoEncontrado,
    responderNaoAutorizado,
    responderErroInterno,
} = require('../utils/respostas')

const SALT_ROUNDS = 10
const JWT_EXPIRACAO = '1h'

class UsuarioController {

    static async cadastrar(req, res) {
        try {
            const { nome, sobrenome, email, usuario, senha } = req.body

            if (!nome || nome.trim() === '') {
                return responderRequisicaoInvalida(res, 'O nome é obrigatório')
            }
            if (!sobrenome || sobrenome.trim() === '') {
                return responderRequisicaoInvalida(res, 'O sobrenome é obrigatório')
            }
            if (!email || email.trim() === '') {
                return responderRequisicaoInvalida(res, 'O email é obrigatório')
            }
            if (!usuario || usuario.trim() === '') {
                return responderRequisicaoInvalida(res, 'O usuário é obrigatório')
            }
            if (!senha || senha.length < 6) {
                return responderRequisicaoInvalida(res, 'A senha deve ter pelo menos 6 caracteres')
            }

            const emailNormalizado = email.trim().toLowerCase()
            const usuarioNormalizado = usuario.trim()

            const emailJaExiste = await UsuarioModel.buscarPorEmail(emailNormalizado)
            if (emailJaExiste) {
                return responderRequisicaoInvalida(res, 'Email já cadastrado')
            }

            const usuarioJaExiste = await UsuarioModel.buscarPorUsuario(usuarioNormalizado)
            if (usuarioJaExiste) {
                return responderRequisicaoInvalida(res, 'Nome de usuário já cadastrado')
            }

            const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS)

            const novoUsuario = await UsuarioModel.criar({
                nome: nome.trim(),
                sobrenome: sobrenome.trim(),
                email: emailNormalizado,
                usuario: usuarioNormalizado,
                senha: senhaHash,
            })

            return res.status(201).json({
                sucesso: true,
                mensagem: 'Usuário cadastrado com sucesso',
                dados: novoUsuario,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao cadastrar usuário', error)
        }
    }

    static async login(req, res) {
        try {
            const { email, usuario, senha } = req.body

            if ((!email && !usuario) || !senha) {
                return responderRequisicaoInvalida(
                    res,
                    'Informe "email" (ou "usuario") e "senha" para fazer login'
                )
            }

            let usuarioEncontrado = null

            if (email) {
                usuarioEncontrado = await UsuarioModel.buscarPorEmailComSenha(
                    email.trim().toLowerCase()
                )
            } else {
                usuarioEncontrado = await UsuarioModel.buscarPorUsuarioComSenha(usuario.trim())
            }

            if (!usuarioEncontrado) {
                return responderNaoAutorizado(res, 'Credenciais inválidas')
            }

            if (!usuarioEncontrado.ativo) {
                return responderNaoAutorizado(res, 'Usuário inativo')
            }

            const senhaConfere = await bcrypt.compare(senha, usuarioEncontrado.senha)
            if (!senhaConfere) {
                return responderNaoAutorizado(res, 'Credenciais inválidas')
            }

            const token = jwt.sign(
                {
                    id: usuarioEncontrado.id,
                    email: usuarioEncontrado.email,
                    usuario: usuarioEncontrado.usuario,
                },
                process.env.JWT_SECRET,
                { expiresIn: JWT_EXPIRACAO }
            )

            const { senha: _omitida, ...usuarioSemSenha } = usuarioEncontrado

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Login realizado com sucesso',
                dados: {
                    usuario: usuarioSemSenha,
                    token,
                },
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao fazer login', error)
        }
    }

    static async listarTodos(req, res) {
        try {
            const usuarios = await UsuarioModel.listarTodos()

            return res.status(200).json({
                sucesso: true,
                quantidade: usuarios.length,
                dados: usuarios,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao listar usuários', error)
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params

            if (!id || isNaN(id)) {
                return responderRequisicaoInvalida(res, 'ID inválido')
            }

            const usuario = await UsuarioModel.buscarPorId(id)

            if (!usuario) {
                return responderNaoEncontrado(res, 'Usuário não encontrado')
            }

            return res.status(200).json({
                sucesso: true,
                dados: usuario,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao buscar usuário', error)
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params
            const { nome, sobrenome, email, usuario, senha, ativo } = req.body

            if (!id || isNaN(id)) {
                return responderRequisicaoInvalida(res, 'ID inválido')
            }

            const usuarioExiste = await UsuarioModel.buscarPorId(id)
            if (!usuarioExiste) {
                return responderNaoEncontrado(res, 'Usuário não encontrado')
            }

            if (email) {
                const emailNormalizado = email.trim().toLowerCase()
                const outro = await UsuarioModel.buscarPorEmail(emailNormalizado)
                if (outro && String(outro.id) !== String(id)) {
                    return responderRequisicaoInvalida(res, 'Email já cadastrado por outro usuário')
                }
            }

            if (usuario) {
                const usuarioNormalizado = usuario.trim()
                const outro = await UsuarioModel.buscarPorUsuario(usuarioNormalizado)
                if (outro && String(outro.id) !== String(id)) {
                    return responderRequisicaoInvalida(res, 'Nome de usuário já cadastrado')
                }
            }

            let senhaHash = null
            if (senha) {
                if (senha.length < 6) {
                    return responderRequisicaoInvalida(res, 'A senha deve ter pelo menos 6 caracteres')
                }
                senhaHash = await bcrypt.hash(senha, SALT_ROUNDS)
            }

            const usuarioAtualizado = await UsuarioModel.atualizar(id, {
                nome: nome?.trim(),
                sobrenome: sobrenome?.trim(),
                email: email?.trim().toLowerCase(),
                usuario: usuario?.trim(),
                senha: senhaHash,
                ativo: typeof ativo === 'boolean' ? ativo : undefined,
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Usuário atualizado com sucesso',
                dados: usuarioAtualizado,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao atualizar usuário', error)
        }
    }

    static async deletar(req, res) {
        try {
            const { id } = req.params

            if (!id || isNaN(id)) {
                return responderRequisicaoInvalida(res, 'ID inválido')
            }

            const deletado = await UsuarioModel.deletar(id)

            if (!deletado) {
                return responderNaoEncontrado(res, 'Usuário não encontrado')
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Usuário deletado com sucesso',
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao deletar usuário', error)
        }
    }
}

module.exports = UsuarioController