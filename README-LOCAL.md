# 🏋️‍♂️ Academia Pro - Planejador de Treinos (100% Local)

Um aplicativo web moderno e científico para planejamento de treinos de academia, baseado em evidências e totalmente **gratuito e local** - sem necessidade de serviços externos pagos!

## 🌟 Características Principais

- ✅ **100% Local** - Funciona completamente offline
- ✅ **Sem serviços externos pagos** - Usa localStorage e JSON local (gratuitos)
- ✅ **Base científica** - Exercícios organizados por grupos musculares
- ✅ **Responsivo** - Funciona em desktop e mobile
- ✅ **Fácil de usar** - Interface intuitiva e moderna
- ✅ **Sem custos** - Nenhuma dependência paga
- ✅ **Dados privados** - Seus dados ficam no seu navegador

## 📁 Estrutura do Projeto

```
academia/
│
├── frontend/                 # Interface do usuário
│   ├── index.html            # Página principal
│   ├── src/
│   │   ├── css/
│   │   │   └── styles.css    # Estilos da aplicação
│   │   └── js/
│   │       ├── exerciseData.js    # Dados dos exercícios
│   │       └── app.js        # Lógica principal
│   └── package.json          # Dependências do frontend
│
├── backend/                  # API local (opcional)
│   ├── src/
│   │   ├── server.js         # Servidor Express
│   │   ├── database/
│   │   │   └── db.json       # Banco JSON local
│   │   ├── routes/           # Rotas da API
│   │   │   ├── exercises.js
│   │   │   ├── workouts-local.js
│   │   │   └── users-local.js
│   │   └── models/           # Modelos de dados
│   │       └── exercises.js
│   └── package.json          # Dependências do backend
│
├── docs/                     # Documentação
│   ├── Exercícios por porção muscular_.md
│   ├── Exercícios por porção muscular_.pdf
│   └── Exercícios por porção muscular_.docx
│
├── index-local.html          # Versão 100% local (principal)
├── index.html               # Versão original (legacy)
├── README.md
├── .gitignore
├── setup.sh                # Script de instalação Linux/Mac
└── setup.bat               # Script de instalação Windows
```

## 🚀 Como Usar

### Opção 1: Versão Simples (Apenas Frontend)

1. **Abra o arquivo `index-local.html` diretamente no navegador**
   - Funciona imediatamente
   - Dados salvos no localStorage
   - Não precisa de servidor

### Opção 2: Versão Completa (Frontend + Backend)

1. **Clone o repositório:**
   ```bash
   git clone <repository-url>
   cd academia
   ```

2. **Execute o script de instalação:**
   
   **Windows:**
   ```cmd
   setup.bat
   ```
   
   **Linux/Mac:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Inicie o backend (opcional):**
   ```bash
   cd backend
   npm run dev
   ```

4. **Inicie o frontend:**
   ```bash
   cd frontend
   npm start
   ```

## 🛠️ Funcionalidades

### Frontend
- ✅ Interface moderna e responsiva
- ✅ Seleção de dias da semana
- ✅ Exercícios organizados por grupo muscular
- ✅ Sistema de salvamento local (localStorage)
- ✅ Resumo visual dos treinos
- ✅ Sem necessidade de login/cadastro

### Backend (Opcional)
- ✅ API REST simples com Express.js
- ✅ Banco de dados JSON local
- ✅ CRUD de exercícios e treinos
- ✅ Sistema de usuários simples
- ✅ Autenticação JWT local

## 💾 Armazenamento de Dados

### LocalStorage (Frontend)
Os dados são salvos localmente no navegador:
- `academia_workouts` - Treinos salvos por dia
- `academia_user` - Dados do usuário (se usar login)
- `academia_preferences` - Preferências do usuário

### JSON Server (Backend)
Arquivo `backend/src/database/db.json` contém:
- `users` - Usuários cadastrados
- `workouts` - Treinos salvos
- `exercises` - Exercícios personalizados
- `progress` - Progresso do usuário

## 🔧 Tecnologias Utilizadas

### Frontend
- **HTML5/CSS3/JavaScript** - Base da aplicação
- **LocalStorage API** - Armazenamento local
- **Responsive Design** - Design adaptável

### Backend (Opcional)
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **JSON Server** - Banco de dados JSON
- **bcryptjs** - Hash de senhas
- **jsonwebtoken** - Autenticação JWT

## 📋 Como Funciona

1. **Selecione o dia da semana** que deseja planejar
2. **Escolha os exercícios** de cada grupo muscular
3. **Visualize o resumo** do seu treino
4. **Salve localmente** - dados ficam no seu navegador
5. **Acesse offline** - funciona sem internet

## 🆕 Novidades da Versão Local

- ❌ **Removido uso de serviço externo** - Simplificado para operação local
- ✅ **Adicionado localStorage** - Gratuito e simples
- ✅ **Adicionado JSON Server** - Banco local gratuito
- ✅ **Interface melhorada** - Mais moderna e rápida
- ✅ **Setup simplificado** - Scripts automáticos
- ✅ **Documentação completa** - Guias passo a passo

## 📖 Guia Científico

O aplicativo é baseado no guia científico incluído na pasta `docs/`, que contém:

- **Exercícios por grupo muscular** - Organizados anatomicamente
- **Divisão por porções** - Treino específico para cada parte
- **Base científica** - Fundamentado em literatura esportiva
- **Progressão lógica** - Do básico ao avançado

## 🔒 Privacidade

- ✅ **Dados locais** - Tudo fica no seu navegador
- ✅ **Sem tracking** - Não coletamos dados
- ✅ **Sem contas obrigatórias** - Use sem se cadastrar
- ✅ **Offline first** - Funciona sem internet

## 🤝 Contribuição

Este é um projeto open source! Contribuições são bem-vindas:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎯 Roadmap

- [ ] PWA (Progressive Web App)
- [ ] Sincronização com Google Drive (opcional)
- [ ] Calculadora de 1RM
- [ ] Gráficos de progresso
- [ ] Temporizador de descanso
- [ ] Mais exercícios no banco de dados

---

**Desenvolvido com ❤️ para a comunidade fitness brasileira**

# Academia Pro - Local (Guia de Execução)

Este README explica como executar a aplicação localmente sem serviços externos.

## Dependências
- Node.js 18+
- npm ou yarn

## Executando o backend

1. Entre na pasta do backend:
   ```powershell
   cd backend
   npm install
   npm run start
   ```

2. O backend inicializa um banco de dados local em `backend/src/database/db.json` e expõe as rotas em `http://localhost:3001` por padrão.

## Executando o frontend

1. No diretório raiz, abra `frontend/index.html` diretamente no navegador para a versão estática.
2. Para desenvolvimento com Vite (se aplicável ao frontend React):
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

## Observações
- Não é necessário configurar nenhum serviço externo. Todo o armazenamento é feito localmente.
- As credenciais de produção (JWT_SECRET) devem ser definidas via variáveis de ambiente ao publicar em um serviço como Render.

---
