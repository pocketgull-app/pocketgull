# ─── POCKETGULL P10K THEME SWITCHER & RUNTIME OVERLAY ───────────────────
# Enables dynamic, zero-restart theme switching across Zsh Powerlevel10k sessions.
#
# Installation:
#   Add to ~/.zshrc:
#     source /path/to/packages/pocketgull-theme/system/shell-prompts/p10k/pocketgull-theme-switcher.zsh

POCKETGULL_P10K_DIR="${0:A:h}"

set-pocketgull-theme() {
  local target_theme="${1:-obsidian}"
  local theme_file=""

  case "$target_theme" in
    obsidian|dark)
      theme_file="$POCKETGULL_P10K_DIR/pocketgull-obsidian.p10k.zsh"
      ;;
    scotopic|650nm|red|night)
      theme_file="$POCKETGULL_P10K_DIR/pocketgull-scotopic-650nm.p10k.zsh"
      ;;
    washi|paper|light)
      theme_file="$POCKETGULL_P10K_DIR/pocketgull-washi.p10k.zsh"
      ;;
    curie|radium|green)
      theme_file="$POCKETGULL_P10K_DIR/pocketgull-curie.p10k.zsh"
      ;;
    rams|functionalist|putty)
      theme_file="$POCKETGULL_P10K_DIR/pocketgull-rams.p10k.zsh"
      ;;
    *)
      echo "🌊 PocketGull P10k Themes:"
      echo "  • obsidian       (Flagship Dark & Gear Teal)"
      echo "  • scotopic       (Circadian 650nm Red, zero blue light)"
      echo "  • washi          (Tactile Japanese Kozo Rice Paper)"
      echo "  • curie          (Laboratory Radium Phosphorescence)"
      echo "  • rams           (Dieter Rams Functionalist Putty/Amber)"
      return 1
      ;;
  esac

  if [[ -f "$theme_file" ]]; then
    source "$theme_file"
    if (( $+functions[p10k] )); then
      p10k reload
    fi
    echo "✅ Switched Powerlevel10k theme to PocketGull [$target_theme]"
  else
    echo "⚠️ Theme file not found: $theme_file"
  fi
}

sync-pocketgull-theme() {
  local hour=$(( 10#$(date +%H) ))
  local min=$(( 10#$(date +%M) ))
  if (( hour > 19 || (hour == 19 && min >= 30) || hour < 8 )); then
    set-pocketgull-theme scotopic
  elif (( hour >= 8 && hour < 13 )); then
    set-pocketgull-theme washi
  else
    set-pocketgull-theme obsidian
  fi
}

alias gull-theme=set-pocketgull-theme
