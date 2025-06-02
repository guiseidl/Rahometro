const User = require('../models/User');

// Função para obter os dados do usuário logado
const getUser = async (req, res) => {
  try {
    // O middleware 'protect' já preencheu o objeto 'req.user' com o usuário autenticado
    if (!req.user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Retorna os dados do usuário, excluindo a senha
    res.json(req.user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao obter os dados do usuário' });
  }
};

module.exports = { getUser };

// Buscar usuários por nome
const searchUsers = async (req, res) => {
  try {
    const searchQuery = req.query.q || ''; // Pega o parâmetro 'q' da URL (ex: /api/users/search?q=Gui)

    if (!searchQuery.trim()) {
      return res.json([]); // Retorna array vazio se a busca for vazia ou só espaços
    }

    // Cria uma expressão regular para buscar nomes que comecem com o searchQuery (case-insensitive)
    const searchRegex = new RegExp('^' + searchQuery, 'i');

    // Busca usuários cujo nome corresponde à regex, limitando os resultados (ex: 10)
    // Seleciona apenas os campos que queremos retornar (id, name, email)
    const users = await User.find({ name: searchRegex })
                            .select('_id name email') // Evita enviar a senha e outros dados
                            .limit(10);

    res.json(users);

  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ message: 'Erro no servidor ao buscar usuários' });
  }
};

module.exports = { getUser, searchUsers }; 