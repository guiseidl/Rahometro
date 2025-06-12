# Rachômetro 💸

Rachômetro é uma aplicação web full-stack projetada para simplificar o gerenciamento e a divisão de despesas em eventos sociais. Seja um churrasco, uma viagem ou um jantar em grupo, o Rachômetro ajuda a registrar os gastos e a dividir os custos de forma justa e transparente entre os participantes.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando uma stack de tecnologias modernas, dividida entre Frontend e Backend.

**Frontend:**
* **React:** Biblioteca para construção da interface de usuário.
* **Vite:** Ferramenta de build e servidor de desenvolvimento para o frontend.
* **React Router DOM:** Para gerenciamento de rotas e navegação na SPA (Single Page Application).
* **Tailwind CSS:** Framework CSS "utility-first" para estilização rápida, customizada e responsiva.
* **Axios:** Cliente HTTP para fazer as requisições à API do backend.

**Backend:**
* **Node.js:** Ambiente de execução JavaScript no lado do servidor.
* **Express.js:** Framework para construção da API RESTful e gerenciamento de rotas.
* **MongoDB:** Banco de dados NoSQL para armazenamento de dados.
* **Mongoose:** ODM (Object Data Modeling) para modelar os dados da aplicação e interagir com o MongoDB.
* **JSON Web Tokens (JWT):** Para autenticação e proteção de rotas da API.
* **bcrypt.js:** Para criptografia (hashing) de senhas.
* **express-validator:** Para validação de dados no lado do servidor.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas na sua máquina:
* **Node.js** (versão 18.x ou superior recomendada)
* **npm** ou **yarn** (gerenciador de pacotes Node.js)
* **MongoDB:** Você pode instalar o MongoDB localmente ou usar uma instância gratuita na nuvem do [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).

---

## ⚙️ Instalação e Execução

O projeto é dividido em duas pastas principais: `rachometro-backend` e `rachometro-frontend`. Siga os passos abaixo para cada uma delas.

### 1. Configuração do Backend

Primeiro, vamos configurar o servidor.

1.  **Navegue até a pasta do backend:**
    ```bash
    cd rachometro-backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Crie um arquivo de variáveis de ambiente:**
    * Crie um arquivo chamado `.env` na raiz da pasta `rachometro-backend`.
    * Adicione as seguintes variáveis a este arquivo, substituindo pelos seus próprios valores:
        ```env
        # Porta em que o servidor irá rodar
        PORT=5000

        # String de conexão do seu banco de dados MongoDB
        MONGO_URI=mongodb+srv://<user>:<password>@cluster.../rachometroDB?retryWrites=true&w=majority

        # Chave secreta para gerar os tokens JWT (pode ser qualquer string segura)
        JWT_SECRET=suaChaveSecretaMuitoSegura

        # URL do seu frontend (para configuração do CORS)
        CLIENT_URL=http://localhost:5173
        ```
    * **Importante:** Se você estiver usando o MongoDB Atlas, obtenha a `MONGO_URI` no painel do seu cluster.

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    * (Este comando geralmente usa `nodemon` para reiniciar o servidor automaticamente a cada alteração. Se você não configurou um script "dev", pode usar `npm start` ou `node server.js`).

O seu servidor backend deverá estar rodando em `http://localhost:5000`.

### 2. Configuração do Frontend

Agora, vamos configurar a interface do usuário.

1.  **Abra um novo terminal e navegue até a pasta do frontend:**
    ```bash
    cd rachometro-frontend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Execute o servidor de desenvolvimento do Vite:**
    ```bash
    npm run dev
    ```

A sua aplicação React deverá estar rodando em `http://localhost:5173` e se conectará automaticamente ao backend que está na porta 5000.

---

## ✨ Principais Funcionalidades

* **Autenticação de Usuários:** Sistema completo de registro e login com diferenciação de papéis (Admin vs. Usuário Comum).
* **Gerenciamento de Eventos (Admin):** Criação, edição e exclusão de eventos.
* **Gerenciamento de Participantes (Admin):** Adição de participantes a um evento (com sugestão de usuários existentes) e remoção.
* **Gerenciamento de Despesas (Admin):** Adição e exclusão de despesas em um evento.
* **Interface Responsiva:** O design se adapta a diferentes tamanhos de tela.

## 🔮 Próximos Passos (Roadmap)

* Implementar a gestão completa de pagamentos na interface, permitindo que usuários marquem suas partes como pagas.
* Desenvolver a página de detalhes do evento dedicada (`/events/:eventId`).
* Criar a lógica principal do "Rachômetro": o cálculo e a exibição de "quem deve para quem".
* Desenvolver as páginas de perfil de usuário e gerenciamento de usuários para admins.

---
