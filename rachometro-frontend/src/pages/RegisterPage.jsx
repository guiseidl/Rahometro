// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Usando o Axios para requisições HTTP

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação de campos
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem!');
      return;
    }

    try {
      // Enviando dados para o backend para criar um novo usuário
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });

      // Caso o cadastro seja bem-sucedido
      console.log('Usuário registrado com sucesso:', response.data);
      setSuccessMessage('Cadastro realizado com sucesso! Você será redirecionado para o login.');

      // Redirecionar para a página de login após sucesso
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redireciona após 2 segundos

    } catch (error) {
      // Caso ocorra algum erro
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Erro ao cadastrar usuário');
      } else {
        setErrorMessage('Erro ao realizar cadastro. Tente novamente.');
      }
      console.error('Erro ao registrar usuário:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#121212]">
      <div className="bg-[#1F1F1F] p-10 rounded-xl shadow-lg w-96">
        <div className="text-center text-white text-4xl font-semibold mb-8">
          <div className="text-center text-white text-4xl font-semibold mb-8">
          <span className="font-extrabold text-[#A6A6A6]"><svg width="300" height="200" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="40" r="12" fill="#3498db"/>
    <rect x="70" y="60" width="60" height="10" fill="#3498db" rx="2"/>
    <circle cx="100" cy="90" r="12" fill="#3498db"/>
    <text x="100" y="130" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#A6A6A6" text-anchor="middle" font-weight="bold">RACHOMETRO</text>
</svg></span>
        </div>
        </div>

        {/* Mensagens de Sucesso e Erro */}
        {errorMessage && (
          <div className="bg-red-500 text-white text-center py-2 mb-4 rounded-md">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-500 text-white text-center py-2 mb-4 rounded-md">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo de Nome */}
          <div className="mb-6">
            <label className="block text-[#BBBBBB] text-lg">Nome</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#222222] text-white placeholder-[#888888] rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
            />
          </div>

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

          {/* Campo de Confirmação de Senha */}
          <div className="mb-6">
            <label className="block text-[#BBBBBB] text-lg">Confirmar Senha</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-[#222222] text-white placeholder-[#888888] rounded-md"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
            />
          </div>

          {/* Botão Criar Conta */}
          <button
            type="submit"
            className="w-full py-3 bg-[#A6A6A6] text-white font-bold rounded-md hover:bg-[#8C8C8C]"
          >
            Criar Conta
          </button>
        </form>

        {/* Link para Login */}
        <div className="mt-6 text-center">
          <a href="/login" className="text-[#BBBBBB] hover:text-white">
            Já tem conta? Faça login
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
