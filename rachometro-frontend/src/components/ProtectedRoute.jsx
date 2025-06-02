// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); // Pega o role salvo

  // 1. Verifica se há token
  if (!token) {
    console.log('ProtectedRoute: Sem token, redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  // 2. Verifica se há roles permitidos e se o role do usuário está entre eles
  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    console.log(`ProtectedRoute: Role do usuário '${userRole}' não permitido para esta rota. Roles permitidos: ${allowedRoles}. Redirecionando para /`);
    // Pode redirecionar para uma página de "acesso negado" ou para a home
    return <Navigate to="/" replace />;
  }

  // Se passou por todas as verificações, permite o acesso ao componente filho
  console.log(`ProtectedRoute: Acesso permitido para o role '${userRole}'`);
  return children;
};

export default ProtectedRoute;