@echo off
echo 🚀 Inicializando Academia Pro - Versão 100% Local...

:: Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)

echo 📦 Instalando dependências do backend...
cd backend
call npm install
if exist .env.example (
    copy .env.example .env
)
echo ✅ Backend configurado!

echo 📦 Instalando dependências do frontend...
cd ..\frontend
call npm install
echo ✅ Frontend configurado!

cd ..

echo.
echo 🎉 Academia Pro configurado com sucesso!
echo.
echo 💾 VERSÃO LOCAL - OPEN SOURCE:
echo   ✅ Todos os dados salvos no navegador
echo   ✅ Funciona offline
echo   ✅ Sem custos
echo.
echo Para executar o projeto:
echo   1️⃣  Simples: Abra "index-local.html" no navegador
echo   2️⃣  Completo: 
echo       Frontend: cd frontend ^&^& npm run dev
echo       Backend:  cd backend ^&^& npm run dev
echo.
echo � Seus dados ficam privados no seu navegador!
pause
