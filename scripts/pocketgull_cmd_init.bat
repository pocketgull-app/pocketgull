@echo off
rem PocketGull Circadian CMD Engine: Washi Rice Paper & Obsidian Ophthalmic

rem Parse current hour from %TIME%
set "RAW_TIME=%TIME: =0%"
for /f "tokens=1 delims=:" %%a in ("%RAW_TIME%") do (
    set /a "PG_HOUR=1%%a - 100"
)

rem Check daylight hours: 07:00 - 17:59 (7 AM to 6 PM)
if %PG_HOUR% GEQ 7 (
    if %PG_HOUR% LSS 18 (
        goto :washi
    )
)
goto :obsidian

:washi
title PocketGull Washi Rice Paper (CMD)
prompt $E[38;2;13;148;136m[WASHI POCKETGULL]$E[0m $E[38;2;217;119;6m$P$E[0m$E[38;2;13;148;136m$_$+$G$E[0m 
echo.
echo ===================================================================
echo        POCKETGULL WASHI RICE PAPER - CMD TERMINAL ENGINE           
echo ===================================================================
echo   Daylight Phase:  Washi Rice Paper (High Acuity Photopic Vision)
echo   Typeface:        PocketGull Mono
echo ===================================================================
echo.
goto :end

:obsidian
title PocketGull Obsidian Ophthalmic (CMD)
prompt $E[38;2;56;189;248m[OBSIDIAN POCKETGULL]$E[0m $E[38;2;16;185;129m$P$E[0m$E[38;2;56;189;248m$_$+$G$E[0m 
echo.
echo ===================================================================
echo       POCKETGULL OBSIDIAN OPHTHALMIC - CMD TERMINAL ENGINE         
echo ===================================================================
echo   Nightfall Phase: Obsidian Ophthalmic (Scotopic Melatonin Protection)
echo   Typeface:        PocketGull Mono
echo ===================================================================
echo.
goto :end

:end
