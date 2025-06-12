import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ControleDespesasPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data);
      } catch (error) {
        setErrorMessage('Erro ao carregar eventos.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId) => {
    // Redireciona para a página de detalhes do evento e gerenciar despesas
    navigate(`/events/${eventId}/manage-payments`);
  };

  return (
    <div className="bg-[#121212] min-h-screen flex flex-col">
      <div className="flex justify-between items-center p-6 bg-[#1F1F1F]">
        <h1 className="text-white text-3xl">Controle de Despesas</h1>
      </div>

      <div className="flex-1 p-6">
        {loading && <p>Carregando eventos...</p>}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        {!loading && !errorMessage && (
          <>
            <h2 className="text-white text-2xl mb-6">Eventos</h2>
            {events.length === 0 ? (
              <p className="text-[#BBBBBB]">Nenhum evento encontrado.</p>
            ) : (
              <ul>
                {events.map((event) => (
                  <li
                    key={event._id}
                    className="bg-[#1F1F1F] p-4 rounded-lg shadow mb-4 cursor-pointer"
                    onClick={() => handleEventClick(event._id)}
                  >
                    <h3 className="text-white text-xl">{event.name}</h3>
                    <p className="text-[#BBBBBB]">{new Date(event.date).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ControleDespesasPage;
