// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes'); // Importação Correta

require('dotenv').config();

const app = express();

app.use(helmet()); //

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Melhor ser específico aqui ou usar a variável de ambiente
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // <<< AJUSTE AQUI: Adicionado PUT e OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'], // Bom adicionar cabeçalhos permitidos
  credentials: true // Pode ser útil, mesmo que não use cookies diretamente para JWT em header
};
app.use(cors(corsOptions)); //

app.use(express.json()); //

// Rotas de autenticação
app.use('/api/auth', authRoutes); //

// Rotas de eventos
app.use('/api/events', eventRoutes); //

// Rotas de usuários
app.use('/api/users', userRoutes); //

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI) //
  .then(() => console.log('MongoDB conectado com sucesso!')) //
  .catch((err) => console.error('Erro ao conectar MongoDB:', err)); //

// Rota simples de teste
app.get('/', (req, res) => { //
  res.send('API do Rachômetro rodando!'); //
});

// Middleware para capturar erros não tratados
app.use((err, req, res, next) => { //
  console.error(err.stack || err); // Mostra o stack trace para melhor depuração
  res.status(500).json({ message: 'Erro interno no servidor', error: err.message }); //
});

const PORT = process.env.PORT || 5000; //
app.listen(PORT, () => { //
  console.log(`Servidor rodando na porta ${PORT}`); //
});