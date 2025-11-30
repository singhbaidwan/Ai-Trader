#!/bin/bash

# 1. Configure Pyenv for this session (Temporary)
pyenv local 3.14.0
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

2. Check if .venv exists. If not, create it.
if [ ! -d ".venv" ]; then
    echo "⚠️  Virtual environment not found. Creating it now..."
    python -m venv .venv
    echo "✅  Created .venv"
fi

# 3. Activate the environment
source .venv/bin/activate

# 4. Success Message
echo "🚀 Project Environment Ready!"
echo "   Python: $(python --version)"
echo "   Path:   $(which python)"