// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação simples
    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos!');
      return;
    }

    try {
      // Enviar dados para o backend (login)
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      // Sucesso - redireciona para o dashboard
      console.log('Login bem-sucedido:', response.data);
      localStorage.setItem('token', response.data.token);
      // >>>>>>>>> MODIFICAÇÃO CHAVE AQUI <<<<<<<<<
      // Salva o role do usuário no localStorage para que ProtectedRoute possa acessá-lo
      localStorage.setItem('userRole', response.data.role); 
      // >>>>>>>>>>> FIM DA MODIFICAÇÃO <<<<<<<<<<<

      // Verifica o tipo de usuário e redireciona para o dashboard apropriado
      if (response.data.role === 'admin') {
        navigate('/admin-dashboard');  // Se for admin, vai para o dashboard do admin
      } else {
        navigate('/user-dashboard');  // Se for usuário, vai para o dashboard do usuário
      }

    } catch (error) {
      // Tratamento de erro aprimorado
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Erro ao fazer login. Tente novamente mais tarde.');
      }
      console.error('Erro de login:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#121212]">
      <div className="bg-[#1F1F1F] p-10 rounded-xl shadow-lg w-96">
        <div className="text-center text-white text-4xl font-semibold mb-8">
          <span className="font-extrabold text-[#A6A6A6]"><svg width="300" height="200" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="40" r="12" fill="#3498db"/>
    <rect x="70" y="60" width="60" height="10" fill="#3498db" rx="2"/>
    <circle cx="100" cy="90" r="12" fill="#3498db"/>
    <text x="100" y="130" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#A6A6A6" text-anchor="middle" font-weight="bold">RACHOMETRO</text>
</svg></span>
        </div>

        {/* Exibir mensagem de erro */}
        {errorMessage && (
          <div className="bg-red-500 text-white text-center py-2 mb-4 rounded-md">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo de Email */}
          <div className="mb-6">
            <label className="block text-[#BBBBBB] text-lg">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-[#222222] text-white placeholder-[#888888] rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
            />
          </div>
          
          {/* Campo de Senha */}
          <div className="mb-6">
            <label className="block text-[#BBBBBB] text-lg">Senha</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-[#222222] text-white placeholder-[#888888] rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
            />
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            className="w-full py-3 bg-[#A6A6A6] text-white font-bold rounded-md hover:bg-[#8C8C8C]"
          >
            Entrar
          </button>
        </form>
        
        {/* Link Criar Conta */}
        <div className="mt-6 text-center">
          <a href="/register" className="text-[#BBBBBB] hover:text-white">
            Não tem conta? Criar Conta
          </a>
        </div>

        {/* Link Recuperar Senha */}
        <div className="mt-4 text-center">
          <a href="/recover-password" className="text-[#BBBBBB] hover:text-white">
            Esqueceu a senha?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;