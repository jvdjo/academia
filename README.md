# 🏋️‍♂️ Academia Pro - 100% Local e Gratuito

Sistema completo para planejamento de treinos de academia baseado no **Guia Mestre de Hipertrofia**. 

## 🎯 **VERSÃO TOTALMENTE LOCAL - OPEN SOURCE**

Esta versão funciona **100% offline e gratuita**, usando:
- ✅ **localStorage** para persistência de dados no navegador
- ✅ **JSON Server** para API local (opcional)
- ✅ **Sem custos** - Zero dependências de serviços pagos
- ✅ **Sem limites** - Usuários e dados ilimitados
- ✅ **Privacidade total** - Seus dados ficam no seu computador

## 📁 Estrutura do Projeto

```
academia/
├── frontend/                 # Interface do usuário (Vanilla JS)
│   ├── src/
│   │   ├── css/styles.css   # Estilos modernos
│   │   └── js/
│   │       ├── app.js       # App principal (localStorage)
│   │       ├── exerciseData.js # Base de exercícios
│   │       └── local-api.js        # API local (backend + localStorage)
│   └── index.html           # Página principal
│
├── backend/                  # API local (Node.js + Express)
│   ├── src/
│   │   ├── database/db.json # Banco de dados JSON
│   │   ├── routes/          # APIs locais (backend Node.js)
│   │   └── server.js        # Servidor local
│   └── package.json         # Dependências (Node.js + Express)
│
├── docs/                     # Guias científicos
└── setup.bat / setup.sh     # Scripts de instalação
```

## ⚡ Instalação Rápida

### Opção 1: Apenas Frontend (Recomendado) 
**Funciona imediatamente, sem instalação!**

```bash
# 1. Navegue até a pasta frontend/
# 2. Abra index.html no navegador
# 3. Pronto! Dados salvos automaticamente no navegador
```

### Opção 2: Frontend + Backend Local

**Windows:**
```cmd
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

## 🚀 Como Usar

### Modo Simples (Só Frontend)
1. Vá em `frontend/` e abra `index.html` no navegador
2. Crie seus treinos - tudo é salvo automaticamente
3. Funciona offline e sem internet

### Modo Completo (Com Backend)
1. Execute o script de setup para sua plataforma
2. Backend API: `http://localhost:3000`
3. JSON Server: `http://localhost:3001` 
4. Frontend: Abra `frontend/index.html`

## 🎯 Funcionalidades

### ✅ Frontend (100% Local)
- **Planejamento Semanal**: Crie treinos para cada dia da semana
- **Biblioteca de Exercícios**: Mais de 200 exercícios por grupo muscular
- **Persistência Automática**: Dados salvos no localStorage
- **Interface Moderna**: Design responsivo e intuitivo
- **Offline First**: Funciona sem internet
- **Zero Configuração**: Abra e use

### ✅ Backend (Opcional)
- **API REST**: Endpoints completos para treinos/exercícios
- **Autenticação Local**: JWT + bcrypt (sem serviços externos)
- **Banco JSON**: Arquivo simples, sem SQL
- **Multi-usuário**: Suporte a vários usuários localmente

## 📊 Dados dos Exercícios

Base científica com **200+ exercícios** organizados por:

- **Peitorais**: Superior, médio, inferior
- **Costas**: Latíssimo, romboides, trapézio
- **Ombros**: Anterior, médio, posterior
- **Braços**: Bíceps, tríceps, antebraços
- **Pernas**: Quadríceps, posterior, glúteos, panturrilhas
- **Core**: Abdominais, lombar

## 🛠️ Tecnologias (100% Gratuitas)

### Frontend
- **HTML5/CSS3**: Interface moderna
- **Vanilla JavaScript**: Sem frameworks pesados
- **localStorage**: Persistência local
- **Responsivo**: Funciona em mobile/desktop

### Backend (Opcional)
- **Node.js + Express**: Servidor leve
- **JSON Server**: "Banco de dados" em arquivo
- **JWT + bcrypt**: Autenticação segura local
- **CORS**: Comunicação frontend/backend

## 🔧 Scripts Disponíveis

### Frontend
```bash
# Apenas abra index.html - não precisa de scripts!
```

### Backend
```bash
cd backend
npm install        # Instalar dependências
npm start          # Servidor em produção
npm run dev        # Servidor em desenvolvimento  
npm run json-server # JSON Server separado
```

## 📱 Recursos da Interface

- ✅ **Seleção de Dias**: Planeje treinos para qualquer dia da semana
- ✅ **Grupos Musculares**: Organize por região corporal
- ✅ **Busca Rápida**: Encontre exercícios facilmente
- ✅ **Progresso Visual**: Acompanhe seus treinos
- ✅ **Exportação**: Salve seus planos (localStorage)

## 🔒 Privacidade e Segurança

- **Dados Locais**: Tudo fica no seu computador
- **Sem Tracking**: Zero coleta de dados
- **Offline**: Funciona sem internet
- **Código Aberto**: Veja exatamente o que faz
- **Sem Contas**: Use sem criar perfis online

## 🆚 Comparação com Versões Online

| Característica | Academia Pro Local | Apps Online |
|---|---|---|
| **Custo** | Gratuito | Assinaturas mensais |
| **Privacidade** | 100% Local | Dados na nuvem |
| **Internet** | Opcional | Obrigatória |
| **Limites** | Nenhum | Planos pagos |
| **Velocidade** | Instantâneo | Depende da conexão |
| **Personalização** | Total | Limitada |

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja `LICENSE` para mais detalhes.

## 🔄 Atualizações

- **v1.0.0**: Versão inicial
- **v2.0.0**: **Versão 100% local - sem dependências externas** ⭐
- Banco de dados JSON local
- localStorage para persistência
- Remoção de todas as dependências pagas
- Scripts de setup automatizados

---

**💡 Dica**: Para máxima simplicidade, use apenas o frontend! Abra `frontend/index.html` e comece a treinar. Seus dados ficarão salvos no navegador automaticamente.
