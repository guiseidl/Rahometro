const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Função para gerar o token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Função de registro
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Verifica se o usuário já existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Cria um novo usuário
    user = new User({
      name,
      email,
      password,  // A senha será criptografada no middleware do User.js
      role,
    });

    // Salva o usuário no banco de dados
    await user.save();

    // Gera o token JWT
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Função de login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Comparar a senha fornecida com a senha armazenada (hashed)
    const isMatch = await user.matchPassword(password);  // Usando o método de comparação do User.js

    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Gerar o token JWT
    const token = generateToken(user._id);

    // Retornar os dados do usuário com o token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};
