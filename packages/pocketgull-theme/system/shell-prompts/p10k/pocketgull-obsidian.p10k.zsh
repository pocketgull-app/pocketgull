# ─── POCKETGULL OBSIDIAN (POWERLEVEL10K PROMPT THEME) ──────────────────
# Calibrated for high-contrast optical clarity, WCAG AAA compliance, and Gear Teal accents.
# Usage:
#   source /path/to/pocketgull-obsidian.p10k.zsh
#   Or copy/symlink to ~/.p10k.zsh

'builtin' 'local' '-a' 'p10k_config_opts'
[[ ! -o 'aliases'         ]] || p10k_config_opts+=('aliases')
[[ ! -o 'sh_glob'         ]] || p10k_config_opts+=('sh_glob')
[[ ! -o 'no_brace_expand' ]] || p10k_config_opts+=('no_brace_expand')
'builtin' 'setopt' 'no_aliases' 'no_sh_glob' 'brace_expand'

() {
  emulate -L zsh -o extended_glob
  unset -m '(POWERLEVEL9K_*|DEFAULT_USER)~POWERLEVEL9K_GITSTATUS_DIR'

  typeset -g POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(
    os_icon                 # PocketGull clinical badge
    dir                     # Current directory
    vcs                     # Git repository status
    prompt_char             # Prompt symbol
  )

  typeset -g POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(
    status                  # Exit code
    command_execution_time  # Execution duration
    time                    # Timestamp
  )

  # Typography & Mode
  typeset -g POWERLEVEL9K_MODE='nerdfont-v3'
  typeset -g POWERLEVEL9K_ICON_PADDING=none

  # Separators (Rounded / Diamond pill geometry)
  typeset -g POWERLEVEL9K_LEFT_SUBSEGMENT_SEPARATOR='%F{#27272a} \uE0B1%f'
  typeset -g POWERLEVEL9K_RIGHT_SUBSEGMENT_SEPARATOR='%F{#27272a}\uE0B3 %f'
  typeset -g POWERLEVEL9K_LEFT_SEGMENT_SEPARATOR='\uE0B4'
  typeset -g POWERLEVEL9K_RIGHT_SEGMENT_SEPARATOR='\uE0B6'
  typeset -g POWERLEVEL9K_LEFT_PROMPT_FIRST_SEGMENT_START_SYMBOL='\uE0B6'
  typeset -g POWERLEVEL9K_RIGHT_PROMPT_LAST_SEGMENT_END_SYMBOL='\uE0B4'
  typeset -g POWERLEVEL9K_EMPTY_LINE_LEFT_PROMPT_FIRST_SEGMENT_END_SYMBOL='%{%}'

  # OS Icon / PocketGull Clinical Badge
  typeset -g POWERLEVEL9K_OS_ICON_FOREGROUND='#ffffff'
  typeset -g POWERLEVEL9K_OS_ICON_BACKGROUND='#0f766e'
  typeset -g POWERLEVEL9K_OS_ICON_CONTENT_EXPANSION='⚕ POCKETGULL'

  # Directory
  typeset -g POWERLEVEL9K_DIR_BACKGROUND='#18181b'
  typeset -g POWERLEVEL9K_DIR_FOREGROUND='#faf8f2'
  typeset -g POWERLEVEL9K_DIR_SHORTEN_STRATEGY='truncate_to_unique'
  typeset -g POWERLEVEL9K_DIR_SHORTEN_DELIMITER='..'
  typeset -g POWERLEVEL9K_DIR_ANCHOR_BOLD=true
  typeset -g POWERLEVEL9K_DIR_ANCHOR_FOREGROUND='#38bdf8'

  # Git / VCS (Emerald Clean, Amber Dirty)
  typeset -g POWERLEVEL9K_VCS_CLEAN_BACKGROUND='#059669'
  typeset -g POWERLEVEL9K_VCS_CLEAN_FOREGROUND='#ffffff'
  typeset -g POWERLEVEL9K_VCS_MODIFIED_BACKGROUND='#b45309'
  typeset -g POWERLEVEL9K_VCS_MODIFIED_FOREGROUND='#ffffff'
  typeset -g POWERLEVEL9K_VCS_UNTRACKED_BACKGROUND='#047857'
  typeset -g POWERLEVEL9K_VCS_UNTRACKED_FOREGROUND='#ffffff'
  typeset -g POWERLEVEL9K_VCS_CONFLICTED_BACKGROUND='#b91c1c'
  typeset -g POWERLEVEL9K_VCS_CONFLICTED_FOREGROUND='#ffffff'
  typeset -g POWERLEVEL9K_VCS_LOADING_BACKGROUND='#27272a'
  typeset -g POWERLEVEL9K_VCS_LOADING_FOREGROUND='#a1a1aa'

  # Execution Time
  typeset -g POWERLEVEL9K_COMMAND_EXECUTION_TIME_THRESHOLD=0.5
  typeset -g POWERLEVEL9K_COMMAND_EXECUTION_TIME_PRECISION=1
  typeset -g POWERLEVEL9K_COMMAND_EXECUTION_TIME_BACKGROUND='#1c1917'
  typeset -g POWERLEVEL9K_COMMAND_EXECUTION_TIME_FOREGROUND='#fbbf24'

  # Status (Exit code)
  typeset -g POWERLEVEL9K_STATUS_OK=false
  typeset -g POWERLEVEL9K_STATUS_ERROR=true
  typeset -g POWERLEVEL9K_STATUS_ERROR_BACKGROUND='#7f1d1d'
  typeset -g POWERLEVEL9K_STATUS_ERROR_FOREGROUND='#fee2e2'

  # Time
  typeset -g POWERLEVEL9K_TIME_FORMAT='%D{%H:%M:%S}'
  typeset -g POWERLEVEL9K_TIME_BACKGROUND='#18181b'
  typeset -g POWERLEVEL9K_TIME_FOREGROUND='#2dd4bf'

  # Prompt Character
  typeset -g POWERLEVEL9K_PROMPT_CHAR_OK_{VIINS,VICMD,VIVIS,VIOWR}_FOREGROUND='#14b8a6'
  typeset -g POWERLEVEL9K_PROMPT_CHAR_ERROR_{VIINS,VICMD,VIVIS,VIOWR}_FOREGROUND='#ef4444'
  typeset -g POWERLEVEL9K_PROMPT_CHAR_{OK,ERROR}_VIINS_CONTENT_EXPANSION='❯'
  typeset -g POWERLEVEL9K_PROMPT_CHAR_{OK,ERROR}_VICMD_CONTENT_EXPANSION='❮'

  # Instant prompt & Transient prompt
  typeset -g POWERLEVEL9K_TRANSIENT_PROMPT='always'
  typeset -g POWERLEVEL9K_INSTANT_PROMPT='quiet'
}

(( ${#p10k_config_opts} )) && setopt ${p10k_config_opts[@]}
'builtin' 'unset' 'p10k_config_opts'
