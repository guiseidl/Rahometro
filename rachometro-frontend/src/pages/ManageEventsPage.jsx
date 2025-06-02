// src/pages/ManageEventsPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ManageEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editEventName, setEditEventName] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [participantFormError, setParticipantFormError] = useState("");
  const [participantFormSuccess, setParticipantFormSuccess] = useState("");
  const [expenseFormError, setExpenseFormError] = useState("");
  const [expenseFormSuccess, setExpenseFormSuccess] = useState("");
  // Estados para busca e adição de Participante
  const [newParticipantName, setNewParticipantName] = useState(""); // Mantido para o input de busca/nome
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [selectedParticipantUserId, setSelectedParticipantUserId] =
    useState(null);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Estados para Formulário de Criação de Evento
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  // Estados para Formulário de Adicionar Despesa
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");

  // Estados Gerais
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
    } catch (error) {
      console.error("FRONTEND: Erro ao buscar eventos:", error);
      if (error.response && error.response.status === 401) {
        setErrorMessage(
          "Sessão expirada ou não autorizado. Por favor, faça login novamente."
        );
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/login");
      } else {
        setErrorMessage(
          error.response?.data?.message || "Erro ao carregar eventos."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchSuggestedUsers = async (query) => {
    if (!query.trim()) {
      setSuggestedUsers([]);
      return;
    }
    setIsSearchingUsers(true);
    const token = getToken();
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/search?q=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuggestedUsers(response.data);
    } catch (error) {
      console.error("FRONTEND: Erro ao buscar usuários sugeridos:", error);
      setSuggestedUsers([]);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    // ... (sua função handleDeleteEvent como antes, está correta) ...
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
      )
    ) {
      console.log(
        "RENDER: ManageEventsPage. showAddExpense =",
        showAddExpense,
        "showAddParticipant =",
        showAddParticipant
      ); // Novo Log
      return;
    }
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    const token = getToken();
    if (!token) {
      setErrorMessage("Autenticação necessária.");
      navigate("/login");
      setLoading(false);
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Evento excluído com sucesso!");
      fetchEvents();
      if (selectedEvent && selectedEvent._id === eventId)
        setSelectedEvent(null);
    } catch (error) {
      console.error("FRONTEND: Erro ao excluir evento:", error);
      if (error.response && error.response.status === 401) {
        setErrorMessage(
          "Sessão expirada ou não autorizado. Por favor, faça login novamente."
        );
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/login");
      } else if (error.response && error.response.status === 403) {
        setErrorMessage(
          "Acesso negado. Apenas administradores podem excluir eventos."
        );
      } else {
        setErrorMessage(
          error.response?.data?.message || "Erro ao excluir evento."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    // ... (sua função handleCreateEvent como antes, está correta) ...
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    const token = getToken();
    if (!token) {
      setErrorMessage(
        "Você não está autenticado. Por favor, faça login novamente."
      );
      navigate("/login");
      setLoading(false);
      return;
    }
    if (!newEventTitle.trim()) {
      setErrorMessage("O nome do evento não pode estar vazio.");
      setLoading(false);
      return;
    }
    if (!newEventDate.trim()) {
      setErrorMessage("A data do evento é obrigatória.");
      setLoading(false);
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/events",
        { name: newEventTitle, date: newEventDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage("Evento criado com sucesso!");
      setNewEventTitle("");
      setNewEventDate("");
      setShowCreateForm(false);
      fetchEvents();
    } catch (error) {
      console.error("FRONTEND: Erro ao criar evento:", error);
      if (error.response) {
        if (error.response.status === 400 && error.response.data.errors) {
          setErrorMessage(
            error.response.data.errors.map((err) => err.msg).join(", ")
          );
        } else if (error.response.status === 403) {
          setErrorMessage(
            "Acesso negado. Apenas administradores podem criar eventos."
          );
        } else if (error.response.status === 401) {
          setErrorMessage(
            "Sessão expirada ou não autorizado. Por favor, faça login novamente."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          navigate("/login");
        } else {
          setErrorMessage(
            error.response.data.message || "Erro ao criar evento."
          );
        }
      } else {
        setErrorMessage(
          "Erro de rede ou servidor. Tente novamente mais tarde."
        );
      }
    } finally {
      setLoading(false);
    }
  };

 const handleDeleteExpenseFromEvent = async (eventId, expenseId) => {
  // Log para confirmar que a função foi chamada com os IDs corretos
  console.log(`FRONTEND: Tentando excluir despesa: eventId=${eventId}, expenseId=${expenseId}`);

  if (!eventId || !expenseId) {
    setExpenseFormError("IDs de evento ou despesa ausentes."); // Usando o estado de erro do formulário de despesa
    return;
  }

  if (!window.confirm('Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.')) {
    return;
  }

  setLoading(true);
  setExpenseFormError("");    // Limpa mensagens de erro do formulário de despesa
  setExpenseFormSuccess("");  // Limpa mensagens de sucesso do formulário de despesa
  // Pode limpar mensagens globais também, se desejar
  setErrorMessage(""); 
  setSuccessMessage("");

  const token = getToken();
  if (!token) {
    setExpenseFormError("Autenticação necessária.");
    navigate("/login");
    setLoading(false);
    return;
  }

  try {
    const response = await axios.delete(
      `http://localhost:5000/api/events/${eventId}/expenses/${expenseId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setExpenseFormSuccess("Despesa removida com sucesso!");
    setSelectedEvent(response.data); // Atualiza o selectedEvent com os dados do evento retornados (sem a despesa)

    // Auto-limpar mensagem de sucesso após alguns segundos
    setTimeout(() => {
      setExpenseFormSuccess("");
    }, 3000);

  } catch (error) {
    console.error("FRONTEND: Erro ao remover despesa do evento:", error);
    if (error.response) {
      if (error.response.status === 401) {
        setErrorMessage("Sessão expirada ou não autorizado. Faça login novamente."); // Erro global
        localStorage.removeItem("token"); localStorage.removeItem("userRole");
        navigate("/login");
      } else if (error.response.status === 403) {
        setExpenseFormError("Acesso negado. Apenas administradores podem remover despesas.");
      } else if (error.response.status === 404) {
        setExpenseFormError(error.response.data.message || "Evento ou despesa não encontrada.");
      } else {
        setExpenseFormError(error.response.data.message || "Erro ao remover despesa.");
      }
    } else {
      setExpenseFormError("Erro de rede ou servidor.");
    }
  } finally {
    setLoading(false);
  }
};
  const handleUpdateEvent = async (e) => {
    // ... (sua função handleUpdateEvent como antes, está correta) ...
    e.preventDefault();
    if (!editingEvent || !editingEvent._id) {
      setErrorMessage(
        "Nenhum evento selecionado para edição ou ID do evento ausente."
      );
      return;
    }
    if (!editEventName.trim()) {
      setErrorMessage("O nome do evento não pode estar vazio.");
      return;
    }
    if (!editEventDate.trim()) {
      setErrorMessage("A data do evento é obrigatória.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    const token = getToken();
    if (!token) {
      setErrorMessage(
        "Autenticação necessária. Por favor, faça login novamente."
      );
      navigate("/login");
      setLoading(false);
      return;
    }
    try {
      const updatedData = { name: editEventName, date: editEventDate };
      await axios.put(
        `http://localhost:5000/api/events/${editingEvent._id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage("Evento atualizado com sucesso!");
      setShowEditForm(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error("FRONTEND: Erro ao atualizar evento:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage(
            "Sessão expirada ou não autorizado. Por favor, faça login novamente."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          navigate("/login");
        } else if (error.response.status === 403) {
          setErrorMessage(
            "Acesso negado. Apenas administradores podem editar eventos."
          );
        } else if (error.response.status === 404) {
          setErrorMessage("Evento não encontrado para atualização.");
        } else if (error.response.data && error.response.data.errors) {
          setErrorMessage(
            error.response.data.errors.map((err) => err.msg).join(", ")
          );
        } else {
          setErrorMessage(
            error.response.data.message || "Erro ao atualizar evento."
          );
        }
      } else {
        setErrorMessage(
          "Erro de rede ou servidor ao tentar atualizar o evento. Tente novamente mais tarde."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();

    if (!selectedEvent || !selectedEvent._id) {
      // Poderia usar setParticipantFormError aqui se o erro for contextual ao form
      setErrorMessage("Nenhum evento selecionado para adicionar participante.");
      return;
    }

    const participantNameValue = newParticipantName.trim(); // Você usa newParticipantName

    if (!participantNameValue) {
      setParticipantFormError("O nome do participante não pode estar vazio."); // <<< USA O NOVO ESTADO
      return;
    }

    setLoading(true);
    setParticipantFormError(""); // <<< LIMPA O NOVO ESTADO
    setParticipantFormSuccess(""); // <<< LIMPA O NOVO ESTADO
    // Limpe também os globais se quiser evitar confusão
    setErrorMessage("");
    setSuccessMessage("");

    const token = getToken();

    if (!token) {
      setParticipantFormError("Autenticação necessária."); // <<< USA O NOVO ESTADO
      navigate("/login");
      setLoading(false);
      return;
    }

    try {
      const payload = { name: participantNameValue };
      if (selectedParticipantUserId) {
        payload.userId = selectedParticipantUserId;
      }

      const response = await axios.post(
        `http://localhost:5000/api/events/${selectedEvent._id}/participants`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(
        "FRONTEND: Resposta do backend (evento completo):",
        response.data
      );
      console.log(
        "FRONTEND: Participantes na resposta do backend:",
        response.data.participants
      ); // <<< INSPECIONE ESTE LOG

      setParticipantFormSuccess("Participante adicionado com sucesso!"); // <<< USA O NOVO ESTADO
      setNewParticipantName("");
      setSelectedParticipantUserId(null);
      setSuggestedUsers([]);
      // setShowAddParticipant(false); // Decide se fecha o form
      setSelectedEvent(response.data);
      setTimeout(() => {
        setParticipantFormSuccess(""); // Limpa a mensagem após 3 segundos
      }, 3000); // 3000 milissegundos = 3 segundos. Ajuste conforme necessário.
    } catch (error) {
      if (error.response) {
        // Aqui você pode decidir se o erro é tão crítico que deve ser global
        // ou se ainda deve usar setParticipantFormError
        if (error.response.status === 401) {
          setErrorMessage(
            "Sessão expirada ou não autorizado. Faça login novamente."
          ); // Erro global
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          navigate("/login");
        } else if (error.response.status === 403) {
          setParticipantFormError("Acesso negado. Verifique suas permissões."); // <<< USA O NOVO ESTADO
        } else if (
          error.response.status === 400 &&
          error.response.data.errors
        ) {
          setParticipantFormError(
            error.response.data.errors.map((err) => err.msg).join(", ")
          ); // <<< USA O NOVO ESTADO
        } else if (error.response.data && error.response.data.message) {
          setParticipantFormError(error.response.data.message); // <<< USA O NOVO ESTADO
        } else {
          setParticipantFormError("Erro ao adicionar participante."); // <<< USA O NOVO ESTADO
        }
      } else {
        setParticipantFormError(
          "Erro de rede ou servidor. Tente novamente mais tarde."
        ); // <<< USA O NOVO ESTADO
      }
    } finally {
      setLoading(false);
    }
  };

  // Em ManageEventsPage.jsx
  // ... (outros imports, states, e funções)

  // Em ManageEventsPage.jsx
const handleDeleteParticipantFromEvent = async (
  eventId,
  participantUserId // <<< Parâmetro agora representa o userId
) => {
  console.log('FUNÇÃO handleDeleteParticipantFromEvent CHAMADA!');
  console.log('eventId:', eventId, 'participantUserId:', participantUserId); // Log com o nome correto do parâmetro

  if (!eventId || !participantUserId) { // <<< Verificando participantUserId
    setParticipantFormError("IDs de evento ou ID de usuário do participante ausentes.");
    return;
  }

  if (!window.confirm(`Tem certeza que deseja remover este participante?`)) {
    return;
  }

  setLoading(true);
  setParticipantFormError("");
  setParticipantFormSuccess("");
  setErrorMessage("");
  setSuccessMessage("");

  const token = getToken();
  if (!token) {
    setParticipantFormError("Autenticação necessária.");
    navigate("/login");
    setLoading(false);
    return;
  }

  try {
    // A URL agora usará participantUserId, que corresponde ao :participantId na rota do backend
    // se o backend foi ajustado para tratar :participantId como userId.
    const response = await axios.delete(
      `http://localhost:5000/api/events/${eventId}/participants/${participantUserId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setParticipantFormSuccess("Participante removido com sucesso!");
    setSelectedEvent(response.data); // Atualiza o selectedEvent com os dados do evento retornados

    setTimeout(() => {
      setParticipantFormSuccess("");
    }, 3000);
  } catch (error) {
    console.error("FRONTEND: Erro ao remover participante do evento:", error);
    if (error.response) {
      if (error.response.status === 401) {
        setErrorMessage(
          "Sessão expirada ou não autorizado. Por favor, faça login novamente."
        );
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/login");
      } else if (error.response.status === 403) {
        setParticipantFormError(
          "Acesso negado. Apenas administradores podem remover participantes."
        );
      } else if (error.response.status === 404) {
        setParticipantFormError(
          error.response.data.message ||
            "Evento ou participante não encontrado."
        );
      } else {
        setParticipantFormError(
          error.response.data.message || "Erro ao remover participante."
        );
      }
    } else {
      setParticipantFormError("Erro de rede ou servidor.");
    }
  } finally {
    setLoading(false);
  }
};
  
  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!selectedEvent || !selectedEvent._id) {
      setExpenseFormError("Nenhum evento selecionado para adicionar despesa.");
      return;
    }

    const description = newExpenseDescription.trim();
    const amountStr = newExpenseAmount.trim();
    const amount = parseFloat(amountStr);

    if (!description) {
      setExpenseFormError("A descrição da despesa não pode estar vazia.");
      return;
    }
    if (!amountStr || isNaN(amount) || amount <= 0) {
      setExpenseFormError("O valor da despesa deve ser um número positivo.");
      return;
    }

    setLoading(true);
    setExpenseFormError(""); // Limpa mensagem de erro específica do form
    setExpenseFormSuccess(""); // Limpa mensagem de sucesso específica do form
    setErrorMessage(""); // Limpa mensagens globais por precaução
    setSuccessMessage("");

    const token = getToken();

    if (!token) {
      setExpenseFormError("Autenticação necessária.");
      navigate("/login");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        description: description,
        amount: amount, // Envia como número
      };

      const response = await axios.post(
        `http://localhost:5000/api/events/${selectedEvent._id}/expenses`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setExpenseFormSuccess("Despesa adicionada com sucesso!");
      setNewExpenseDescription(""); // Limpa o campo de descrição
      setNewExpenseAmount(""); // Limpa o campo de valor
      // setShowAddExpense(false); // Você decide se quer fechar o form automaticamente

      // Atualiza o evento selecionado com a nova lista de despesas
      // (e os stubs de pagamento que o backend cria para a nova despesa)
      setSelectedEvent(response.data);
      setTimeout(() => {
        setExpenseFormSuccess(""); // Limpa a mensagem após 3 segundos
      }, 3000); // 3000 milissegundos = 3 segundos. Ajuste conforme necessário.
    } catch (error) {
      console.error("FRONTEND: Erro ao adicionar despesa:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage(
            "Sessão expirada ou não autorizado. Faça login novamente."
          ); // Erro global
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          navigate("/login");
        } else if (error.response.status === 403) {
          setExpenseFormError("Acesso negado. Verifique suas permissões.");
        } else if (
          error.response.status === 400 &&
          error.response.data.errors
        ) {
          setExpenseFormError(
            error.response.data.errors.map((err) => err.msg).join(", ")
          );
        } else if (error.response.data && error.response.data.message) {
          setExpenseFormError(error.response.data.message);
        } else {
          setExpenseFormError("Erro ao adicionar despesa.");
        }
      } else {
        setExpenseFormError(
          "Erro de rede ou servidor. Tente novamente mais tarde."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121212] min-h-screen flex flex-col">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center p-6 bg-[#1F1F1F]">
        <Link to="/admin-dashboard" className="flex items-center">
          {" "}
          {/* Faz a logo ser um link para o dashboard, por exemplo */}
          <svg
            width="150" // Largura ajustada para o cabeçalho (metade do original)
            height="40" // Altura ajustada para o cabeçalho (metade do original)
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
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex flex-1 p-6">
        {/* Barra Lateral (Eventos, Formulário de Criação, Formulário de Edição) */}
        <div className="w-1/4 bg-[#1F1F1F] p-6 rounded-lg shadow-lg flex flex-col mr-6">
          <h2 className="text-white text-2xl font-bold mb-6 text-center">
            Eventos
          </h2>
          {errorMessage && (
            <div className="bg-red-500 text-white p-3 rounded-md mb-4">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-500 text-white p-3 rounded-md mb-4">
              {successMessage}
            </div>
          )}

          {!showEditForm && (
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setShowEditForm(false);
                setEditingEvent(null);
                setNewEventTitle("");
                setNewEventDate("");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="bg-[#A6A6A6] text-white py-3 rounded-md mb-4 hover:bg-[#8C8C8C]"
            >
              {showCreateForm ? "Cancelar Criação" : "Criar Novo Evento"}
            </button>
          )}

          {showCreateForm && !showEditForm && (
            <form
              onSubmit={handleCreateEvent}
              className="mb-6 bg-[#282828] p-4 rounded-md"
            >
              <h3 className="text-white text-xl font-semibold mb-3">
                Detalhes do Novo Evento
              </h3>
              <input
                type="text"
                className="w-full p-3 bg-[#121212] text-white rounded-md mb-4"
                placeholder="Nome do Evento"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
              />
              <input
                type="date"
                className="w-full p-3 bg-[#121212] text-white rounded-md mb-4"
                placeholder="Data do Evento"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Criando..." : "Salvar Evento"}
              </button>
            </form>
          )}

          {showEditForm && editingEvent && (
            <form
              onSubmit={handleUpdateEvent}
              className="mt-6 mb-6 bg-[#282828] p-4 rounded-md"
            >
              <h3 className="text-white text-xl font-semibold mb-3">
                Editar Evento:{" "}
                <span className="font-normal italic">{editingEvent.name}</span>
              </h3>
              <div className="mb-4">
                <label
                  htmlFor="editEventName"
                  className="block text-[#BBBBBB] text-sm font-bold mb-2"
                >
                  Novo Nome do Evento
                </label>
                <input
                  id="editEventName"
                  type="text"
                  className="w-full p-3 bg-[#121212] text-white rounded-md"
                  placeholder="Digite o novo nome do evento"
                  value={editEventName}
                  onChange={(e) => setEditEventName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="editEventDate"
                  className="block text-[#BBBBBB] text-sm font-bold mb-2"
                >
                  Nova Data do Evento
                </label>
                <input
                  id="editEventDate"
                  type="date"
                  className="w-full p-3 bg-[#121212] text-white rounded-md"
                  value={editEventDate}
                  onChange={(e) => setEditEventDate(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingEvent(null);
                    setErrorMessage("");
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <ul className="space-y-3 flex-1 overflow-y-auto">
            {loading && events.length === 0 ? (
              <p className="text-[#BBBBBB]">Carregando eventos...</p>
            ) : !loading &&
              events.length === 0 &&
              !showCreateForm &&
              !showEditForm ? (
              <p className="text-[#BBBBBB]">
                Nenhum evento encontrado. Crie um novo!
              </p>
            ) : (
              events.map((event) => (
                <li
                  key={event._id}
                  className={`p-4 rounded-lg ${
                    selectedEvent && selectedEvent._id === event._id
                      ? "bg-[#3A3A3A]"
                      : "bg-[#282828]"
                  } transition-colors duration-200 flex justify-between items-center`}
                >
                  <div
                    onClick={() => {
                      setSelectedEvent(event);
                      // Reseta os estados dos formulários do painel de detalhes
                      setShowAddParticipant(false);
                      setShowAddExpense(false);
                      setNewParticipantName(""); // Limpa o input de nome do participante
                      setSelectedParticipantUserId(null); // Limpa o ID do usuário selecionado
                      setSuggestedUsers([]); // Limpa as sugestões de usuários
                      setParticipantFormError(""); // Limpa mensagem de erro do form de participante
                      setParticipantFormSuccess(""); // Limpa mensagem de sucesso do form de participante
                      setNewExpenseDescription(""); // Limpa input de descrição da despesa
                      setNewExpenseAmount(""); // Limpa input de valor da despesa
                      // Se você tiver estados para mensagens do formulário de despesas, limpe-os também:
                      // setExpenseFormError("");
                      // setExpenseFormSuccess("");
                      setErrorMessage(""); // Limpa mensagens de erro/sucesso globais da barra lateral
                      setSuccessMessage("");
                      setShowCreateForm(false); // Garante que o form de criar evento feche
                      setShowEditForm(false); // Garante que o form de editar evento feche
                      setEditingEvent(null);
                    }}
                    className="cursor-pointer flex-grow"
                  >
                    <h3 className="text-white font-bold">{event.name}</h3>
                    <p className="text-[#BBBBBB] text-sm">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-[#BBBBBB] text-sm">
                      Criado por: {event.createdBy.name}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEvent(event);
                        setEditEventName(event.name);
                        setEditEventDate(
                          event.date
                            ? new Date(event.date).toISOString().split("T")[0]
                            : ""
                        );
                        setShowEditForm(true);
                        setShowCreateForm(false);
                        // Ao abrir o form de edição, também é bom limpar o painel de detalhes
                        setSelectedEvent(null); // Ou mantenha, mas feche os sub-formulários
                        setShowAddParticipant(false);
                        setShowAddExpense(false);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 px-2 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event._id);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Painel de Detalhes do Evento Selecionado */}
        <div className="w-3/4 bg-[#1F1F1F] p-6 rounded-lg shadow-lg flex flex-col">
          {selectedEvent ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                {" "}
                {/* mb-2 para separar da linha do criador */}
                <h2 className="text-white text-3xl font-bold truncate">
                  {" "}
                  {/* truncate para nomes longos */}
                  {selectedEvent.name}
                </h2>
                <p className="text-[#BBBBBB] text-lg ml-4 flex-shrink-0">
                  {" "}
                  {/* ml-4 para espaço, flex-shrink-0 para não encolher */}
                  {new Date(selectedEvent.date).toLocaleDateString()}
                </p>
              </div>

              {/* Linha para Criador do Evento */}
              <p className="text-[#BBBBBB] text-md mb-6">
                {" "}
                {/* mb-6 para separar da próxima seção, text-md para diferenciar */}
                Criado por: {selectedEvent.createdBy.name}
              </p>

              {/* Seção Participantes */}
              <div className="mb-6">
                <h3 className="text-white text-2xl font-semibold mb-3">
                  Participantes
                </h3>
                <button
                  onClick={() => {
                    setShowAddParticipant(!showAddParticipant);
                    setNewParticipantName(""); // Limpa ao abrir/fechar
                    setSelectedParticipantUserId(null);
                    setSuggestedUsers([]);
                    setErrorMessage("");
                    setSuccessMessage("");
                    setParticipantFormError(""); // Limpa mensagem ao abrir/fechar form de participante
                    setParticipantFormSuccess(""); // Limpa mensagem
                  }}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md mb-4 hover:bg-blue-700"
                >
                  {showAddParticipant ? "Cancelar" : "Adicionar Participante"}
                </button>
                {participantFormError && (
                  <div className="bg-red-500 text-white p-3 rounded-md mb-4">
                    {participantFormError}
                  </div>
                )}
                {participantFormSuccess && (
                  <div className="bg-green-500 text-white p-3 rounded-md mb-4">
                    {participantFormSuccess}
                  </div>
                )}

                {/* === FORMULÁRIO DE ADICIONAR PARTICIPANTE CORRIGIDO === */}
                {showAddParticipant && (
                  <form
                    onSubmit={handleAddParticipant}
                    className="mb-4 bg-[#282828] p-4 rounded-md"
                  >
                    <h4 className="text-white text-lg font-semibold mb-2">
                      Adicionar Novo Participante
                    </h4>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full p-3 bg-[#121212] text-white rounded-md mb-1"
                        placeholder="Digite nome para buscar ou adicionar"
                        value={newParticipantName} // Usa newParticipantName conforme sua preferência
                        onChange={(e) => {
                          const query = e.target.value;
                          setNewParticipantName(query); // Atualiza newParticipantName
                          setSelectedParticipantUserId(null);
                          fetchSuggestedUsers(query);
                        }}
                      />
                      {isSearchingUsers && (
                        <p className="text-xs text-gray-400">Buscando...</p>
                      )}
                      {suggestedUsers.length > 0 && (
                        <ul className="absolute z-10 w-full bg-[#3A3A3A] border border-gray-700 rounded-md mt-1 max-h-40 overflow-y-auto">
                          {suggestedUsers.map((user) => (
                            <li
                              key={user._id}
                              className="p-2 hover:bg-[#4A4A4A] cursor-pointer text-white"
                              onClick={() => {
                                setNewParticipantName(user.name);
                                setSelectedParticipantUserId(user._id);
                                setSuggestedUsers([]);
                              }}
                            >
                              {user.name} ({user.email})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 mt-3"
                      disabled={loading}
                    >
                      {loading
                        ? "Adicionando..."
                        : "Adicionar Participante ao Evento"}
                    </button>
                  </form>
                )}
                {/* === FIM DO FORMULÁRIO CORRIGIDO === */}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {" "}
                  {/* Define 1, 2 ou 3 colunas dependendo do tamanho da tela, com um espaçamento (gap) */}
                  {
                    selectedEvent.participants &&
                    selectedEvent.participants.length > 0
                      ? selectedEvent.participants.map((participant, index) => (
                          <div
                            key={participant._id || participant.userId || index} // participant._id é o ID do subdocumento
                            className="bg-[#121212] p-3 rounded-lg shadow flex justify-between items-center" // Ajustado para p-3 e shadow
                          >
                            <h4 className="text-white font-medium truncate">
                              {participant.name}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  "Objeto participant NO ONCLICK do botão excluir:",
                                  participant
                                );
                                // AGORA PASSANDO participant.userId
                                handleDeleteParticipantFromEvent(selectedEvent._id, participant.userId); 
                                 console.log('Objeto participant NO ONCLICK do botão excluir:', participant);
                              }}
                              //className="bg-red-600 hover:bg-red-700 text-white font-bold p-1 rounded-full flex items-center justify-center"
                              title="Excluir Participante"
                              style={{ width: "24px", height: "24px" }}
                            >
                              {/* Ícone SVG da Lixeira */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="white"
                                className="w-4 h-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))
                      : null // O grid não renderizará nada se a lista estiver vazia
                  }
                </div>
                {/* Mensagem para quando não há participantes */}
                {selectedEvent.participants &&
                  selectedEvent.participants.length === 0 && (
                    <p className="text-[#BBBBBB] mt-2">
                      Nenhum participante ainda.
                    </p> // mt-2 para dar um espaço se o grid estiver vazio
                  )}
              </div>

              {/* Seção Despesas */}
              <div>
                <h3 className="text-white text-2xl font-semibold mb-3">
                  Despesas
                </h3>
                <button
                  onClick={() => {
                    console.log("Botão Adicionar Despesa CLICADO"); // Novo Log
                    console.log(
                      "Valor ATUAL de showAddExpense:",
                      showAddExpense
                    ); // Novo Log
                    setShowAddExpense(!showAddExpense);
                    // O console.log abaixo mostrará o valor que FOI agendado para o próximo render,
                    // não o valor imediatamente após setShowAddExpense devido à natureza assíncrona do setState.
                    // Para ver o valor atualizado no render, usaremos outro log (Passo 2).
                    console.log(
                      "setShowAddExpense foi chamado com:",
                      !showAddExpense
                    ); // Novo Log

                    setShowAddParticipant(false);
                    setNewExpenseDescription("");
                    setNewExpenseAmount("");
                    setExpenseFormError("");
                    setExpenseFormSuccess("");
                  }}
                  className="bg-purple-600 text-white py-2 px-4 rounded-md mb-4 hover:bg-purple-700"
                >
                  {showAddExpense ? "Cancelar" : "Adicionar Despesa"}
                </button>

                {expenseFormError && (
                  <div className="bg-red-500 text-white p-3 rounded-md mb-4">
                    {expenseFormError}
                  </div>
                )}
                {expenseFormSuccess && (
                  <div className="bg-green-500 text-white p-3 rounded-md mb-4">
                    {expenseFormSuccess}
                  </div>
                )}

                {showAddExpense && (
                  <form
                    onSubmit={handleAddExpense}
                    className="mb-4 bg-[#282828] p-4 rounded-md"
                  >
                    {/* VERIFIQUE SE TODO ESTE CONTEÚDO INTERNO ESTÁ PRESENTE E CORRETO */}
                    <h4 className="text-white text-lg font-semibold mb-2">
                      Nova Despesa
                    </h4>

                    <input
                      type="text"
                      className="w-full p-3 bg-[#121212] text-white rounded-md mb-3"
                      placeholder="Descrição da Despesa"
                      value={newExpenseDescription}
                      onChange={(e) => setNewExpenseDescription(e.target.value)}
                    />

                    <input
                      type="number"
                      step="0.01"
                      className="w-full p-3 bg-[#121212] text-white rounded-md mb-3"
                      placeholder="Valor da Despesa"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                    />

                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading
                        ? "Adicionando..."
                        : "Adicionar Despesa ao Evento"}
                    </button>
                    {/* FIM DO CONTEÚDO INTERNO QUE DEVE ESTAR AQUI */}
                  </form>
                )}

             

{/* LISTA DE DESPESAS COM GRID E BOTÃO EXCLUIR */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
  {selectedEvent &&
  selectedEvent.expenses &&
  selectedEvent.expenses.length > 0
    ? selectedEvent.expenses.map((expense) => (
        <div
          key={expense._id} // _id do subdocumento despesa
          className="bg-[#121212] p-3 rounded-lg shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-grow mr-2">
              <h4 className="text-white font-medium truncate">
                {expense.description}
              </h4>
              <p className="text-[#BBBBBB] text-sm">
                Valor Total: R$ {parseFloat(expense.amount).toFixed(2)}
              </p>
              {selectedEvent.participants &&
                selectedEvent.participants.length > 0 && (
                  <p className="text-[#BBBBBB] text-xs italic">
                    (R$ {(
                      parseFloat(expense.amount) /
                      selectedEvent.participants.length
                    ).toFixed(2)}{" "}
                    por pessoa)
                  </p>
                )}
            </div>
            {/* BOTÃO DE EXCLUIR DESPESA CORRIGIDO */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Previne outros cliques se houver
                handleDeleteExpenseFromEvent(selectedEvent._id, expense._id);
              }}
              //className="bg-red-600 hover:bg-red-700 text-white font-bold p-1 rounded-full flex items-center justify-center flex-shrink-0"
              title="Excluir Despesa"
              style={{ width: '24px', height: '24px' }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="white" // Mantido fill="white" como você preferiu
                className="w-4 h-4" 
              >
                <path 
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {/* FIM DO BOTÃO DE EXCLUIR DESPESA */}
          </div>
        </div>
      ))
    : null}
</div>
{/* Mensagem para quando não há despesas */}
{selectedEvent &&
  selectedEvent.expenses &&
  selectedEvent.expenses.length === 0 &&
  !showAddExpense && ( 
    <p className="text-[#BBBBBB] mt-2">Nenhuma despesa ainda.</p>
  )}
                {/* Mensagem para quando não há despesas */}
                {selectedEvent &&
                  selectedEvent.expenses &&
                  selectedEvent.expenses.length === 0 &&
                  !showAddExpense && (
                    <p className="text-[#BBBBBB] mt-2">
                     
                    </p>
                  )}
              </div>
            </div>
          ) : (
            <div className="bg-[#1F1F1F] p-12 rounded-lg text-center w-full">
              <div className="text-[#BBBBBB] text-lg">
                Selecione um evento para ver os detalhes ou crie um novo.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEventsPage;
