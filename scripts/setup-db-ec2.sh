#!/bin/bash
# ScholarPass PostgreSQL setup on EC2 (Amazon Linux 2 / 2023)
# Run on: ec2-16-16-143-59.eu-north-1.compute.amazonaws.com
# Usage: copy to EC2 and run: sudo bash setup-db-ec2.sh

set -e

DB_NAME="${DB_NAME:-scholarpass}"
DB_USER="${DB_USER:-Alvee}"
DB_PASSWORD="${DB_PASSWORD:-shofimofasselerdhoncuse}"
PG_VERSION="${PG_VERSION:-15}"

echo "=== ScholarPass DB setup: $DB_NAME, user $DB_USER ==="

# Detect OS and install PostgreSQL
if [ -f /etc/os-release ]; then
  . /etc/os-release
  if [[ "$ID" == "amzn" ]] && [[ "$VERSION_ID" == "2" ]]; then
    echo "Amazon Linux 2 detected."
    sudo amazon-linux-extras enable postgresql${PG_VERSION} 2>/dev/null || true
    sudo yum install -y postgresql${PG_VERSION}-server postgresql${PG_VERSION}
    PG_DATA="/var/lib/pgsql/${PG_VERSION}/data"
    PG_BIN="/usr/bin"
    PG_SERVICE="postgresql-${PG_VERSION}"
  elif [[ "$ID" == "amzn" ]] && [[ "$VERSION_ID" == "2023" ]]; then
    echo "Amazon Linux 2023 detected."
    sudo dnf install -y postgresql15-server postgresql15
    sudo postgresql-setup --initdb
    PG_DATA="/var/lib/pgsql/data"
    PG_BIN="/usr/bin"
    PG_SERVICE="postgresql"
  else
    echo "Unsupported OS. Install PostgreSQL manually and create DB/user."
    exit 1
  fi
else
  echo "Cannot detect OS. Install PostgreSQL manually."
  exit 1
fi

# Start PostgreSQL
sudo systemctl enable ${PG_SERVICE}
sudo systemctl start ${PG_SERVICE} || true
sleep 2

# Create user and database (run as postgres)
sudo -u postgres psql -v ON_ERROR_STOP=1 <<EOF
-- Create user if not exists (ignore error if exists)
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE "${DB_USER}" WITH LOGIN PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER ROLE "${DB_USER}" WITH PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE ${DB_NAME} OWNER "${DB_USER}"'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO "${DB_USER}";
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO "${DB_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${DB_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "${DB_USER}";
-- For existing objects
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${DB_USER}";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${DB_USER}";
GRANT USAGE ON SCHEMA public TO "${DB_USER}";

-- Enable pgcrypto for DB 1 seed (crypt/gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
EOF

echo "Database and user created."

# Configure PostgreSQL to listen on all interfaces (for remote connections)
PG_CONF="${PG_DATA}/postgresql.conf"
PG_HBA="${PG_DATA}/pg_hba.conf"
if [ -f "$PG_CONF" ]; then
  sudo sed -i.bak "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF" 2>/dev/null || true
  if ! grep -q "listen_addresses = '\*'" "$PG_CONF"; then
    echo "listen_addresses = '*'" | sudo tee -a "$PG_CONF"
  fi
fi
if [ -f "$PG_HBA" ]; then
  # Allow password auth from any host (restrict in production with CIDR)
  if ! grep -q "host.*all.*all.*0.0.0.0/0.*md5" "$PG_HBA"; then
    echo "host    all    all    0.0.0.0/0    md5" | sudo tee -a "$PG_HBA"
  fi
fi

sudo systemctl restart ${PG_SERVICE} || true
echo "PostgreSQL configured to accept remote connections (port 5432)."

# Firewall: open 5432 if firewalld is used
if command -v firewall-cmd &>/dev/null; then
  sudo firewall-cmd --permanent --add-port=5432/tcp 2>/dev/null || true
  sudo firewall-cmd --reload 2>/dev/null || true
fi

echo ""
echo "=== Setup complete ==="
echo "Connection URL (from this host):"
echo "  postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"
echo ""
echo "Connection URL (from your app / remote):"
echo "  postgresql://${DB_USER}:${DB_PASSWORD}@ec2-16-16-143-59.eu-north-1.compute.amazonaws.com:5432/${DB_NAME}"
echo ""
echo "Next: Apply schema (DB 2 first, then DB 1) using psql or your migration tool."
echo "  psql -h localhost -U ${DB_USER} -d ${DB_NAME} -f \"DB 2 - MASTER DATA.sql\""
echo "  psql -h localhost -U ${DB_USER} -d ${DB_NAME} -f \"DB 1 - APP ACCESS.sql\""
