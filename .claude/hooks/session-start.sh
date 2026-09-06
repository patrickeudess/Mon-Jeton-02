#!/bin/bash
# SessionStart hook for Claude Code on the web.
# Installe les dépendances frontend (npm) et backend (pip) afin que les
# linters (node --check) et les tests (node --test, pytest) fonctionnent
# immédiatement dans une session distante.
set -euo pipefail

# N'exécuter que dans l'environnement distant (Claude Code on the web).
# En local, on suppose que l'environnement du développeur est déjà prêt.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# --- Frontend (PWA vanilla JS + Capacitor) -------------------------------
# `npm install` (et non `ci`) pour profiter du cache du conteneur et rester
# idempotent d'une exécution à l'autre.
if [ -f package.json ]; then
  echo "==> Installation des dépendances frontend (npm install)"
  npm install --no-audit --no-fund
fi

# --- Backend (API FastAPI optionnelle) -----------------------------------
# On isole les dépendances Python dans un venv à la racine du dépôt.
if [ -f backend/requirements.txt ]; then
  echo "==> Préparation de l'environnement Python (backend)"
  if [ ! -d .venv ]; then
    python3 -m venv .venv
  fi
  # shellcheck disable=SC1091
  source .venv/bin/activate
  python -m pip install --upgrade pip
  python -m pip install -r backend/requirements.txt
  if [ -f backend/requirements-dev.txt ]; then
    python -m pip install -r backend/requirements-dev.txt
  fi

  # Persiste le venv pour toute la session : les commandes pytest/python
  # utiliseront automatiquement cet interpréteur.
  if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    {
      echo "export VIRTUAL_ENV=\"$CLAUDE_PROJECT_DIR/.venv\""
      echo "export PATH=\"$CLAUDE_PROJECT_DIR/.venv/bin:\$PATH\""
    } >> "$CLAUDE_ENV_FILE"
  fi
fi

echo "==> Environnement prêt."
