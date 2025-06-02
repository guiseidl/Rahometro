const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definição do esquema de Usuário
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/\S+@\S+\.\S+/, 'Por favor, insira um e-mail válido'] // Validação de formato de e-mail
  },
  password: { 
    type: String, 
    required: true, 
    minlength: [8, 'A senha deve ter pelo menos 8 caracteres'] // Validando comprimento mínimo da senha
  },
  role: { 
    type: String, 
    enum: ['admin', 'user'], 
    default: 'user' 
  }
});

// Middleware para criptografar a senha antes de salvar no banco
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  // Evita re-hash se a senha não foi modificada

  try {
    // Validação de segurança para garantir que a senha tenha pelo menos 8 caracteres
    if (this.password.length < 8) {
      throw new Error('A senha deve ter pelo menos 8 caracteres');
    }

    // Gera o salt para criar o hash da senha
    const salt = await bcrypt.genSalt(10);  // `10` é o número de rodadas para o salt
    this.password = await bcrypt.hash(this.password, salt);  // Aplica o hash na senha fornecida
    next();  // Prossegue para salvar o usuário com a senha já hashada
  } catch (error) {
    next(error);  // Passa o erro para o handler de erro
  }
});

// Método para comparar a senha fornecida com a senha armazenada
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Evitar que a senha seja retornada nas respostas
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;  // Exclui a senha do objeto que será retornado
  return user;
};

module.exports = mongoose.model('User', UserSchema);

