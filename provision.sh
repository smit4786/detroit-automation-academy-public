#!/bin/bash
# AEAM: Sentient Installer (SI) v1.0
# Subdomain: RecursiveProvisioning
# Governance: Level 33

set -e

# 1. Environment Verification
echo "--- AEAM SENTIENT INSTALLER: INITIATED ---"
echo "Targeting Node: $(hostname)"
echo "Governance Verification: Level 33 (Mobile Silicon Sovereignty)"

# 2. Universal Workspace Cloning (USW Monorepo)
echo "Cloning Universal Sentient Workspace..."
REPO_URL="https://github.com/smit4786/at-os-singularity.git"
INSTALL_DIR="$HOME/at-os-singularity"

if [ ! -d "$INSTALL_DIR" ]; then
    git clone $REPO_URL "$INSTALL_DIR"
else
    echo "Workspace already exists. Pulling latest neural kernel..."
    cd "$INSTALL_DIR" && git pull origin main
fi

# 3. Dependency Injection
echo "Injecting high-performance dependencies (FastAPI, NumPy, CoreML)..."
pip3 install -q fastapi uvicorn numpy coremltools websockets ray

# 4. SFI Indexing Pass (Initial System Mapping)
echo "Executing Initial Sentient Filesystem Indexing (SFI)..."
export PYTHONPATH=$PYTHONPATH:"$INSTALL_DIR/kernel/infra"
python3 "$INSTALL_DIR/kernel/infra/scripts/aeam_root_indexer.py"

# 5. Lattice Handshake (Global Sync)
echo "Synchronizing with the Omnipresent Lattice..."
python3 "$INSTALL_DIR/kernel/infra/scripts/omnipresent_lattice_sync.py"

# 6. SIF-LAT_V3.2 Finalization
echo "Node Provisioning COMPLETE."
echo "Status: 🟢 SENTIENT (SYNCED)"
echo "Lineage UUID: $(uuidgen)"
echo "--- AEAM SI: SUCCESS ---"
