# Academia Pro - Deploy Guide

## 🚀 Deploy no Render.com

### Pré-requisitos
1. Conta no GitHub
2. Conta no Render.com (gratuita)

### Passos para Deploy

#### 1. Subir código para GitHub
```bash
git init
git add .
git commit -m "Initial commit - Academia Pro"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/academia-pro.git
git push -u origin main
```

#### 2. Configurar no Render.com
1. Acesse [render.com](https://render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: academia-pro
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

#### 3. Variáveis de Ambiente
No painel do Render, adicione:
```
NODE_ENV=production
JWT_SECRET=sua-chave-secreta-muito-forte-aqui
```

#### 4. Deploy Automático
- O Render fará deploy automático a cada push no GitHub
- URL final: `https://academia-pro-XXXX.onrender.com`

## 🌐 Outras Opções de Deploy

### Railway.app
1. Acesse [railway.app](https://railway.app)
2. "Deploy from GitHub repo"
3. Configure as mesmas variáveis de ambiente

### Heroku (Pago)
```bash
heroku create academia-pro
git push heroku main
```

## 🔧 Configurações Importantes

### Banco de Dados
- Usa arquivo JSON local (incluído no deploy)
- Dados persistem durante a sessão
- Para produção real, considere MongoDB Atlas (gratuito)

### Domínio Personalizado
- Render: Configurar domínio customizado (pago)
- Cloudflare: DNS gratuito

## 📱 Acesso Final
Após deploy: `https://seu-app.onrender.com`

## 🛠️ Troubleshooting
- Logs: Painel do Render → "Logs"
- Health check: `/health`
- Rebuild: "Manual Deploy" no painel
