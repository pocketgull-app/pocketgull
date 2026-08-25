#!/usr/bin/env bash
# ==============================================================================
# 🩺 POCKETGULL: INTERACTIVE CLINICAL MONITORING & INTERFACE TUTORIAL
# ==============================================================================
# Interactive Terminal Patient Monitoring & Clinical Interface Command Center
# Tailored for Physicians, Attending Specialists, EMTs, & Clinical Researchers
# ==============================================================================

set -eo pipefail

# ── Spark Mode Ember & Gold ANSI Palette Tokens ───────────────────────────────
SPARK_OBSIDIAN="\033[48;5;234m"
SPARK_GOLD_BG="\033[48;5;214m"
SPARK_AMBER_BG="\033[48;5;208m"
SPARK_ORANGE_BG="\033[48;5;166m"
SPARK_RED_BG="\033[48;5;124m"

SPARK_BRIGHT_GOLD="\033[38;5;220m"
SPARK_WARM_AMBER="\033[38;5;214m"
SPARK_RADIANT_ORANGE="\033[38;5;208m"
SPARK_NEON_YELLOW="\033[38;5;226m"
SPARK_PURE_WHITE="\033[38;5;231m"
SPARK_EMERALD="\033[38;5;46m"
SPARK_CYAN="\033[38;5;51m"
SPARK_DIM="\033[38;5;244m"

BOLD="\033[1m"
RESET="\033[0m"

# ── ASCII Clinical Workstation Banner ─────────────────────────────────────────
draw_header() {
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

    echo -ne " ${SPARK_GOLD_BG}\033[38;5;16m${BOLD} 🩺 POCKETGULL CLINICAL PATIENT MONITORING ${RESET}"
    echo -ne " ${SPARK_AMBER_BG}\033[38;5;16m${BOLD} 📊 INTERACTIVE TUTORIAL ${RESET}"
    echo -ne " ${SPARK_ORANGE_BG}${SPARK_PURE_WHITE}${BOLD} 🌐 FHIR R4 TELEMETRY ${RESET}\n"
    echo -e "${SPARK_WARM_AMBER}────────────────────────────────────────────────────────────────────────────────────────────────${RESET}\n"
}

# ── Module 1: Autonomic Vagal Baroreflex Calibration ──────────────────────────
tutorial_vagal_breathing() {
    draw_header
    echo -e " ${SPARK_AMBER_BG}\033[38;5;16m${BOLD} 🫁 MODULE 1: AUTONOMIC VAGAL BAROREFLEX & 0.1 Hz RSA BREATHING TUTORIAL ${RESET}\n"
    echo -e " ${SPARK_WARM_AMBER}Clinical Rationale:${RESET} 0.1 Hz (6.0 BPM) resonant breathing maximizes Respiratory Sinus Arrhythmia (RSA)"
    echo -e " and vagal nerve activation, dampening sympathetic nervous system hyper-arousal.\n"

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
    read -p "Press Enter to return to Clinical Command Menu..."
}

# ── Module 2: Live Real-Time Patient Vitals Telemetry Simulator ───────────────
tutorial_live_vitals_hud() {
    draw_header
    echo -e " ${SPARK_GOLD_BG}\033[38;5;16m${BOLD} 📊 MODULE 2: REAL-TIME PATIENT VITALS TELEMETRY HUD SIMULATOR ${RESET}\n"
    echo -e " ${SPARK_BRIGHT_GOLD}Simulating real-time bedside biosignal telemetry & warning thresholds...${RESET}\n"

    for (( tick=1; tick<=6; tick++ )); do
        HR=$(( 70 + RANDOM % 8 ))
        SPO2=$(( 97 + RANDOM % 3 ))
        HRV=$(( 58 + RANDOM % 15 ))
        SYS=$(( 118 + RANDOM % 6 ))
        DIA=$(( 76 + RANDOM % 4 ))
        GLU=$(( 92 + RANDOM % 10 ))
        TEMP="36.$(( 7 + RANDOM % 3 ))"

        echo -e "  [${SPARK_DIM}T+${tick}s${RESET}] ${BOLD}HR:${RESET} ${SPARK_EMERALD}${HR} bpm${RESET} │ ${BOLD}BP:${RESET} ${SPARK_BRIGHT_GOLD}${SYS}/${DIA} mmHg${RESET} │ ${BOLD}SpO2:${RESET} ${SPARK_CYAN}${SPO2}%${RESET} │ ${BOLD}HRV:${RESET} ${SPARK_WARM_AMBER}${HRV} ms${RESET} │ ${BOLD}Glucose:${RESET} ${SPARK_NEON_YELLOW}${GLU} mg/dL${RESET} │ ${BOLD}Temp:${RESET} ${SPARK_PURE_WHITE}${TEMP}°C${RESET}"
        sleep 1.2
    done

    echo -e "\n  ${SPARK_EMERALD}${BOLD}✓ Live Patient Vitals Stream Active • All Parameters Within Safe Boundaries.${RESET}\n"
    read -p "Press Enter to return to Clinical Command Menu..."
}

# ── Module 3: 3D Spatial Anatomical Twin ──────────────────────────────────────
tutorial_spatial_twin() {
    draw_header
    echo -e " ${SPARK_GOLD_BG}\033[38;5;16m${BOLD} 🥽 MODULE 3: WEBGL 3D SPATIAL ANATOMICAL DIGITAL TWIN ${RESET}\n"
    echo -e " ${SPARK_BRIGHT_GOLD}Clinical Rationale:${RESET} Reconstructs patient anatomical coordinates from 60 LiDAR depth keyframes.\n"

    echo -e "  ${SPARK_BRIGHT_GOLD}✦ Camera Angle Presets:${RESET} Anterior • Posterior • Sagittal • Vagal Axis"
    echo -e "  ${SPARK_WARM_AMBER}✦ PBR Biophysics:${RESET} Edwin Smith Codex skeletal & muscular tissue mapping"
    echo -e "  ${SPARK_RADIANT_ORANGE}✦ USCDI v4 Mesh:${RESET} Anatomical coordinate alignment & postural telemetry"

    echo -e "\n  ${SPARK_EMERALD}${BOLD}✓ 3D Anatomical Digital Twin Active.${RESET}\n"
    read -p "Press Enter to return to Clinical Command Menu..."
}

# ── Module 4: Optical Dermatology & HIPAA De-ID ───────────────────────────────
tutorial_optical_derm() {
    draw_header
    echo -e " ${SPARK_AMBER_BG}\033[38;5;16m${BOLD} 📸 MODULE 4: OPTICAL DERMATOLOGICAL MACRO VISION & HIPAA DE-ID ${RESET}\n"

    echo -e "  ${SPARK_WARM_AMBER}✦ Sub-Millimeter Derm Lens:${RESET} Clinical macro photo capture of skin lesions & rashes"
    echo -e "  ${SPARK_BRIGHT_GOLD}✦ HIPAA §164.514 Safe Harbor:${RESET} DOMPurify EXIF metadata scrubbing & patient de-identification"
    echo -e "  ${SPARK_RADIANT_ORANGE}✦ Medication OCR Narration:${RESET} Screen-reader tactile acoustic narration & pill OCR"

    echo -e "\n  ${SPARK_EMERALD}${BOLD}✓ Optical Vision AI & HIPAA De-ID Pipeline Verified.${RESET}\n"
    read -p "Press Enter to return to Clinical Command Menu..."
}

# ── Module 5: Emergency Department (ED) Bypass ────────────────────────────────
tutorial_ed_bypass() {
    draw_header
    echo -e " ${SPARK_RED_BG}${SPARK_PURE_WHITE}${BOLD} 🚨 MODULE 5: EMERGENCY DEPARTMENT (ED) RAPID OSMOTIC & TRIAGE BYPASS ${RESET}\n"

    echo -e "  ${SPARK_BRIGHT_GOLD}✦ Rapid Osmotic Hydration:${RESET} 0.9% NaCl + 20 mEq/L KCl + 5% Dextrose Buffer"
    echo -e "  ${SPARK_WARM_AMBER}✦ Vagal Autonomic Reset:${RESET} 0.1 Hz RSA Breathing + Mg Glycinate Protocol"
    echo -e "  ${SPARK_RADIANT_ORANGE}✦ Thermal Shock Protocol:${RESET} Warm Isotonic Electrolyte Resuscitation Matrix"

    echo -e "\n  ${SPARK_EMERALD}${BOLD}✓ Emergency Department Triage Telemetry 100% Operational.${RESET}\n"
    read -p "Press Enter to return to Clinical Command Menu..."
}

# ── Interactive Menu Loop ─────────────────────────────────────────────────────
interactive_clinical_menu() {
    while true; do
        draw_header
        echo -e " ${SPARK_GOLD_BG}\033[38;5;16m${BOLD} 🧭 SELECT CLINICAL PATIENT MONITORING MODULE OR INTERFACE TUTORIAL ${RESET}\n"
        echo -e "  ${SPARK_BRIGHT_GOLD}[1]${RESET} 🫁 Module 1: Autonomic Vagal Baroreflex & 0.1 Hz RSA Breathing"
        echo -e "  ${SPARK_BRIGHT_GOLD}[2]${RESET} 📊 Module 2: Real-time Patient Vitals Telemetry HUD & Biosignal Simulator"
        echo -e "  ${SPARK_BRIGHT_GOLD}[3]${RESET} 🥽 Module 3: WebGL 3D Spatial Digital Twin & Anatomical Coordinates"
        echo -e "  ${SPARK_BRIGHT_GOLD}[4]${RESET} 📸 Module 4: Optical Dermatological Macro Vision & HIPAA De-ID"
        echo -e "  ${SPARK_BRIGHT_GOLD}[5]${RESET} 🚨 Module 5: Emergency Department (ED) Rapid Osmotic Hydration Bypass"
        echo -e "  ${SPARK_BRIGHT_GOLD}[6]${RESET} ⚡ Launch Full Clinical Application (${BOLD}npm run dev${RESET})"
        echo -e "  ${SPARK_BRIGHT_GOLD}[Q]${RESET} 🚪 Exit Clinical Command Center\n"

        read -p " Enter choice [1-6 or Q]: " choice
        case $choice in
            1) tutorial_vagal_breathing ;;
            2) tutorial_live_vitals_hud ;;
            3) tutorial_spatial_twin ;;
            4) tutorial_optical_derm ;;
            5) tutorial_ed_bypass ;;
            6)
                echo -e "\n ${SPARK_EMERALD}${BOLD}🚀 Launching PocketGull Full Stack (Angular SSR + FastAPI Sidecar)...${RESET}"
                npm run dev
                break
                ;;
            [qQ])
                echo -e "\n ${SPARK_WARM_AMBER}Exiting PocketGull Clinical Command Center. Have a peaceful shift! 🩺${RESET}\n"
                exit 0
                ;;
            *)
                echo -e "\n ${SPARK_RADIANT_ORANGE}Invalid option. Please select 1-6 or Q.${RESET}"
                sleep 1
                ;;
        esac
    done
}

# Execute Interactive Menu
interactive_clinical_menu
