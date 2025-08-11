# ✅ ARQUIVOS ESSENCIAIS PARA RENDER

## Arquivos que DEVEM estar no upload:

### Raiz do projeto:
- `package.json` ⭐ (OBRIGATÓRIO)
- `server.js` ⭐ (OBRIGATÓRIO)
- `render.yaml` (opcional, mas recomendado)

### Frontend:
- `frontend/` (pasta completa)
  - `frontend/index.html`
  - `frontend/src/js/local-api.js`
  - `frontend/src/js/app.js`
  - `frontend/src/css/styles.css`

### Backend:
- `backend/` (pasta completa)
  - `backend/src/routes/` (todas as rotas)
  - `backend/src/services/`
  - `backend/src/middleware/`
  - `backend/src/database/db.json`
  - `backend/package.json`

### Documentação:
- `README.md`
- `RENDER-DEPLOY.md`

## ❌ NÃO incluir:
- `node_modules/` (será criado automaticamente)
- `.env` (usar variáveis do Render)
- `.git/` (só se não usar Git)

## 📦 Como fazer upload:
1. Selecione TODOS os arquivos listados acima
2. Compacte em ZIP (se necessário)
3. Upload no Render
