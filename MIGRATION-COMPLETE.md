# Academia Pro - Arquitetura Local (100% Free)

## ✅ **MIGRAÇÃO COMPLETA - 100% LOCAL**

Seu projeto foi completamente migrado de um serviço externo para uma solução 100% local e gratuita!

O backend agora utiliza um banco de dados JSON local (`backend/src/database/db.json`) e a autenticação é feita com JWT local.

Benefícios:
- ✅ Sem custos extras
- ✅ Fácil de hospedar (Render, Heroku, etc.)
- ✅ Arquivos simples de configurar via variáveis de ambiente

## 🏗️ **Nova Arquitetura**

### Backend (Node.js + Express)
- **Servidor**: Express.js rodando na porta 3000
- **Banco de dados**: JSON file-based (sem dependências externas)
- **Autenticação**: JWT tokens (jsonwebtoken)
- **Senhas**: Criptografadas com bcryptjs
- **APIs**: RESTful endpoints para autenticação e dados

### Frontend (Vanilla JS)
- **Servidor**: http-server na porta 3000
- **Autenticação**: Local API client 
- **Dados**: Requisições HTTP para backend local
- **Persistência**: Backend + localStorage como fallback

## 🔧 **Como Usar**

### 1. Iniciar Backend
```bash
cd backend
npm install
npm start
# Servidor roda em http://localhost:3000
```

### 2. Iniciar Frontend
```bash
cd frontend  
npm install
npm run dev
# App roda em http://localhost:3000
```

### 3. Scripts Automáticos
```bash
# Windows
./setup.bat

# Linux/Mac
./setup.sh
```

## 🔐 **API Endpoints**

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/demo` - Login demo

### Treinos
- `GET /api/workouts` - Buscar planos
- `POST /api/workouts/:day` - Salvar treino do dia
- `DELETE /api/workouts/:day` - Deletar treino
- `GET /api/workouts/stats` - Estatísticas

### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil

## 💾 **Banco de Dados**

O arquivo `backend/src/database/db.json` armazena todos os dados:
```json
{
  "users": [...],           // Usuários registrados
  "users_uid_plans": [...], // Planos de treino por usuário
  "exercises": [...]        // Exercícios disponíveis
}
```

## 🔒 **Segurança**

- Senhas hasheadas com bcryptjs
- JWT tokens para autenticação
- CORS configurado para frontend
- Headers de segurança com helmet

## ✨ **Vantagens da Nova Arquitetura**

- ✅ **100% Gratuito** - Sem custos adicionais
- ✅ **Offline-first** - Funciona sem internet
- ✅ **Controle total** - Você possui todos os dados
- ✅ **Fácil deploy** - Qualquer servidor Node.js
- ✅ **Sem vendor lock-in** - Independente de terceiros
- ✅ **Open source** - Código totalmente aberto

## 🚀 **Próximos Passos**

1. Teste o login demo
2. Crie planos de treino
3. Personalize exercícios
4. Deploy em seu servidor preferido

## 📧 **Suporte**

Se encontrar algum problema, verifique:
1. Backend rodando na porta 3000
2. Frontend acessível 
3. Logs do console para erros
4. Arquivo db.json com permissões corretas

**Parabéns! Sua aplicação agora é 100% independente e gratuita! 🎉**
