const mongoose = require('mongoose');

// Payment Schema
const PaymentSchema = new mongoose.Schema({
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Pode ser null se for participante sem user cadastrado
  },
  paid: {
    type: Boolean,
    default: false,
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0, // Garante que o valor pago seja não-negativo
  },
  paidAt: {
    type: Date,
    default: null,
  }
});

// Expense Schema
const ExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'O valor da despesa não pode ser negativo'],
  },
  payments: [PaymentSchema],
});

// Participant Schema
const ParticipantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // participante pode ser um nome simples, sem usuário cadastrado
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

// Event Schema
const EventSchema = new mongoose.Schema({
  name: { // <<<<< Altere de 'title' para 'name'
    type: String,
    required: true,
    trim: true,
  },
  date: { // <<<<< Adicione o campo 'date'
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [ParticipantSchema],
  expenses: [ExpenseSchema],
}, { timestamps: true }); // Adicione timestamps para createdAt/updatedAt

module.exports = mongoose.model('Event', EventSchema);
