# ~/.bash_profile

# Load interactive shell settings.
if [ -f "$HOME/.bashrc" ]; then
    . "$HOME/.bashrc"
fi

# User-installed tools.
export PATH="$HOME/.local/bin:$HOME/.local/node/bin:$PATH"

# Editor and pager.
export EDITOR="code --wait"
export VISUAL="code --wait"
export PAGER="less"
export LESS="-FRX"

# Node.js development defaults.
export NODE_ENV="development"
export NPM_CONFIG_AUDIT="true"
export NPM_CONFIG_FUND="false"

# Silver Quill package configuration.
export NPM_CONFIG_REGISTRY="https://packages.silverquill.internal"
export NPM_CONFIG_USERCONFIG="$HOME/.config/npm/npmrc"

# Local quill-api workspace.
export QUILL_ENV="development"
export QUILL_API_HOME="$HOME/src/quill-api"

# Shell history.
export HISTSIZE="5000"
export HISTFILESIZE="10000"
export HISTCONTROL="ignoredups:erasedups"

# Convenience aliases.
alias ll='ls -lah'
alias la='ls -A'
alias grep='grep --color=auto'
alias qapi='cd "$QUILL_API_HOME"'
alias npmw='npm --workspace "$QUILL_API_HOME"'

# Refresh command lookup after PATH changes.
hash -r 2>/dev/null || true
