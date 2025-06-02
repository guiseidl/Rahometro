// src/pages/ViewUserEventsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Imports já existentes e corretos

const ViewUserEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  // Função de Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole'); // Não se esqueça de remover o role também
    navigate('/login');
  };

  useEffect(() => {
    const fetchUserEvents = async () => {
      setLoading(true);
      setErrorMessage('');
      const token = getToken();

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(response.data);
      } catch (error) {
        console.error('FRONTEND: Erro ao buscar eventos do usuário:', error);
        if (error.response && error.response.status === 401) {
          setErrorMessage('Sessão expirada. Faça login novamente.');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole'); // Limpar também em caso de 401
          navigate('/login');
        } else {
          setErrorMessage(error.response?.data?.message || 'Erro ao carregar seus eventos.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [navigate]);

  // A lógica de condicional para loading e errorMessage pode vir antes do return principal
  // ou ser gerenciada dentro do layout principal se preferir.
  // Para manter simples, vamos deixar como estava, mas o cabeçalho será sempre visível.

  return (
    // Estrutura principal da página com flexbox para o cabeçalho e conteúdo
    <div className="bg-[#121212] min-h-screen flex flex-col">
      {/* ===== INÍCIO DO CABEÇALHO PADRÃO ===== */}
      <div className="flex justify-between items-center p-6 bg-[#1F1F1F]">
        <Link to="/dashboard" className="flex items-center"> {/* Faz a logo ser um link para o dashboard, por exemplo */}
                    <svg 
                      width="150"  // Largura ajustada para o cabeçalho (metade do original)
                      height="40"  // Altura ajustada para o cabeçalho (metade do original)
                      viewBox="0 0 300 80" // Mantém o viewBox original para escalar corretamente
                      xmlns="http://www.w3.org/2000/svg" 
                      aria-label="Logo Rachômetro"
                    >
                      {/* Símbolo da Divisão */}
                      <circle cx="30" cy="25" r="10" fill="#3498db" />
                      <rect x="10" y="40" width="40" height="7" fill="#3498db" rx="1.5" />
                      <circle cx="30" cy="60" r="10" fill="#3498db" />
                      {/* Nome RACHOMETRO */}
                      <text
                        x="70" // Posição X do texto
                        y="50" // Posição Y do texto, ajustada por dominant-baseline
                        fontFamily="Arial, Helvetica, sans-serif"
                        fontSize="30" // Tamanho da fonte dentro do SVG
                        fill="#A6A6A6" // Alterei a cor para combinar com o estilo do seu título anterior
                        dominantBaseline="middle"
                        fontWeight="bold"
                        // textAnchor="start" // Removido para usar o padrão ou ajuste conforme necessidade
                      >
                        RACHOMETRO
                      </text>
                    </svg>
                  </Link>
        <div className="flex items-center space-x-4">
          <Link to="/profile" className="text-white hover:text-gray-400">
            Perfil
          </Link>
          <button
            onClick={handleLogout} // Chama a função de logout definida acima
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </div>
      {/* ===== FIM DO CABEÇALHO PADRÃO ===== */}

      {/* Conteúdo Principal da Página "Meus Eventos" */}
      <div className="flex-1 p-6"> {/* `flex-1` faz esta div ocupar o espaço restante */}
        {/* Mensagem de loading ou erro (se não tratadas antes do return principal) */}
        {loading && <div className="text-white text-center p-6">Carregando seus eventos...</div>}
        {errorMessage && !loading && <div className="bg-red-700 text-white text-center p-3 rounded-md mb-4">{errorMessage}</div>}

        {/* Conteúdo quando não há loading nem erro */}
        {!loading && !errorMessage && (
          <>
            <h1 className="text-white text-3xl font-bold mb-6">Meus Eventos</h1>
            {events.length === 0 ? (
              <div className="text-center"> {/* Para centralizar a mensagem e o botão */}
                <p className="text-[#BBBBBB] mb-4">Você não tem eventos associados no momento.</p>
                <button onClick={() => navigate('/user-dashboard')} className="mt-6 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
                  Voltar ao Dashboard
                </button>
              </div>
            ) : (
              <>
                <ul className="space-y-4">
                  {events.map(event => (
                    <li key={event._id} className="bg-[#1F1F1F] p-4 rounded-lg shadow">
                      <h2 className="text-white text-xl font-semibold">{event.name}</h2>
                      <p className="text-[#BBBBBB]">Data: {new Date(event.date).toLocaleDateString()}</p>
                      <p className="text-[#BBBBBB] text-sm">Criado por: {event.createdBy.name}</p>
                      {/* Opcional: Link para detalhes do evento */}
                      {/* <Link to={`/events/${event._id}`} className="text-blue-400 hover:underline">Ver Detalhes</Link> */}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/user-dashboard')} className="mt-6 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
                  Voltar ao Dashboard
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewUserEventsPage;