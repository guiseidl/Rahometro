import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ManagePaymentsPage = () => {
  const { eventId } = useParams(); // Pega o ID do evento da URL
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Função para obter os dados do evento
  const fetchEventDetails = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvent(response.data);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      setErrorMessage('Erro ao carregar os detalhes do evento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  // Função para atualizar o status de pagamento
  const handleUpdatePaymentStatus = async (expenseId, participantId, paidStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/events/${eventId}/expenses/${expenseId}/payments/${participantId}`,
        { paid: paidStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvent(response.data); // Atualiza a lista de despesas após a mudança
    } catch (error) {
      setErrorMessage('Erro ao atualizar o pagamento.');
    }
  };

  return (
    <div className="bg-[#121212] min-h-screen flex flex-col">
      <div className="flex justify-between items-center p-6 bg-[#1F1F1F]">
        <button
          onClick={() => navigate(`/events/${eventId}`)} // Redireciona de volta para os detalhes do evento
          className="text-white"
        >
          Voltar ao evento
        </button>
      </div>

      <div className="flex-1 p-6">
        {loading && <p>Carregando...</p>}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {event && (
          <>
            <h1 className="text-white text-3xl mb-6">{event.name} - Pagamentos</h1>

            <div className="space-y-4">
              {event.expenses.map((expense) => (
                <div key={expense._id} className="bg-[#1F1F1F] p-4 rounded-lg shadow">
                  <h3 className="text-white text-xl">{expense.description}</h3>
                  <p className="text-[#BBBBBB]">Valor: R$ {expense.amount.toFixed(2)}</p>
                  <div className="space-y-2">
                    {expense.payments.map((payment) => (
                      <div key={payment._id} className="flex justify-between items-center">
                        <p className="text-[#BBBBBB]">
                          {payment.participantId ? payment.participantId.name : 'Participante Anônimo'}
                        </p>
                        <button
                          onClick={() => handleUpdatePaymentStatus(expense._id, payment.participantId._id, !payment.paid)}
                          className={`text-sm p-2 rounded-md ${payment.paid ? 'bg-green-500' : 'bg-red-500'}`}
                        >
                          {payment.paid ? 'Pago' : 'Não Pago'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagePaymentsPage;
