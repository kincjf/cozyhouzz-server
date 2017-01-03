@echo off

echo If using platform you use is linux, please execute .sh
echo And if change krpano version OR path, please re-write command in below

IF EXIST "%KRPANO_TOOL%" GOTO DONE

set TOOL=tools\krpano-1.18.5-win
set KRPANO_TOOl=%~dp0%TOOL%
set PATH=%PATH%;%KRPANO_TOOL%

:DONE
echo.
echo end.