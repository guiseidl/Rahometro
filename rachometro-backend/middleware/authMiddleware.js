const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // --- LOGS CRUCIAIS AQUI NO BACKEND ---
  console.log('\nBACKEND: === INÍCIO DO MIDDLEWARE protect ===');
  console.log('BACKEND: Requisição recebida. Headers:', req.headers);
  console.log('BACKEND: Header Authorization:', req.headers.authorization);
  // --- FIM DOS LOGS ---

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // --- LOGS CRUCIAIS AQUI NO BACKEND ---
      console.log('BACKEND: Token extraído (após split):', token ? token.substring(0, 10) + '...' : 'TOKEN VAZIO'); // Evita logar o token completo
      // --- FIM DOS LOGS ---

      if (!token) {
        console.log('BACKEND: ERRO: Token vazio após split. Status 401.');
        return res.status(401).json({ message: 'Token não fornecido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('BACKEND: Token decodificado:', decoded);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log('BACKEND: ERRO: Usuário não encontrado para o ID decodificado. Status 401.');
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      console.log('BACKEND: Usuário autenticado com sucesso:', req.user.email);
      next();
    } catch (error) {
      console.error('BACKEND: ERRO NO MIDDLEWARE protect (catch block):', error.message);
      if (error.name === 'TokenExpiredError') {
        console.log('BACKEND: Token expirado. Status 401.');
        return res.status(401).json({ message: 'Token expirado. Por favor, faça login novamente.' });
      } else if (error.name === 'JsonWebTokenError') {
        console.log('BACKEND: Token JWT inválido. Status 401.');
        return res.status(401).json({ message: 'Token inválido. Por favor, faça login novamente.' });
      }
      console.log('BACKEND: Erro inesperado na validação do token. Status 401.');
      return res.status(401).json({ message: 'Não autorizado, token falhou.' });
    }
  } else {
    console.log('BACKEND: ERRO: Header Authorization ausente ou malformado. Status 401.');
    return res.status(401).json({ message: 'Não autorizado, nenhum token de autenticação.' });
  }
};

module.exports = { protect };