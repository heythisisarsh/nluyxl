#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  NLUYXL - DigitalOcean Production Droplet Deployment Script"
echo "=========================================================="

# 1. Update OS & install essential utilities
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git ufw fail2ban ca-certificates gnupg

# 2. Configure Firewall (UFW)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 3. Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# 4. Clone or pull NLUYXL repository
DEPLOY_DIR="/opt/nluyxl"
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "Cloning repository..."
    git clone https://github.com/heythisisarsh/nluyxl.git "$DEPLOY_DIR"
else
    echo "Pulling latest changes..."
    cd "$DEPLOY_DIR" && git pull
fi

# 5. Build and run containers via Docker Compose
cd "$DEPLOY_DIR/deploy"
docker compose down || true
docker compose up -d --build

echo "=========================================================="
echo "  NLUYXL services running successfully on DigitalOcean!"
echo "  API: http://YOUR_DROPLET_IP:8000"
echo "  Frontend: http://YOUR_DROPLET_IP:3000"
echo "=========================================================="
