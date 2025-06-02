// src/pages/HomePage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate

function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Se não houver token, redireciona para a página de login
    if (!token) {
      navigate('/login');
    } else {
      // Opcional: Se houver token, você pode querer redirecionar para um dashboard
      // dependendo da lógica do seu aplicativo (ex: buscar o role do usuário)
      // Por enquanto, vamos manter a lógica atual de "logado"
    }
  }, [token, navigate]); // Adicione 'navigate' como dependência

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#121212] text-white">
      <div className="text-center p-8 bg-[#1F1F1F] rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Bem-vindo ao Rachômetro!</h2>
        {token ? (
          <div>
            <p className="text-lg">Você está logado!</p>
            <p className="text-md mt-2">Redirecionando para o dashboard...</p>
            {/* Você pode adicionar um Spinner ou uma mensagem mais elaborada aqui */}
          </div>
        ) : (
          <div>
            <p className="text-lg">Por favor, faça login para continuar.</p>
            <p className="text-md mt-2">Redirecionando para a página de login...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;