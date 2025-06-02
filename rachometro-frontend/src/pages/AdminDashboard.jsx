// src/pages/DashboardPage.jsx (Admin ou Usuario)
import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');  // Remove o token ao fazer logout
    window.location.href = '/login';   // Redireciona para a página de login
  };

  return (
    <div className="bg-[#121212] min-h-screen flex flex-col">
      {/* Menu Superior com Perfil e Logout */}
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
          {/* Perfil no canto superior direito */}
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

      {/* Conteúdo do Dashboard - Centralização Horizontal dos Cards */}
      <div className="flex justify-center pt-8">  {/* Manter a centralização */}
        <div className="w-full max-w-6xl px-6 py-8 flex justify-between space-x-4"> {/* Alterado para usar flex em linha */}
          
          {/* Card Gerenciar Usuários */}
          <div className="bg-[#1F1F1F] p-6 rounded-lg shadow-lg text-center w-1/3">
            <h3 className="text-white text-xl mb-4">Gerenciar Usuários</h3>
            <p className="text-[#BBBBBB] mb-4">Aqui você pode ver todos os usuários e gerenciar suas permissões.</p>
            <Link to="/users" className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
              Ver Usuários
            </Link>
          </div>

          {/* Card Gerenciar Eventos */}
          <div className="bg-[#1F1F1F] p-6 rounded-lg shadow-lg text-center w-1/3">
            <h3 className="text-white text-xl mb-4">Gerenciar Eventos</h3>
            <p className="text-[#BBBBBB] mb-4">Aqui você pode gerenciar eventos criados por usuários.</p>
            <Link to="/events" className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
              Ver Eventos
            </Link>
          </div>

          {/* Card Relatórios */}
          <div className="bg-[#1F1F1F] p-6 rounded-lg shadow-lg text-center w-1/3">
            <h3 className="text-white text-xl mb-4">Relatórios</h3>
            <p className="text-[#BBBBBB] mb-4">Acesse relatórios sobre o desempenho do sistema.</p>
            <Link to="/reports" className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
              Ver Relatórios
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
