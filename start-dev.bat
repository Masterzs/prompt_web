@echo off
cd /d %~dp0
set NODE_ENV=development
npm run dev
pause

