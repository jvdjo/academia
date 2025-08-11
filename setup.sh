#!/bin/bash

echo "🚀 Inicializando Academia Pro - Versão 100% Local..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

echo "📦 Instalando dependências do backend..."
cd backend
npm install
if [ -f ".env.example" ]; then
    cp .env.example .env
fi
echo "✅ Backend configurado!"

echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install
echo "✅ Frontend configurado!"

cd ..

echo ""
echo "🎉 Academia Pro configurado com sucesso!"
echo ""
echo "💾 VERSÃO LOCAL - OPEN SOURCE:"
echo "   ✅ Todos os dados salvos no navegador"
echo "   ✅ Funciona offline"
echo "   ✅ Sem custos"
echo ""
echo "Para executar o projeto:"
echo "   1️⃣  Simples: Abra 'index-local.html' no navegador"
echo "   2️⃣  Completo:"
echo "       Frontend: cd frontend && npm run dev"
echo "       Backend:  cd backend && npm run dev"
echo ""
echo "� Seus dados ficam privados no seu navegador!"
