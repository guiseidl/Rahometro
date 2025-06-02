const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getUser, searchUsers } = require('../controllers/userController'); // Importe searchUsers
const router = express.Router();

// Rota protegida para obter o usuário logado
router.get('/me', protect, getUser);  // Verifique se a rota está correta
router.get('/search', protect, searchUsers);

module.exports = router;
