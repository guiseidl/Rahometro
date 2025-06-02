const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  addParticipant,
  addExpense,
  updatePaymentStatus,
  payExpense,
  unpayExpense,
  updateEvent,
  deleteEvent,
  getSingleEvent,
  setParticipantPaymentAsPaid, 
  setParticipantPaymentAsUnpaid,
  removeParticipantFromEvent,
  removeExpenseFromEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { body, param, validationResult } = require('express-validator');

// Middleware de autenticação para proteger TODAS as rotas de evento abaixo
router.use(protect);

// Criar evento (SOMENTE ADMIN)
router.post(
  '/',
  admin, // Middleware de admin específico para esta rota
  [
    body('name').notEmpty().withMessage('Nome do evento é obrigatório'),
    body('date').isDate().withMessage('Data do evento é obrigatória e deve ser uma data válida'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createEvent
);

// Excluir um participante de um evento específico (SOMENTE ADMIN)
router.delete(
  '/:eventId/participants/:participantId', // :participantId aqui é o userId
  admin, // Middleware de admin específico para esta rota
  [                                    
    param('eventId').isMongoId().withMessage('ID de evento inválido na URL.'),
    param('participantId').isMongoId().withMessage('ID de usuário (participante) inválido na URL.')
  ],
  (req, res, next) => { 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); 
  },
  removeParticipantFromEvent               
);

// Adicionar participante a um evento (SOMENTE ADMIN)
router.post(
  '/:eventId/participants',
  admin, // Middleware de admin específico para esta rota
  [
    param('eventId').isMongoId().withMessage('ID de evento inválido'),
    body('name').notEmpty().withMessage('Nome do participante é obrigatório')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); 
  },
  addParticipant 
);

// Adicionar despesa a um evento (SOMENTE ADMIN)
router.post(
  '/:eventId/expenses',
  admin, // Middleware de admin específico para esta rota
  [
    param('eventId').isMongoId().withMessage('ID de evento inválido'),
    body('description').notEmpty().withMessage('Descrição da despesa é obrigatória'),
    body('amount').isNumeric().withMessage('Valor da despesa deve ser um número'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  addExpense
);

// Listar eventos (usuário autenticado vê seus eventos, admin vê todos - lógica no controller)
router.get('/', getEvents);

// Marcar pagamento de participante (requer expenseId no body)
router.patch('/:eventId/participants/:participantId/pay', [
  param('eventId').isMongoId().withMessage('ID de evento inválido'),
  param('participantId').isMongoId().withMessage('ID de participante inválido'),
  body('expenseId').isMongoId().withMessage('ID da despesa é obrigatório no corpo e deve ser válido') // Adicionado validação para expenseId no body
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, setParticipantPaymentAsPaid);

// Desmarcar pagamento de participante (requer expenseId no body)
router.patch('/:eventId/participants/:participantId/unpay', [
  param('eventId').isMongoId().withMessage('ID de evento inválido'),
  param('participantId').isMongoId().withMessage('ID de participante inválido'),
  body('expenseId').isMongoId().withMessage('ID da despesa é obrigatório no corpo e deve ser válido') // Adicionado validação para expenseId no body
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, setParticipantPaymentAsUnpaid);


// Atualização de status de pagamento de despesa para um participante
router.patch('/:eventId/expenses/:expenseId/payments/:participantId', [
  param('eventId').isMongoId().withMessage('ID de evento inválido'),
  param('expenseId').isMongoId().withMessage('ID de despesa inválido'),
  param('participantId').isMongoId().withMessage('ID de participante inválido'),
  // Adicione validações para o body (paid, amountPaid) se necessário
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, updatePaymentStatus);

// Pagamento de despesa por um usuário
router.post('/:eventId/expenses/:expenseId/pay', [
  param('eventId').isMongoId().withMessage('ID de evento inválido'),
  param('expenseId').isMongoId().withMessage('ID de despesa inválido'),
  body('amountPaid').isNumeric().withMessage('Valor pago deve ser um número.') // Validação para amountPaid
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, payExpense);

// Desfazer pagamento de despesa por um usuário
router.post('/:eventId/expenses/:expenseId/unpay', [
  param('eventId').isMongoId().withMessage('ID de evento inválido'),
  param('expenseId').isMongoId().withMessage('ID de despesa inválido'),
], (req, res, next) => { // Adicionado handler de validação
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, unpayExpense);

// Obter um evento específico
router.get('/:eventId', [
    param('eventId').isMongoId().withMessage('ID de evento inválido na URL.')
  ], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, getSingleEvent);

// Atualizar um evento (SOMENTE ADMIN)
router.put(
  '/:eventId',
  admin, // Middleware de admin específico para esta rota
  [
    param('eventId').isMongoId().withMessage('ID de evento inválido na URL.'),
    body('name').optional().notEmpty().withMessage('Nome do evento não pode ser vazio se fornecido.'),
    body('date').optional().isDate().withMessage('Data do evento deve ser válida se fornecida.')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateEvent 
);

// Deletar um evento (SOMENTE ADMIN)
router.delete(
  '/:eventId',
  admin, // Middleware de admin específico para esta rota
  [
    param('eventId').isMongoId().withMessage('ID de evento inválido na URL.')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  deleteEvent 
);

router.delete(
  '/:eventId/expenses/:expenseId',
  admin,   // Garante que é um admin (já que protect está global)
  [                                    
    param('eventId').isMongoId().withMessage('ID de evento inválido na URL.'),
    param('expenseId').isMongoId().withMessage('ID de despesa inválido na URL.')
  ],
  (req, res, next) => { 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); 
  },
  removeExpenseFromEvent
);


module.exports = router;