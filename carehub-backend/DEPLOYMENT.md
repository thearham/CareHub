# CareHub Deployment Guide

This guide covers deploying CareHub to production without Docker.

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Python 3.11+
- PostgreSQL 12+
- Nginx
- Redis
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)

---

## Step 1: Server Setup

### Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Install Dependencies

```bash
sudo apt install -y python3.11 python3.11-venv python3-pip postgresql postgresql-contrib nginx redis-server git
```

---

## Step 2: PostgreSQL Setup

### Create Database and User

```bash
sudo -u postgres psql

CREATE DATABASE carehub_prod;
CREATE USER carehub_prod_user WITH PASSWORD 'your_strong_password_here';
ALTER ROLE carehub_prod_user SET client_encoding TO 'utf8';
ALTER ROLE carehub_prod_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE carehub_prod_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE carehub_prod TO carehub_prod_user;
\q
```

---

## Step 3: Application Setup

### Create Application User

```bash
sudo adduser --system --group --home /opt/carehub carehub
```

### Clone Repository

```bash
sudo mkdir -p /opt/carehub
sudo chown carehub:carehub /opt/carehub
sudo -u carehub git clone <your-repo-url> /opt/carehub/app
cd /opt/carehub/app
```

### Create Virtual Environment

```bash
sudo -u carehub python3.11 -m venv /opt/carehub/venv
```

### Install Dependencies

```bash
sudo -u carehub /opt/carehub/venv/bin/pip install --upgrade pip
sudo -u carehub /opt/carehub/venv/bin/pip install -r requirements.txt
sudo -u carehub /opt/carehub/venv/bin/pip install gunicorn
```

---

## Step 4: Environment Configuration

### Create Production .env

```bash
sudo -u carehub nano /opt/carehub/app/.env
```

Add production configuration:

```env
# Django Settings
SECRET_KEY=<generate-with-python-secrets>
DEBUG=False
ALLOWED_HOSTS=api.yourdomain.com,yourdomain.com

# Database
POSTGRES_DB=carehub_prod
POSTGRES_USER=carehub_prod_user
POSTGRES_PASSWORD=your_strong_password_here
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# JWT
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# GROQ
GROQ_API_KEY=your_groq_api_key

# SMS Provider
SMS_PROVIDER_API_KEY=your_sms_api_key
SMS_PROVIDER_URL=https://api.sms-provider.com/send

# File Upload
MAX_UPLOAD_SIZE_MB=10
ALLOWED_UPLOAD_EXTENSIONS=pdf,jpg,jpeg,png,doc,docx

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# OTP
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
```

### Generate Secret Key

```python
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

---

## Step 5: Database Migration

```bash
cd /opt/carehub/app
sudo -u carehub /opt/carehub/venv/bin/python manage.py migrate
sudo -u carehub /opt/carehub/venv/bin/python manage.py collectstatic --noinput
```

### Create Superuser

```bash
sudo -u carehub /opt/carehub/venv/bin/python manage.py createsuperuser
```

---

## Step 6: Gunicorn Setup

### Create Gunicorn Socket

```bash
sudo nano /etc/systemd/system/carehub.socket
```

```ini
[Unit]
Description=CareHub Gunicorn Socket

[Socket]
ListenStream=/run/carehub.sock

[Install]
WantedBy=sockets.target
```

### Create Gunicorn Service

```bash
sudo nano /etc/systemd/system/carehub.service
```

```ini
[Unit]
Description=CareHub Django Application
Requires=carehub.socket
After=network.target

[Service]
Type=notify
User=carehub
Group=carehub
RuntimeDirectory=carehub
WorkingDirectory=/opt/carehub/app
Environment="PATH=/opt/carehub/venv/bin"
ExecStart=/opt/carehub/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/run/carehub.sock \
    --timeout 120 \
    --access-logfile /opt/carehub/logs/access.log \
    --error-logfile /opt/carehub/logs/error.log \
    carehub.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### Create Log Directory

```bash
sudo mkdir -p /opt/carehub/logs
sudo chown carehub:carehub /opt/carehub/logs
```

### Start Gunicorn

```bash
sudo systemctl start carehub.socket
sudo systemctl enable carehub.socket
sudo systemctl start carehub.service
sudo systemctl enable carehub.service
```

### Check Status

```bash
sudo systemctl status carehub.service
```

---

## Step 7: Nginx Configuration

### Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/carehub
```

```nginx
upstream carehub_app {
    server unix:/run/carehub.sock fail_timeout=0;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    client_max_body_size 10M;
    
    # Static files
    location /static/ {
        alias /opt/carehub/app/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /opt/carehub/app/media/;
        expires 7d;
        add_header Cache-Control "public";
    }
    
    # Application
    location / {
        proxy_pass http://carehub_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_buffering off;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/carehub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 8: SSL Certificate (Let's Encrypt)

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain Certificate

```bash
sudo certbot --nginx -d api.yourdomain.com
```

### Auto-renewal

```bash
sudo systemctl status certbot.timer
```

---

## Step 9: Celery Setup (Optional)

### Create Celery Worker Service

```bash
sudo nano /etc/systemd/system/carehub-celery.service
```

```ini
[Unit]
Description=CareHub Celery Worker
After=network.target

[Service]
Type=forking
User=carehub
Group=carehub
WorkingDirectory=/opt/carehub/app
Environment="PATH=/opt/carehub/venv/bin"
ExecStart=/opt/carehub/venv/bin/celery -A carehub worker \
    --loglevel=info \
    --logfile=/opt/carehub/logs/celery.log \
    --pidfile=/opt/carehub/celery.pid
ExecStop=/bin/kill -s TERM $MAINPID
Restart=always

[Install]
WantedBy=multi-user.target
```

### Create Celery Beat Service

```bash
sudo nano /etc/systemd/system/carehub-celery-beat.service
```

```ini
[Unit]
Description=CareHub Celery Beat
After=network.target

[Service]
Type=simple
User=carehub
Group=carehub
WorkingDirectory=/opt/carehub/app
Environment="PATH=/opt/carehub/venv/bin"
ExecStart=/opt/carehub/venv/bin/celery -A carehub beat \
    --loglevel=info \
    --logfile=/opt/carehub/logs/celery-beat.log
Restart=always

[Install]
WantedBy=multi-user.target
```

### Start Celery Services

```bash
sudo systemctl start carehub-celery.service
sudo systemctl enable carehub-celery.service
sudo systemctl start carehub-celery-beat.service
sudo systemctl enable carehub-celery-beat.service
```

---

## Step 10: Monitoring & Logging

### View Application Logs

```bash
# Gunicorn logs
sudo tail -f /opt/carehub/logs/error.log
sudo tail -f /opt/carehub/logs/access.log

# Django logs
sudo tail -f /opt/carehub/app/logs/carehub.log

# Celery logs
sudo tail -f /opt/carehub/logs/celery.log

# System logs
sudo journalctl -u carehub.service -f
```

### Log Rotation

```bash
sudo nano /etc/logrotate.d/carehub
```

```
/opt/carehub/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 carehub carehub
    sharedscripts
    postrotate
        systemctl reload carehub.service > /dev/null 2>&1 || true
    endscript
}
```

---

## Step 11: Backup Strategy

### Database Backup Script

```bash
sudo nano /opt/carehub/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/carehub/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U carehub_prod_user carehub_prod > $BACKUP_DIR/db_$DATE.sql

# Media files backup
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /opt/carehub/app/media/

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
sudo chmod +x /opt/carehub/backup.sh
```

### Schedule Backups

```bash
sudo crontab -e
```

Add:
```
0 2 * * * /opt/carehub/backup.sh >> /opt/carehub/logs/backup.log 2>&1
```

---

## Step 12: Security Hardening

### Firewall (UFW)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Deployment Checklist

- [ ] Server provisioned and updated
- [ ] PostgreSQL installed and configured
- [ ] Redis installed and running
- [ ] Application code deployed
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] .env configured with production values
- [ ] Database migrated
- [ ] Static files collected
- [ ] Superuser created
- [ ] Gunicorn service running
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Celery workers running (if needed)
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring set up
- [ ] DNS configured
- [ ] Application tested

---

## Updating Application

```bash
cd /opt/carehub/app
sudo -u carehub git pull
sudo -u carehub /opt/carehub/venv/bin/pip install -r requirements.txt
sudo -u carehub /opt/carehub/venv/bin/python manage.py migrate
sudo -u carehub /opt/carehub/venv/bin/python manage.py collectstatic --noinput
sudo systemctl restart carehub.service
sudo systemctl restart carehub-celery.service
```

---

## Troubleshooting

### Service Won't Start

```bash
sudo journalctl -u carehub.service -n 50 --no-pager
```

### 502 Bad Gateway

Check Gunicorn is running:
```bash
sudo systemctl status carehub.service
```

Check socket permissions:
```bash
ls -l /run/carehub.sock
```

### Database Connection Issues

Test connection:
```bash
sudo -u carehub /opt/carehub/venv/bin/python manage.py dbshell
```

---

## Performance Tuning

### Gunicorn Workers

Rule of thumb: `(2 x CPU cores) + 1`

### PostgreSQL

Edit `/etc/postgresql/12/main/postgresql.conf`:
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
```

### Redis

Edit `/etc/redis/redis.conf`:
```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

---

## Monitoring Tools (Optional)

- **Sentry**: Error tracking
- **New Relic**: Application performance monitoring
- **Prometheus + Grafana**: Metrics and dashboards
- **ELK Stack**: Log aggregation

---

## Support

For deployment issues, contact: devops@carehub.com
