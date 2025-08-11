# 🚀 DEPLOY MANUAL NO RENDER.COM

## Passos Simples (Sem Git)

### 1. Acesse o Render
1. Vá para: https://render.com
2. Clique em "Get Started" (se não tiver conta)
3. Crie conta com Google/GitHub ou email

### 2. Criar Web Service
1. No dashboard, clique "New +"
2. Selecione "Web Service"
3. Escolha "Build and deploy from a Git repository"

### 3. Upload via GitHub (Recomendado)
1. Crie repositório público no GitHub
2. Faça upload de todos os arquivos da pasta `academia`
3. No Render, conecte o repositório GitHub

### 4. Configurações no Render
```
Name: academia-pro
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### 5. Variáveis de Ambiente
Adicione estas variáveis no Render:
```
NODE_ENV=production
JWT_SECRET=sua-chave-secreta-super-forte-aqui
```

### 6. Deploy!
- Clique "Create Web Service"
- Aguarde o deploy (5-10 minutos)
- Sua URL será: https://academia-pro-XXXX.onrender.com

## 🔄 Alternative: Upload Direto (Zip)

Se preferir upload direto:
1. Compacte toda a pasta `academia` em ZIP
2. No Render, escolha "Deploy from uploaded files"
3. Faça upload do ZIP
4. Configure as mesmas variáveis de ambiente

## ✅ Teste Final
Após deploy, teste:
- https://sua-url.onrender.com/health
- Login Google/Demo
- Criar plano de treino

## 🆘 Troubleshooting
- Logs: Painel Render → "Logs"
- Rebuild: "Manual Deploy"
- Support: render.com/docs
