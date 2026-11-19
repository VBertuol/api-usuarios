// Ponto de entrada da Serverless Function na Vercel.
// Exporta o app Express como handler (req, res).
const app = require('../server.js')
module.exports = app
