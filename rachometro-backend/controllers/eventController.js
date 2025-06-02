const Event = require("../models/Event");

// Função para buscar um evento por ID com tratamento de erro
const findEventById = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Evento não encontrado");
  return event;
};

// Criar evento
// Criar evento
exports.createEvent = async (req, res) => {
  try {
    const { name, date } = req.body; // <<< Mude de 'title' para 'name' e adicione 'date'
    const event = new Event({
      name, // <<< Use 'name' aqui
      date, // <<< Adicione 'date' aqui
      createdBy: req.user._id,
      participants: [],
      expenses: [],
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Erro ao criar evento: ${error.message}` });
  }
};

// Buscar eventos do usuário
exports.getEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await Event.find({
      $or: [{ createdBy: userId }, { "participants.userId": userId }],
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Formatando os eventos
    const formattedEvents = events.map((event) => {
      const participants = event.participants.map((p) => ({
        userId: p.userId || null,
        name: p.name || "Anônimo",
      }));

      const expenses = event.expenses.map((expense) => ({
        _id: expense._id,
        description: expense.description,
        amount: expense.amount,
        payments: expense.payments.map((payment) => ({
          participantId: payment.participantId,
          paid: payment.paid,
          amountPaid: payment.amountPaid || 0,
          paidAt: payment.paidAt || null,
        })),
      }));

      return {
        _id: event._id,
        name: event.name, // Corrigido de title para name
        date: event.date, // <<< ADICIONAR ESTA LINHA
        createdBy: event.createdBy,
        participants,
        expenses,
        createdAt: event.createdAt,
      };
    });

    res.json(formattedEvents);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Erro ao buscar eventos: ${error.message}` });
  }
};

// Adicionar participante
exports.addParticipant = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, userId } = req.body; // userId pode ser undefined se não enviado
    const event = await findEventById(eventId); // findEventById já trata se evento não existe
    // Verifica se o participante já existe
    const alreadyExists = event.participants.some(
      p => {
        const nameMatch = p.name === name;
        const userIdMatch = userId && p.userId && p.userId.toString() === userId.toString();
        // Log para cada participante no evento durante a verificação
        // console.log(`BACKEND addParticipant: Verificando participante existente: p.name=<span class="math-inline">\{p\.name\}, p\.userId\=</span>{p.userId}, nameMatch=<span class="math-inline">\{nameMatch\}, userIdMatch\=</span>{userIdMatch}`);
        return nameMatch || userIdMatch;
      }
    );

    console.log('BACKEND addParticipant: "alreadyExists" é:', alreadyExists); // VEJA ESSE VALOR!

    if (alreadyExists) {
      console.log('BACKEND addParticipant: ERRO - Participante já existe neste evento.');
      return res.status(400).json({ message: 'Participante já adicionado a este evento.' });
    }

    const newParticipantData = { name };
    if (userId) { // Só adiciona userId ao objeto se ele existir
      newParticipantData.userId = userId;
    }
    event.participants.push(newParticipantData);

    // Atualiza os pagamentos de todas as despesas para incluir o novo participante
    event.expenses.forEach(expense => {
      const paymentExistsForParticipant = expense.payments.some(p => p.participantId && userId && p.participantId.toString() === userId.toString());
      if (userId && paymentExistsForParticipant) {
        // Se o participante (com userId) já tem um registro de pagamento para esta despesa, não adiciona de novo.
        // Ou você pode querer alguma outra lógica aqui.
        console.log(`BACKEND addParticipant: Pagamento para userId ${userId} já existe na despesa ${expense.description}`);
      } else if (!userId && expense.payments.some(p => !p.participantId && p.name === name)) {
        // Se é um participante sem userId e já existe um pagamento para um participante anônimo com esse nome
        console.log(`BACKEND addParticipant: Pagamento para participante anônimo ${name} já existe na despesa ${expense.description}`);
      }
      else {
        expense.payments.push({
          participantId: userId || null, // Se userId não existir, será null
          // name: name, // O schema PaymentSchema não tem 'name', ele se baseia no participantId para linkar
          paid: false,
          amountPaid: 0,
          paidAt: null
        });
      }
    });

    await event.save();
    console.log('BACKEND addParticipant: Participante adicionado e evento salvo com sucesso.');
    res.status(201).json(event); // Retorna o evento atualizado

  } catch (error) {
    console.error('BACKEND addParticipant: Erro no catch:', error);
    res.status(500).json({ message: `Erro ao adicionar participante: ${error.message}` });
  }
};
// Adicionar despesa
exports.addExpense = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { description, amount } = req.body;

    const event = await findEventById(eventId);

    // Criar array payments para cada participante com paid=false
    const payments = event.participants.map((p) => ({
      participantId: p.userId || null,
      paid: false,
      amountPaid: 0,
      paidAt: null,
    }));

    event.expenses.push({ description, amount, payments });
    await event.save();

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Erro ao adicionar despesa: ${error.message}` });
  }
};

// Atualizar status de pagamento de um participante
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { eventId, expenseId, participantId } = req.params;
    const { paid, amountPaid } = req.body;

    const event = await findEventById(eventId); // findEventById é sua função auxiliar
    const expense = event.expenses.id(expenseId);
    if (!expense)
      return res.status(404).json({ message: "Despesa não encontrada" });

    const payment = expense.payments.find(
      (p) => p.participantId && p.participantId.toString() === participantId
    );
    if (!payment)
      return res
        .status(404)
        .json({
          message: "Pagamento do participante não encontrado para esta despesa",
        });

    // TODO: Adicionar/revisar lógica de permissão aqui (quem pode chamar esta função?)
    // Ex: if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') { ... }

    payment.paid = paid !== undefined ? paid : payment.paid;
    payment.amountPaid =
      amountPaid !== undefined ? parseFloat(amountPaid) : payment.amountPaid; // Garante que amountPaid seja número
    payment.paidAt = payment.paid ? new Date() : null;

    await event.save();
    res.json({
      message: "Status de pagamento atualizado com sucesso",
      payment,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: `Erro ao atualizar status de pagamento: ${error.message}`,
      });
  }
};
// Pagamento de despesa
exports.payExpense = async (req, res) => {
  try {
    const { eventId, expenseId } = req.params;
    const userId = req.user._id.toString(); // Usuário paga por si mesmo
    const { amountPaid } = req.body; // Quanto o usuário está pagando

    if (
      amountPaid === undefined ||
      amountPaid === null ||
      parseFloat(amountPaid) < 0
    ) {
      return res.status(400).json({ message: "Valor pago inválido." });
    }
    const numericAmountPaid = parseFloat(amountPaid);

    const event = await findEventById(eventId);
    const expense = event.expenses.id(expenseId);
    if (!expense)
      return res.status(404).json({ message: "Despesa não encontrada" });

    const payment = expense.payments.find(
      (p) => p.participantId && p.participantId.toString() === userId
    );
    if (!payment)
      return res
        .status(404)
        .json({
          message:
            "Você não é um participante com pagamento registrado para esta despesa.",
        });

    // Acumula o valor pago (se a lógica for de pagamentos parciais)
    // Se for para substituir, seria: payment.amountPaid = numericAmountPaid;
    payment.amountPaid = (payment.amountPaid || 0) + numericAmountPaid;

    // Verifica se o valor total da despesa para este participante foi atingido
    // (Aqui estou assumindo que expense.amount é o valor total da despesa,
    // e que talvez devesse ser dividido entre os participantes,
    // mas seu schema atual não detalha o valor *devido* por participante na despesa.
    // Para simplificar, vamos assumir que se payment.amountPaid >= expense.amount, está pago.
    // Você pode precisar ajustar essa lógica dependendo de como o valor devido é calculado.)
    const amountDueForParticipant = expense.amount / expense.payments.length; // Exemplo simplista de divisão igual

    if (payment.amountPaid >= amountDueForParticipant) {
      // Ou >= expense.amount se for valor total
      payment.paid = true;
      payment.paidAt = new Date();
    } else {
      payment.paid = false;
      payment.paidAt = null; // Ou manter a data do último pagamento parcial
    }

    await event.save();
    res.json({ message: "Pagamento registrado com sucesso", expense });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Erro ao registrar pagamento: ${error.message}` });
  }
};

// USUÁRIO DESFAZ SEU PAGAMENTO PARA UMA DESPESA
exports.unpayExpense = async (req, res) => {
  try {
    const { eventId, expenseId } = req.params;
    const userId = req.user._id.toString(); // Usuário desfaz seu próprio pagamento

    const event = await findEventById(eventId);
    const expense = event.expenses.id(expenseId);
    if (!expense)
      return res.status(404).json({ message: "Despesa não encontrada" });

    const payment = expense.payments.find(
      (p) => p.participantId && p.participantId.toString() === userId
    );
    if (!payment)
      return res
        .status(404)
        .json({
          message:
            "Você não é um participante com pagamento registrado para esta despesa.",
        });

    payment.paid = false;
    payment.amountPaid = 0; // Zera o valor pago
    payment.paidAt = null;

    await event.save();
    res.json({ message: "Pagamento removido/desfeito com sucesso", expense });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Erro ao remover pagamento: ${error.message}` });
  }
};

exports.getSingleEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    // Use o populate para trazer os dados referenciados
    const event = await Event.findById(eventId)
      .populate("createdBy", "name email") // Popula o criador
      // Você pode querer popular os participantes aqui também, se eles forem User refs
      // .populate('participants.userId', 'name email') // Se 'participants.userId' for uma ref a User
      .lean(); // Use .lean() para obter um objeto JS puro e facilitar manipulações

    if (!event) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }

    // Formatação dos participantes e despesas para consistência com getEvents (opcional, mas bom)
    const formattedEvent = {
      _id: event._id,
      name: event.name,
      createdBy: event.createdBy,
      // Mapeie os participantes para incluir o nome, mesmo se não for um usuário cadastrado
      participants: event.participants.map((p) => ({
        userId: p.userId || null,
        name: p.name, // O nome já deve vir do schema Participant
      })),
      expenses: event.expenses.map((expense) => ({
        _id: expense._id,
        description: expense.description,
        amount: expense.amount,
        payments: expense.payments.map((payment) => ({
          participantId: payment.participantId, // ID do participante que fez o pagamento
          paid: payment.paid,
          amountPaid: payment.amountPaid || 0,
          paidAt: payment.paidAt || null,
        })),
      })),
      createdAt: event.createdAt, // Ou a data que você usa para criação
      date: event.date, // Adicione a data do evento
    };

    res.json(formattedEvent);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Erro ao buscar evento: ${error.message}` });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { name, date } = req.body; // Outros campos que podem ser editados
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }

    // Verificar permissão: só o criador ou admin pode editar
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          message:
            "Acesso negado: Apenas administradores podem editar eventos.",
        });
    }

    // Atualizar os campos
    event.name = name || event.name;
    event.date = date || event.date;
    // Adicione outros campos que podem ser atualizados

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Erro ao atualizar evento: ${error.message}` });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }

    // Verificar permissão: só o criador ou admin pode excluir
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          message:
            "Acesso negado: Apenas administradores podem excluir eventos.",
        });
    }

    await event.deleteOne(); // Ou Event.findByIdAndDelete(eventId)

    res.json({ message: "Evento excluído com sucesso" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Erro ao excluir evento: ${error.message}` });
  }
};

exports.setParticipantPaymentAsPaid = async (req, res) => {
  try {
    const { eventId, participantId } = req.params;
    const { expenseId, amountPaid } = req.body; // expenseId OBRIGATÓRIO no corpo! amountPaid opcional.

    if (!expenseId) {
      return res
        .status(400)
        .json({
          message:
            "O ID da despesa (expenseId) é obrigatório no corpo da requisição.",
        });
    }

    const event = await findEventById(eventId); // Sua função auxiliar
    const expense = event.expenses.id(expenseId);
    if (!expense) {
      return res
        .status(404)
        .json({ message: "Despesa não encontrada com o expenseId fornecido." });
    }

    const payment = expense.payments.find(
      (p) => p.participantId && p.participantId.toString() === participantId
    );
    if (!payment) {
      return res
        .status(404)
        .json({
          message:
            "Pagamento do participante não encontrado para esta despesa.",
        });
    }

    // Lógica de permissão: Quem pode chamar esta rota? Admin? O próprio usuário?
    // if (req.user.role !== 'admin' && req.user._id.toString() !== participantId) {
    //   return res.status(403).json({ message: 'Acesso negado.' });
    // }

    payment.paid = true;
    payment.amountPaid =
      amountPaid !== undefined ? parseFloat(amountPaid) : payment.amountPaid; // Atualiza se fornecido, senão mantém (ou define um padrão, ex: expense.amount / num_participantes)
    payment.paidAt = new Date();

    await event.save();
    res.json({
      message: "Pagamento do participante marcado como pago.",
      payment,
    });
  } catch (error) {
    console.error("Erro em setParticipantPaymentAsPaid:", error);
    res
      .status(500)
      .json({
        message: `Erro ao marcar pagamento como pago: ${error.message}`,
      });
  }
};

// NOVA FUNÇÃO: Para a rota '/:eventId/participants/:participantId/unpay'
exports.setParticipantPaymentAsUnpaid = async (req, res) => {
  try {
    const { eventId, participantId } = req.params;
    const { expenseId } = req.body; // expenseId OBRIGATÓRIO no corpo!

    if (!expenseId) {
      return res
        .status(400)
        .json({
          message:
            "O ID da despesa (expenseId) é obrigatório no corpo da requisição.",
        });
    }

    const event = await findEventById(eventId); // Sua função auxiliar
    const expense = event.expenses.id(expenseId);
    if (!expense) {
      return res
        .status(404)
        .json({ message: "Despesa não encontrada com o expenseId fornecido." });
    }

    const payment = expense.payments.find(
      (p) => p.participantId && p.participantId.toString() === participantId
    );
    if (!payment) {
      return res
        .status(404)
        .json({
          message:
            "Pagamento do participante não encontrado para esta despesa.",
        });
    }

    payment.paid = false;
    payment.amountPaid = 0; // Geralmente, ao "desfazer" um pagamento, o valor pago é zerado
    payment.paidAt = null;

    await event.save();
    res.json({
      message: "Pagamento do participante marcado como não pago.",
      payment,
    });
  } catch (error) {
    console.error("Erro em setParticipantPaymentAsUnpaid:", error);
    res
      .status(500)
      .json({
        message: `Erro ao marcar pagamento como não pago: ${error.message}`,
      });
  }
};

exports.removeParticipantFromEvent = async (req, res) => {
  console.log('BACKEND: removeParticipantFromEvent INICIADA'); // Log 1
  try {
    const { eventId, participantId: userIdToRemove } = req.params;
    console.log(`BACKEND: eventId=${eventId}, userIdToRemove=${userIdToRemove}`); // Log 2

    const event = await Event.findById(eventId);
    if (!event) {
      console.log('BACKEND: Evento não encontrado'); // Log 3
      return res.status(404).json({ message: 'Evento não encontrado' });
    }
    console.log('BACKEND: Evento encontrado. Nome:', event.name); // Log 4

    const participantIndex = event.participants.findIndex(p => p.userId && p.userId.toString() === userIdToRemove);
    console.log('BACKEND: participantIndex:', participantIndex); // Log 5

    if (participantIndex === -1) {
      console.log('BACKEND: Participante não encontrado no evento'); // Log 6
      return res.status(404).json({ message: 'Participante com o userId fornecido não encontrado neste evento' });
    }
    
    event.participants.splice(participantIndex, 1);
    console.log('BACKEND: Participante removido do array event.participants'); // Log 7

    event.expenses.forEach(expense => {
      expense.payments = expense.payments.filter(payment => 
        payment.participantId ? payment.participantId.toString() !== userIdToRemove : true
      );
    });
    console.log('BACKEND: Pagamentos associados filtrados das despesas'); // Log 8

    console.log('BACKEND: Tentando salvar o evento...'); // Log 9
    await event.save();
    console.log('BACKEND: Evento salvo com sucesso!'); // Log 10
    
    res.json(event); // Resposta de sucesso

  } catch (error) {
    console.error('BACKEND: Erro em removeParticipantFromEvent:', error); // Log de Erro
    res.status(500).json({ message: `Erro ao remover participante: ${error.message}` }); // Resposta de erro
  }
  console.log('BACKEND: removeParticipantFromEvent FINALIZADA'); // Log 11
};
exports.removeExpenseFromEvent = async (req, res) => {
  console.log('BACKEND: removeExpenseFromEvent INICIADA');
  try {
    const { eventId, expenseId } = req.params; // expenseId é o _id do subdocumento despesa
    console.log(`BACKEND: eventId=${eventId}, expenseId=${expenseId}`);

    const event = await Event.findById(eventId);
    if (!event) {
      console.log('BACKEND: Evento não encontrado para excluir despesa.');
      return res.status(404).json({ message: 'Evento não encontrado' });
    }
    console.log('BACKEND: Evento encontrado para excluir despesa. Nome:', event.name);

    // Encontra o índice da despesa no array para remoção
    const expenseIndex = event.expenses.findIndex(exp => exp._id.toString() === expenseId);
    console.log('BACKEND: expenseIndex:', expenseIndex);

    if (expenseIndex === -1) {
      console.log('BACKEND: Despesa não encontrada neste evento.');
      return res.status(404).json({ message: 'Despesa não encontrada neste evento' });
    }
    
    // Remove a despesa do array event.expenses
    // Ao remover o subdocumento da despesa, os 'payments' dentro dela também são removidos.
    event.expenses.splice(expenseIndex, 1);
    console.log('BACKEND: Despesa removida do array event.expenses');

    console.log('BACKEND: Tentando salvar o evento após remover despesa...');
    await event.save();
    console.log('BACKEND: Evento salvo com sucesso após remover despesa!');
    
    res.json(event); // Retorna o evento atualizado

  } catch (error) {
    console.error('BACKEND: Erro em removeExpenseFromEvent:', error);
    res.status(500).json({ message: `Erro ao remover despesa: ${error.message}` });
  }
  console.log('BACKEND: removeExpenseFromEvent FINALIZADA');
};