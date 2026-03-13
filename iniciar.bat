@echo off
chcp 65001 >nul
title Blackmoor Hall

echo.
echo  BLACKMOOR HALL - Servidor local
echo  ================================
echo.
echo  1. Iniciar normalmente
echo  2. Limpiar cache (usar si algo no funciona)
echo.
set /p OPCION="Elige opcion (1 o 2): "

cd /d "%~dp0"

:: Detectar Python
set PYTHON=
where python >nul 2>&1
if %errorlevel% == 0 set PYTHON=python

if "%PYTHON%"=="" (
    where python3 >nul 2>&1
    if %errorlevel% == 0 set PYTHON=python3
)

if "%PYTHON%"=="" (
    echo.
    echo  ERROR: Python no encontrado.
    echo  Instala Python desde https://www.python.org/downloads/
    echo  Marca "Add Python to PATH" al instalar.
    echo.
    pause
    exit /b 1
)

if "%OPCION%"=="2" (
    echo.
    echo  Abriendo pagina de reset...
    start http://localhost:8080/reset.html
    %PYTHON% -m http.server 8080
    pause
    exit /b
)

echo.
echo  Servidor en http://localhost:8080
echo  Cierra esta ventana para detener el servidor.
echo.
start http://localhost:8080
%PYTHON% -m http.server 8080
pause
