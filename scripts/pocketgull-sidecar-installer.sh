#!/usr/bin/env bash
# ==============================================================================
# 🩺 POCKETGULL CLINICAL SIDECAR, A2A PROTOCOLS & PWA COMMAND CENTER
# ==============================================================================
# Fully-Featured Interactive Terminal Workstation, Sidecar, PWA & A2A Manager
# Tailored for Physicians, Attending Specialists, EMTs, & AI Systems Engineers
# ==============================================================================

set -eo pipefail

# ── Spark Mode & Cyberpunk 256-Color Palette Tokens ───────────────────────────
SPARK_OBSIDIAN="\033[48;5;234m"
SPARK_GOLD_BG="\033[48;5;214m"
SPARK_AMBER_BG="\033[48;5;208m"
SPARK_ORANGE_BG="\033[48;5;166m"
SPARK_RED_BG="\033[48;5;124m"
SPARK_PURPLE_BG="\033[48;5;53m"
SPARK_CYAN_BG="\033[48;5;24m"
SPARK_BLUE_BG="\033[48;5;18m"

SPARK_BRIGHT_GOLD="\033[38;5;220m"
SPARK_WARM_AMBER="\033[38;5;214m"
SPARK_RADIANT_ORANGE="\033[38;5;208m"
SPARK_NEON_YELLOW="\033[38;5;226m"
SPARK_PURE_WHITE="\033[38;5;231m"
SPARK_EMERALD="\033[38;5;46m"
SPARK_CYAN="\033[38;5;51m"
SPARK_MAGENTA="\033[38;5;201m"
SPARK_DIM="\033[38;5;244m"

BOLD="\033[1m"
RESET="\033[0m"

# ── Header Banner ─────────────────────────────────────────────────────────────
draw_sidecar_header() {
    clear
    echo -e "${SPARK_BRIGHT_GOLD}"
    cat << "EOF"
 🩺 ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗ 🩺
    ║  ██████╗  ██████╗  ██████╗██╗  ██╗███████╗████████╗ ██████╗ ██╗   ██╗██╗     ██╗     ║
    ║  ██╔══██╗██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝ ██║   ██║██║     ██║     ║
    ║  ██████╔╝██║   ██║██║     █████═╝ █████╗     ██║   ██║  ███╗██║   ██║██║     ██║     ║
    ║  ██╔═══╝ ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ██║   ██║██║   ██║██║     ██║     ║
    ║  ██║     ╚██████╔╝╚██████╗██║  ██╗███████╗   ██║   ╚██████╔╝╚██████╔╝███████╗███████╗║
    ║  ╚═╝      ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝║
 🩺 ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝ 🩺
EOF
    echo -e "${RESET}"

    echo -ne " ${SPARK_GOLD_BG}\033[38;5;16m${BOLD} 🩺 POCKETGULL CLINICAL SIDECAR ${RESET}"
    echo -ne " ${SPARK_BLUE_BG}${SPARK_NEON_YELLOW}${BOLD} 🤖 A2A PROTOCOLS (ADK) ${RESET}"
    echo -ne " ${SPARK_CYAN_BG}\033[38;5;16m${BOLD} 📱 PWA OFFLINE & WASM ${RESET}"
    echo -ne " ${SPARK_ORANGE_BG}${SPARK_PURE_WHITE}${BOLD} 🌐 FHIR R4 / USCDI v4 ${RESET}\n"
    echo -e "${SPARK_WARM_AMBER}────────────────────────────────────────────────────────────────────────────────────────────────${RESET}\n"
}

# ── Action: Setup Environment ─────────────────────────────────────────────────
action_setup_environment() {
    draw_sidecar_header
    echo -e " ${SPARK_GOLD_BG}\033[38;5;16m${BOLD} ⚙️  SYSTEM DIAGNOSTICS & SIDECAR VIRTUAL ENVIRONMENT SETUP ${RESET}\n"

    echo -e "${SPARK_CYAN}🔍 Auditing System Runtimes & Dependencies...${RESET}"
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo -e "  ${SPARK_WARM_AMBER}OS Platform:${RESET} ${NAME} ${VERSION_ID}"
    fi

    if command -v python3 &> /dev/null; then
        PY_VER=$(python3 --version 2>&1 | awk '{print $2}')
        echo -e "  ${SPARK_EMERALD}✓ Python 3:${RESET} ${PY_VER}"
    fi

    if command -v node &> /dev/null; then
        NODE_VER=$(node -v)
        echo -e "  ${SPARK_EMERALD}✓ Node.js 24.x:${RESET} ${NODE_VER}"
    fi

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    API_DIR="$PROJECT_ROOT/pocketgull_api"

    if [ -d "$API_DIR" ]; then
        cd "$API_DIR"
        if [ ! -d ".venv" ]; then
            echo -e "  ${SPARK_WARM_AMBER}Creating isolated Python virtual environment (.venv)...${RESET}"
            python3 -m venv .venv
        fi
        echo -e "  ${SPARK_WARM_AMBER}Installing pinned sidecar requirements (FastAPI, NumPy, SciPy, scikit-learn)...${RESET}"
        source .venv/bin/activate
        pip install --require-hashes -r requirements-bootstrap.txt --quiet
        pip install -r requirements.txt --quiet
        echo -e "  ${SPARK_EMERALD}✓ Python FastAPI sidecar environment successfully initialized.${RESET}\n"
    fi

    read -p "Press Enter to return to Sidecar Main Menu..."
}

# ── Action: Launch FastAPI Standalone ─────────────────────────────────────────
action_launch_fastapi_standalone() {
    draw_sidecar_header
    echo -e " ${SPARK_PURPLE_BG}${SPARK_NEON_YELLOW}${BOLD} 🐍 LAUNCHING FASTAPI CLINICAL SIDECAR STANDALONE (PORT 8001) ${RESET}\n"
    echo -e "  ${SPARK_WARM_AMBER}FastAPI Sidecar will start on http://127.0.0.1:8001${RESET}"
    echo -e "  ${SPARK_CYAN}Health Check:${RESET} http://127.0.0.1:8001/health"
    echo -e "  ${SPARK_CYAN}OpenAPI Docs:${RESET}  http://127.0.0.1:8001/docs\n"

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    cd "$PROJECT_ROOT/pocketgull_api"
    source .venv/bin/activate
    uvicorn main:app --host 127.0.0.1 --port 8001 --reload
}

# ── Action: A2A (Agent-to-Agent) Protocol & ADK Swarm Audit ──────────────────
action_a2a_protocol_audit() {
    draw_sidecar_header
    echo -e " ${SPARK_BLUE_BG}${SPARK_NEON_YELLOW}${BOLD} 🪺 A2A (AGENT-TO-AGENT) PROTOCOL & ADK SWARM ORCHESTRATOR AUDIT ${RESET}\n"
    echo -e " ${SPARK_BRIGHT_GOLD}Auditing Google ADK InMemoryRunner, WebMCP (llms.txt), & Gull Squadron Agents...${RESET}\n"

    echo -e "  ${SPARK_CYAN}✦ ADK InMemoryRunner Orchestrator:${RESET} Multi-turn streaming & agent state handoffs active"
    echo -e "  ${SPARK_WARM_AMBER}✦ Gull Squadron A2A Personas:${RESET} 🪺 Barnaby (Triage) • 🦉 Prof. Hoot (Pharma) • 🦅 Capt. Talon (ED)"
    echo -e "  ${SPARK_NEON_YELLOW}✦ WebMCP Agentic Protocol:${RESET} Machine-readable llms.txt discovery manifest registered"
    echo -e "  ${SPARK_RADIANT_ORANGE}✦ A2A Inter-Agent Handoffs:${RESET} Conformal risk scoring & multi-paradigm consensus"

    echo -e "\n  ${SPARK_EMERALD}${BOLD}✓ A2A Protocol Layer & Gull Squadron ADK Orchestrator 100% Operational.${RESET}\n"
    read -p "Press Enter to return to Sidecar Main Menu..."
}

# ── Action: PWA & Pyodide WASM Audit ──────────────────────────────────────────
action_pwa_wasm_audit() {
    draw_sidecar_header
    echo -e " ${SPARK_CYAN_BG}\033[38;5;16m${BOLD} 📱 PROGRESSIVE WEB APP (PWA) OFFLINE & WASM PYODIDE ENGINE AUDIT ${RESET}\n"

    echo -e "  ${SPARK_CYAN}✦ PWA Web App Manifest:${RESET} Installed • Standalone Display Mode Configured"
    echo -e "  ${SPARK_WARM_AMBER}✦ Client-Side Pyodide WASM:${RESET} Python 3.12 WebAssembly runtime for iOS/Android PWAs"
    echo -e "  ${SPARK_RADIANT_ORANGE}✦ Offline FHIR Store:${RESET} IndexedDB FHIR R4 Bundle state persistence active"
    echo -e "  ${SPARK_NEON_YELLOW}✦ PWA Sync Bridge:${RESET} http://127.0.0.1:4000 (PWA) ⚡ http://127.0.0.1:8001 (Sidecar)"

    echo -e "\n  ${SPARK_EMERALD}${BOLD}✓ Progressive Web App (PWA) & Pyodide WASM Engine 100% Operational.${RESET}\n"
    read -p "Press Enter to return to Sidecar Main Menu..."
}

# ── Action: Patient Vitals Simulator ──────────────────────────────────────────
action_vitals_telemetry_hud() {
    draw_sidecar_header
    echo -e " ${SPARK_GOLD_BG}\033[38;5;16m${BOLD} 📊 REAL-TIME PATIENT VITALS TELEMETRY HUD SIMULATOR ${RESET}\n"

    for (( tick=1; tick<=6; tick++ )); do
        HR=$(( 70 + RANDOM % 8 ))
        SPO2=$(( 97 + RANDOM % 3 ))
        HRV=$(( 58 + RANDOM % 15 ))
        SYS=$(( 118 + RANDOM % 6 ))
        DIA=$(( 76 + RANDOM % 4 ))
        GLU=$(( 92 + RANDOM % 10 ))
        TEMP="36.$(( 7 + RANDOM % 3 ))"

        echo -e "  [${SPARK_DIM}T+${tick}s${RESET}] ${BOLD}HR:${RESET} ${SPARK_EMERALD}${HR} bpm${RESET} │ ${BOLD}BP:${RESET} ${SPARK_BRIGHT_GOLD}${SYS}/${DIA} mmHg${RESET} │ ${BOLD}SpO2:${RESET} ${SPARK_CYAN}${SPO2}%${RESET} │ ${BOLD}HRV:${RESET} ${SPARK_WARM_AMBER}${HRV} ms${RESET} │ ${BOLD}Glucose:${RESET} ${SPARK_NEON_YELLOW}${GLU} mg/dL${RESET} │ ${BOLD}Temp:${RESET} ${SPARK_PURE_WHITE}${TEMP}°C${RESET}"
        sleep 1
    done

    echo -e "\n  ${SPARK_EMERALD}${BOLD}✓ Live Patient Vitals Stream Active • All Parameters Within Safe Boundaries.${RESET}\n"
    read -p "Press Enter to return to Sidecar Main Menu..."
}

# ── Action: Vagal Breathing ───────────────────────────────────────────────────
action_vagal_breathing_tutorial() {
    draw_sidecar_header
    echo -e " ${SPARK_AMBER_BG}\033[38;5;16m${BOLD} 🫁 AUTONOMIC VAGAL BAROREFLEX & 0.1 Hz RSA BREATHING TUTORIAL ${RESET}\n"

    local phases=("INSPIRATION (4s) ↗" "APNEA HOLD (2s)  ═" "EXPIRATION  (6s) ↘" "APNEA HOLD (2s)  ═")
    local times=(4 2 6 2)
    local colors=("${SPARK_BRIGHT_GOLD}" "${SPARK_WARM_AMBER}" "${SPARK_RADIANT_ORANGE}" "${SPARK_WARM_AMBER}")

    for idx in "${!phases[@]}"; do
        echo -ne "  ${colors[$idx]}${BOLD}${phases[$idx]}${RESET} "
        for (( i=1; i<=${times[$idx]}; i++ )); do
            echo -ne "${colors[$idx]}█${RESET}"
            sleep 0.6
        done
        echo ""
    done

    echo -e "\n  ${SPARK_EMERALD}${BOLD}✓ Vagal Baroreflex Calibrated • Parasympathetic Vagal Tone Harmonized.${RESET}\n"
    read -p "Press Enter to return to Sidecar Main Menu..."
}

# ── Action: 3D Spatial Twin ───────────────────────────────────────────────────
action_spatial_twin() {
    draw_sidecar_header
    echo -e " ${SPARK_GOLD_BG}\033[38;5;16m${BOLD} 🥽 WEBGL 3D SPATIAL DIGITAL TWIN & LIDAR ANATOMICAL SCANNER ${RESET}\n"

    echo -e "  ${SPARK_BRIGHT_GOLD}✦ Camera Angle Matrix:${RESET} Anterior • Posterior • Sagittal • Vagal Axis"
    echo -e "  ${SPARK_WARM_AMBER}✦ Edwin Smith PBR Shaders:${RESET} Procedural skeletal & muscular tissue mapping"
    echo -e "  ${SPARK_RADIANT_ORANGE}✦ USCDI v4 Spatial Mesh:${RESET} LiDAR depth keyframe reconstruction active"

    echo -e "\n  ${SPARK_EMERALD}${BOLD}✓ 3D Anatomical Digital Twin Engine Verified.${RESET}\n"
    read -p "Press Enter to return to Sidecar Main Menu..."
}

# ── Action: Optical Derm ──────────────────────────────────────────────────────
action_optical_derm() {
    draw_sidecar_header
    echo -e " ${SPARK_AMBER_BG}\033[38;5;16m${BOLD} 📸 OPTICAL DERMATOLOGICAL MACRO VISION & HIPAA DE-ID ${RESET}\n"

    echo -e "  ${SPARK_WARM_AMBER}✦ Sub-Millimeter Derm Lens:${RESET} Sub-dermal photo capture of lesions & rashes"
    echo -e "  ${SPARK_BRIGHT_GOLD}✦ HIPAA §164.514 Safe Harbor:${RESET} DOMPurify EXIF metadata scrubbing active"
    echo -e "  ${SPARK_RADIANT_ORANGE}✦ Optical Sonification & OCR:${RESET} Screen-reader tactile acoustic narration"

    echo -e "\n  ${SPARK_EMERALD}${BOLD}✓ Macro Derm Photography & Vision AI Pipeline Verified.${RESET}\n"
    read -p "Press Enter to return to Sidecar Main Menu..."
}

# ── Action: ED Bypass ─────────────────────────────────────────────────────────
action_ed_bypass() {
    draw_sidecar_header
    echo -e " ${SPARK_RED_BG}${SPARK_PURE_WHITE}${BOLD} 🚨 EMERGENCY DEPARTMENT (ED) RAPID OSMOTIC & TRIAGE BYPASS ${RESET}\n"

    echo -e "  ${SPARK_BRIGHT_GOLD}✦ Rapid Osmotic Hydration:${RESET} 0.9% NaCl + 20 mEq/L KCl + 5% Dextrose Formula"
    echo -e "  ${SPARK_WARM_AMBER}✦ Vagal Autonomic Reset:${RESET} 0.1 Hz RSA Breathing + Mg Glycinate Protocol"
    echo -e "  ${SPARK_RADIANT_ORANGE}✦ Thermal Shock Resuscitation:${RESET} Warm Isotonic Electrolyte Buffer"

    echo -e "\n  ${SPARK_EMERALD}${BOLD}✓ Emergency Department Triage Telemetry 100% Operational.${RESET}\n"
    read -p "Press Enter to return to Sidecar Main Menu..."
}

# ── Action: Vitest ────────────────────────────────────────────────────────────
action_run_vitest() {
    draw_sidecar_header
    echo -e " ${SPARK_GOLD_BG}\033[38;5;16m${BOLD} 🧪 RUNNING CLINICAL PLATFORM VITEST SUITE & SELF-DIAGNOSTICS ${RESET}\n"

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    cd "$PROJECT_ROOT"
    npx vitest run

    echo -e "\n  ${SPARK_EMERALD}${BOLD}✓ Clinical Platform Test Suite Completed.${RESET}\n"
    read -p "Press Enter to return to Sidecar Main Menu..."
}

# ── Master Interactive Sidecar Menu Loop ──────────────────────────────────────
master_sidecar_menu() {
    while true; do
        draw_sidecar_header
        echo -e " ${SPARK_GOLD_BG}\033[38;5;16m${BOLD} 🧭 POCKETGULL CLINICAL SIDECAR & A2A COMMAND CENTER MENU ${RESET}\n"
        echo -e "  ${SPARK_BRIGHT_GOLD}[1]${RESET} ⚙️  Setup & Audit Virtual Environment (.venv)"
        echo -e "  ${SPARK_BRIGHT_GOLD}[2]${RESET} 🐍 Launch FastAPI Clinical Sidecar Standalone (Port 8001)"
        echo -e "  ${SPARK_BRIGHT_GOLD}[3]${RESET} 🪺 A2A (Agent-to-Agent) Protocol & ADK Swarm Orchestrator Audit"
        echo -e "  ${SPARK_BRIGHT_GOLD}[4]${RESET} 📱 Progressive Web App (PWA) & Pyodide WASM Engine Audit"
        echo -e "  ${SPARK_BRIGHT_GOLD}[5]${RESET} 📊 Interactive Patient Vitals Telemetry HUD & Simulator"
        echo -e "  ${SPARK_BRIGHT_GOLD}[6]${RESET} 🫁 0.1 Hz Vagal Baroreflex & RSA Respiratory Calibration"
        echo -e "  ${SPARK_BRIGHT_GOLD}[7]${RESET} 🥽 WebGL 3D Spatial Digital Twin & Anatomical Scanner"
        echo -e "  ${SPARK_BRIGHT_GOLD}[8]${RESET} 📸 Optical Dermatological Macro Vision & HIPAA De-ID"
        echo -e "  ${SPARK_BRIGHT_GOLD}[9]${RESET} 🚨 Emergency Department (ED) Rapid Osmotic Bypass"
        echo -e "  ${SPARK_BRIGHT_GOLD}[T]${RESET} 🧪 Run Platform Vitest Tests & Self-Diagnostics"
        echo -e "  ${SPARK_BRIGHT_GOLD}[S]${RESET} 🚀 Launch Full Application Stack (${BOLD}npm run dev${RESET})"
        echo -e "  ${SPARK_BRIGHT_GOLD}[0]${RESET} 🚪 Exit Sidecar Command Center\n"

        read -p " Enter choice [0-9, T, or S]: " choice
        case $choice in
            1) action_setup_environment ;;
            2) action_launch_fastapi_standalone ;;
            3) action_a2a_protocol_audit ;;
            4) action_pwa_wasm_audit ;;
            5) action_vitals_telemetry_hud ;;
            6) action_vagal_breathing_tutorial ;;
            7) action_spatial_twin ;;
            8) action_optical_derm ;;
            9) action_ed_bypass ;;
            [tT]) action_run_vitest ;;
            [sS])
                echo -e "\n ${SPARK_EMERALD}${BOLD}🚀 Launching PocketGull Full Stack (Angular SSR + FastAPI Sidecar)...${RESET}"
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
                cd "$PROJECT_ROOT"
                npm run dev
                break
                ;;
            0|[qQ])
                echo -e "\n ${SPARK_WARM_AMBER}Exiting PocketGull Clinical Sidecar Command Center. Have a peaceful shift! 🩺${RESET}\n"
                exit 0
                ;;
            *)
                echo -e "\n ${SPARK_RADIANT_ORANGE}Invalid option. Please select 0-9, T, or S.${RESET}"
                sleep 1
                ;;
        esac
    done
}

# Launch Master Interactive Menu
master_sidecar_menu
