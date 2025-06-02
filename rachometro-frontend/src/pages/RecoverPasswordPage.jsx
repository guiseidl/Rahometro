// src/pages/RecoverPasswordPage.jsx
import React, { useState } from 'react';

const RecoverPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação simples
    if (!email) {
      setErrorMessage('Por favor, digite seu email!');
      return;
    }

    // Simulação de envio de link de recuperação
    console.log("Link de recuperação enviado para:", email);

    // Aqui você pode adicionar a lógica para enviar o email de recuperação (chamando uma API, por exemplo)
    setSuccessMessage('Link de recuperação de senha enviado para o seu email!');
    setErrorMessage('');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#121212]">
      <div className="bg-[#1F1F1F] p-10 rounded-xl shadow-lg w-96">
        <div className="text-center text-white text-4xl font-semibold mb-8">
          <span className="font-extrabold text-[#A6A6A6]">Recuperar Senha</span>
        </div>

        {/* Exibir mensagem de sucesso */}
        {successMessage && (
          <div className="bg-green-500 text-white text-center py-2 mb-4 rounded-md">
            {successMessage}
          </div>
        )}

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

          {/* Botão Enviar Link de Recuperação */}
          <button
            type="submit"
            className="w-full py-3 bg-[#A6A6A6] text-white font-bold rounded-md hover:bg-[#8C8C8C]"
          >
            Enviar Link de Recuperação
          </button>
        </form>

        {/* Link de Voltar para Login */}
        <div className="mt-6 text-center">
          <a href="/login" className="text-[#BBBBBB] hover:text-white">
            Voltar para login
          </a>
        </div>
      </div>
    </div>
  );
};

export default RecoverPasswordPage;
