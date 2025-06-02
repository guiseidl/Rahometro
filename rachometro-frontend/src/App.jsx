// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RecoverPasswordPage from "./pages/RecoverPasswordPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ManageEventsPage from "./pages/ManageEventsPage";
import ProtectedRoute from "./components/ProtectedRoute"; 
import ViewUserEventsPage from './pages/ViewUserEventsPage';

// Componente de Teste Simples
const TestPage = () => {
  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        fontSize: "24px",
        color: "white",
        backgroundColor: "#333",
        minHeight: "100vh",
      }}
    >
      <h1>Esta é uma página de teste direta!</h1>
      <p>Se você consegue ver isso, o roteamento básico está funcionando.</p>
      <a href="/" style={{ color: "#888", textDecoration: "underline" }}>
        Voltar para Home
      </a>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota de Teste Direta */}
        <Route path="/teste" element={<TestPage />} />{" "}
        {/* <-- Adicione esta linha */}
        {/* Rotas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recover-password" element={<RecoverPasswordPage />} />
        {/* Rotas Protegidas - Dashboards */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        {/* Rotas Protegidas - Eventos (Admin) */}
        <Route
          path="/events"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageEventsPage />
            </ProtectedRoute>
          }
        />
        {/* Rota para detalhes de um evento específico */}
        <Route
          path="/events/:eventId"
          element={
            <ProtectedRoute>
              {/* ESTE COMPONENTE SERÁ CRIADO NA PRÓXIMA ETAPA IMPORTANTE DO RACHÔMETRO */}
              <div>Página de Detalhes do Evento (Em Construção)</div>
              {/* <EventDetailPage /> */}
            </ProtectedRoute>
          }
        />
        {/* Rota para 'Gerenciar Usuários' (apenas para Admin) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              {/* <ManageUsersPage /> */}
              <div>Página de Gerenciar Usuários (Em Construção)</div>
            </ProtectedRoute>
          }
        />
        {/* Redirecionar qualquer rota não encontrada para a homepage (ou login se não estiver logado) */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/my-events"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              {" "}
              {/* Ou apenas ['user'] */}
              <ViewUserEventsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
