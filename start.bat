@echo off
echo ==============================================
echo Demarrage de l'application Convertisseur d'Unites
echo ==============================================
start "Backend - Node.js" cmd /k "cd backend && node server.js"
start "Frontend - React Vite" cmd /k "cd frontend && npm run dev"
echo Backend accessible sur : http://localhost:5000
echo Frontend accessible sur : http://localhost:3000
