# 🚀 HubX PRODUCTION REQUIREMENTS - COMPLETE GUIDE

**Version:** 1.0.0
**Last Updated:** February 2025
**Status:** Production Ready

---

## 📋 TABLE OF CONTENTS

1. [System & Server Requirements](#system--server-requirements)
2. [Infrastructure Architecture](#infrastructure-architecture)
3. [Database Configuration](#database-configuration)
4. [Backend Requirements](#backend-requirements)
5. [Frontend Requirements](#frontend-requirements)
6. [Third-Party Services](#third-party-services)
7. [Security Checklist](#security-checklist)
8. [Environment Variables (Production)](#environment-variables-production)
9. [Deployment Checklist](#deployment-checklist)
10. [Monitoring & Logging](#monitoring--logging)
11. [Scaling & Performance](#scaling--performance)
12. [Disaster Recovery](#disaster-recovery)
13. [Cost Estimation](#cost-estimation)

---

## 1. SYSTEM & SERVER REQUIREMENTS

### 1.1 Server Specifications

#### Minimum Requirements
```
CPU:      4 vCPU cores
RAM:      8 GB minimum
Storage:  100 GB SSD
Network:  1 Gbps
```

#### Recommended Requirements (Production)
```
CPU:      8+ vCPU cores
RAM:      16-32 GB
Storage:  500 GB SSD (with auto-scaling)
Network:  10+ Gbps
CDN:      CloudFront / Cloudflare
```

### 1.2 Operating System
- **Linux:** Ubuntu 20.04 LTS / Ubuntu 22.04 LTS (Recommended)
- **Or:** AWS EC2 / Google Cloud / Azure VM instances

### 1.3 Runtime & Tools
- **Node.js:** 18.x or 20.x LTS (Recommended: 20.x)
- **npm:** 9.x or higher
- **Docker:** 20.10+
- **Docker Compose:** 2.0+
- **Git:** Latest version for CI/CD

---

## 2. INFRASTRUCTURE ARCHITECTURE

### 2.1 Recommended Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare / CDN                        │
│                  (SSL/TLS, Caching)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────▼────────┐              ┌────────────▼───────┐
│  Frontend      │              │  Backend           │
│  (Next.js)     │              │  (Express.js)      │
│  Port: 443     │              │  Port: 443         │
│  20.x          │              │  20.x              │
└───────┬────────┘              └────────┬───────────┘
        │                               │
        │                    ┌──────────┴──────────┐
        │                    │                     │
        │            ┌───────▼────────┐  ┌─────────▼──────┐
        │            │    MySQL       │  │     Redis      │
        │            │    8.0+        │  │     7.x        │
        │            │    Cluster     │  │     Cluster    │
        │            │    (RDS/VM)    │  │     (ElastiCache)
        │            └────────────────┘  └────────────────┘
        │
        └────────────────────────┬────────────────────┐
                                 │                    │
                        ┌────────▼──────┐  ┌──────────▼──┐
                        │   AWS S3      │  │   Backup    │
                        │  (File Store) │  │   Storage   │
                        └───────────────┘  └─────────────┘
```

### 2.2 Deployment Options

**Option A: Docker Containers (Recommended)**
- Single server with Docker & Docker Compose
- Auto-scaling with Docker Swarm or Kubernetes
- Best for: Small to Medium deployments

**Option B: Cloud-Native (AWS/GCP/Azure)**
- ECS/EKS for container orchestration
- RDS for managed MySQL
- ElastiCache for managed Redis
- S3/Cloud Storage for file uploads
- Best for: Large-scale, production deployments

**Option C: Traditional VPS/VM**
- Manual server setup
- Services running as systemd units
- Manual scaling and monitoring
- Best for: Budget-conscious deployments

---

## 3. DATABASE CONFIGURATION

### 3.1 MySQL Setup (Production)

#### Installation
```bash
# On Ubuntu
sudo apt-get update
sudo apt-get install mysql-server mysql-client
sudo mysql_secure_installation

# Or use AWS RDS / Google Cloud SQL (Recommended)
```

#### Specifications
```
Version:        8.0 or higher
Character Set:  utf8mb4
Collation:      utf8mb4_unicode_ci
Storage Engine: InnoDB
```

#### Database Creation
```sql
-- Create production database
CREATE DATABASE hubx_exam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user (NOT root)
CREATE USER 'hubx_app'@'%' IDENTIFIED BY 'strong-password-32-chars-min';
GRANT ALL PRIVILEGES ON hubx_exam.* TO 'hubx_app'@'%';
FLUSH PRIVILEGES;

-- Enable binary logging for backups
-- Add to MySQL config: log_bin=/var/log/mysql/mysql-bin.log
```

#### Performance Tuning
```ini
[mysqld]
# Connection limits
max_connections = 1000
max_user_connections = 200

# Buffer pool (set to 70% of available RAM)
innodb_buffer_pool_size = 10G

# Query cache
query_cache_type = 1
query_cache_size = 256M

# Slow query log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Binary logging
log_bin = /var/log/mysql/mysql-bin.log
binlog_retention_days = 7
```

#### Required Indexes
```sql
-- Add indexes for better performance
ALTER TABLE StudentProfile ADD INDEX idx_userId (userId);
ALTER TABLE StudentSettings ADD INDEX idx_userId (userId);
ALTER TABLE SupportTicket ADD INDEX idx_studentId (studentId);
ALTER TABLE SupportTicket ADD INDEX idx_status (status);
ALTER TABLE UserAchievement ADD INDEX idx_userId (userId);
ALTER TABLE UserAchievement ADD INDEX idx_achievementId (achievementId);

-- Verify indexes
SHOW INDEXES FROM StudentProfile;
SHOW INDEXES FROM StudentSettings;
```

#### Backup Strategy
```bash
# Daily automated backup
0 2 * * * /usr/bin/mysqldump -u hubx_app -p$DB_PASSWORD hubx_exam > /backups/hubx_$(date +\%Y\%m\%d).sql

# Backup location
/backups/ or S3://hubx-backups/

# Retention: Keep 30 days of backups
```

### 3.2 Redis Setup (Production)

#### Installation
```bash
# Option 1: AWS ElastiCache (Recommended for production)
# https://aws.amazon.com/elasticache/

# Option 2: Manual installation
sudo apt-get install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Option 3: Docker
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

#### Configuration
```ini
# /etc/redis/redis.conf
port 6379
bind 0.0.0.0
protected-mode yes
timeout 300
databases 16
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
```

#### Security
```bash
# Set Redis password
requirepass very-strong-password-here

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
```

#### Memory Management
```ini
maxmemory 2gb
maxmemory-policy allkeys-lru
```

---

## 4. BACKEND REQUIREMENTS

### 4.1 Node.js Setup

#### Installation
```bash
# Using nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20.10.0
nvm use 20.10.0

# Or using apt
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Verify Installation
```bash
node --version  # Should be v20.10.0+
npm --version   # Should be 9.0.0+
```

### 4.2 Backend Dependencies (Production)

#### Core Stack
```json
{
  "name": "hubx-exam-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/server.js",
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=9.0.0"
  }
}
```

#### All Required Dependencies
```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.600.0",          // AWS S3 file uploads
    "@prisma/client": "^5.21.1",               // Database ORM
    "bcryptjs": "^2.4.3",                      // Password hashing
    "cors": "^2.8.5",                          // CORS middleware
    "dotenv": "^17.3.1",                       // Environment variables
    "exceljs": "^4.4.0",                       // Excel export
    "express": "^4.18.2",                      // Web framework
    "express-rate-limit": "^8.2.1",            // Rate limiting
    "express-validator": "^7.0.0",             // Input validation
    "helmet": "^8.1.0",                        // Security headers
    "ioredis": "^5.3.6",                       // Redis client
    "jsonwebtoken": "^9.0.3",                  // JWT tokens
    "jszip": "^3.10.1",                        // ZIP files
    "morgan": "^1.10.0",                       // Request logging
    "multer": "^1.4.5-lts.1",                  // File upload
    "nanoid": "^3.3.7",                        // ID generation
    "nodemailer": "^6.9.8",                    // Email sending
    "openai": "^6.22.0",                       // AI integration
    "razorpay": "^2.9.2",                      // Payment gateway
    "socket.io": "^4.7.2",                     // Real-time chat
    "tesseract.js": "^7.0.0",                  // OCR
    "uuid": "^9.0.1",                          // UUID generation
    "xlsx": "^0.18.5"                          // Excel parsing
  }
}
```

### 4.3 Build & Compilation

#### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### Build Process
```bash
# Install dependencies
npm ci  # Use 'ci' instead of 'install' for production (more reliable)

# Generate Prisma client
npm run prisma:generate

# Compile TypeScript
npm run build

# Output goes to: dist/server.js
```

### 4.4 Prisma Database Migrations

#### Before Production Deployment
```bash
# 1. Generate Prisma client
npm run prisma:generate

# 2. Create migration (if schema changes)
npx prisma migrate dev --name init

# 3. Deploy migrations to production
npx prisma migrate deploy

# 4. Verify schema
npx prisma studio  # Visit http://localhost:5555
```

#### Migration Safety
```bash
# Preview migrations before applying
npx prisma migrate resolve --applied init
npx prisma migrate status

# Never run:
# - prisma migrate reset (destroys data!)
# - prisma db push (on production - use migrate deploy instead)
```

---

## 5. FRONTEND REQUIREMENTS

### 5.1 Next.js Setup

#### Build & Deployment
```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Output directory: .next/

# Verify build
npm run lint

# Test build locally
npm run start
```

#### Production Environment Variables
```env
# .env.local (Production)
NEXT_PUBLIC_API_BASE_URL=https://api.hubx.com/api
NEXT_PUBLIC_WS_URL=wss://api.hubx.com
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 5.2 Deployment Options

#### Option A: Vercel (Easiest, Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Auto handles:
# - SSL/TLS certificates
# - CDN & caching
# - Serverless functions
# - Environment variables
# - Automatic rollback
```

#### Option B: Docker Container
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
```

#### Option C: Traditional Server
```bash
# Build
npm run build

# Start with PM2 (process manager)
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'hubx-frontend',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Start
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 6. THIRD-PARTY SERVICES

### 6.1 AWS S3 (File Storage)

#### Setup
```bash
# 1. Create S3 bucket
aws s3 mb s3://hubx-exam-uploads

# 2. Create IAM user for application
aws iam create-user --user-name hubx-app-s3

# 3. Create access keys
aws iam create-access-key --user-name hubx-app-s3

# 4. Attach policy
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::hubx-exam-uploads",
        "arn:aws:s3:::hubx-exam-uploads/*"
      ]
    }
  ]
}
```

#### Configuration
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=hubx-exam-uploads
```

#### Storage Management
```bash
# Lifecycle policy (delete old uploads after 90 days)
aws s3api put-bucket-lifecycle-configuration \
  --bucket hubx-exam-uploads \
  --lifecycle-configuration file://lifecycle.json
```

### 6.2 Razorpay (Payment Gateway)

#### Account Setup
```bash
# 1. Create account at https://razorpay.com
# 2. Go to Dashboard > API Keys
# 3. Copy Key ID and Key Secret

# Production keys: Use Live mode keys (not Test)
```

#### Configuration
```env
# PRODUCTION (Live Keys)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# Test (Only for staging)
# RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

#### Webhook Setup
```bash
# Configure webhook in Razorpay dashboard
URL: https://api.hubx.com/api/v1/payment/webhook
Events to track:
  - payment.authorized
  - payment.failed
  - payment.captured
  - refund.created
```

### 6.3 Email Service (SMTP)

#### Gmail Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # NOT regular password!
MAIL_FROM=noreply@hubx.com
```

#### Generate Gmail App Password
```
1. Go to myaccount.google.com
2. Enable 2-Factor Authentication
3. Go to App passwords
4. Create password for "Mail" and "Windows Computer"
5. Use that password in SMTP_PASSWORD
```

#### Alternative: SendGrid
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
MAIL_FROM=noreply@hubx.com
```

### 6.4 OpenAI (AI Question Generation)

#### Setup
```bash
# 1. Create account at https://platform.openai.com
# 2. Generate API key
# 3. Add billing method
```

#### Configuration
```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo for cost savings
```

#### Cost Management
```bash
# Set usage limits in OpenAI console
# Hard limit: $100/month recommended
# Monitor usage: https://platform.openai.com/account/billing/overview
```

### 6.5 Error Tracking (Sentry - Optional)

#### Setup
```bash
npm install @sentry/node

# 1. Create account at https://sentry.io
# 2. Create new project (Node.js)
# 3. Copy DSN
```

#### Configuration
```env
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
NODE_ENV=production
```

---

## 7. SECURITY CHECKLIST

### 7.1 Environment Variables Security

✅ **CRITICAL REQUIREMENTS:**
```
❌ NEVER commit .env files to Git
✅ Use .env.example with placeholder values
✅ Store secrets in:
   - GitHub Secrets (for CI/CD)
   - Environment variables
   - Vault systems
✅ Rotate secrets regularly (every 90 days)
❌ NEVER log sensitive values
✅ Use different secrets for each environment
```

### 7.2 Database Security

```bash
# Change default MySQL root password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'strong-password';

# Create app-specific user (not root)
CREATE USER 'hubx_app'@'%' IDENTIFIED BY 'strong-password';

# Restrict permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON hubx_exam.* TO 'hubx_app'@'%';

# Disable remote root access
DELETE FROM mysql.user WHERE User='root' AND Host!='localhost';
FLUSH PRIVILEGES;
```

### 7.3 SSL/TLS Certificates

#### Using Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d api.hubx.com -d hubx.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify
sudo certbot renew --dry-run
```

#### Certificate Path
```
/etc/letsencrypt/live/api.hubx.com/fullchain.pem
/etc/letsencrypt/live/api.hubx.com/privkey.pem
```

### 7.4 CORS Configuration

#### Backend Setup
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL,  // https://hubx.com in production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 7.5 Rate Limiting

#### Configuration
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.role === 'ADMIN'
});

app.use('/api/', limiter);
```

### 7.6 Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.FRONTEND_URL]
    }
  },
  hsts: {
    maxAge: 31536000,  // 1 year
    includeSubDomains: true,
    preload: true
  }
}));
```

### 7.7 Password Requirements

```
Minimum: 12 characters
Must include:
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters (!@#$%^&*)
```

### 7.8 JWT Security

```env
# Production values must be:
JWT_SECRET=generate-32-char-random-string
JWT_REFRESH_SECRET=generate-different-32-char-string
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
```

#### Generate Secure Token
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 8. ENVIRONMENT VARIABLES (PRODUCTION)

### 8.1 Complete .env Template (Production)

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL="mysql://hubx_app:strong-password@prod-db.hubx.com:3306/hubx_exam"

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET="your-32-char-hex-string-here"
JWT_REFRESH_SECRET="another-32-char-hex-string"
JWT_EXPIRE="7d"
JWT_REFRESH_EXPIRE="30d"

# ============================================
# REDIS CONFIGURATION
# ============================================
REDIS_URL="redis://prod-redis.hubx.com:6379"

# ============================================
# AWS S3 CONFIGURATION
# ============================================
AWS_REGION="eu-central-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="hubx-exam-uploads-prod"

# ============================================
# RAZORPAY (PAYMENT GATEWAY)
# ============================================
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."

# ============================================
# EMAIL CONFIGURATION
# ============================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="app-specific-password"
MAIL_FROM="noreply@hubx.com"

# ============================================
# OpenAI CONFIGURATION
# ============================================
OPENAI_API_KEY="sk-..."

# ============================================
# APPLICATION CONFIGURATION
# ============================================
PORT="8000"
FRONTEND_URL="https://hubx.com"
NODE_ENV="production"
LOG_LEVEL="info"

# ============================================
# SENTRY (ERROR TRACKING)
# ============================================
SENTRY_DSN="https://...@sentry.io/..."

# ============================================
# SECURITY SETTINGS
# ============================================
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_REQUESTS_PER_MINUTE="100"
MAX_FILE_SIZE="50"

# ============================================
# FEATURE FLAGS
# ============================================
ENABLE_EMAIL_NOTIFICATIONS="true"
ENABLE_SMS_NOTIFICATIONS="false"
ENABLE_2FA="false"
```

### 8.2 Frontend .env.local (Production)

```env
NEXT_PUBLIC_API_BASE_URL=https://api.hubx.com/api
NEXT_PUBLIC_WS_URL=wss://api.hubx.com
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

---

## 9. DEPLOYMENT CHECKLIST

### 9.1 Pre-Deployment (1-2 Weeks Before)

- [ ] **Code Review**
  - [ ] All code reviewed and merged to main
  - [ ] No console.log statements
  - [ ] No hardcoded secrets
  - [ ] All tests passing

- [ ] **Database Preparation**
  - [ ] Production MySQL instance created
  - [ ] Backups enabled
  - [ ] Replication configured (if multi-server)
  - [ ] Indexes created
  - [ ] Performance tuning completed

- [ ] **Infrastructure Setup**
  - [ ] Production servers provisioned
  - [ ] SSL certificates installed
  - [ ] Firewalls configured
  - [ ] Monitoring tools installed
  - [ ] CDN configured

- [ ] **Security Audit**
  - [ ] OWASP Top 10 security check
  - [ ] Penetration testing (if applicable)
  - [ ] Dependency vulnerabilities check: `npm audit`
  - [ ] SSL/TLS configuration tested

### 9.2 Deployment Day

#### Step 1: Database Migration
```bash
cd Hubx_backend

# 1. Backup current database
mysqldump -u hubx_app -p hubx_exam > backup_$(date +%Y%m%d_%H%M%S).sql
aws s3 cp backup_*.sql s3://hubx-backups/

# 2. Apply migrations
npm run prisma:migrate

# 3. Verify schema
npm run prisma:studio
```

#### Step 2: Backend Deployment
```bash
cd Hubx_backend

# 1. Build application
npm ci
npm run build

# 2. Create .env with production values
cp .env.example .env
# Edit .env with production credentials

# 3. Test locally
npm start

# 4. Deploy (using Docker)
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify health
curl https://api.hubx.com/api/v1/health
```

#### Step 3: Frontend Deployment
```bash
cd Hubx_frontend

# 1. Build
npm ci
npm run build

# 2. Deploy to Vercel (if using Vercel)
vercel --prod

# OR deploy to your server
docker build -t hubx-frontend .
docker run -d -p 3000:3000 hubx-frontend

# 3. Verify
curl https://hubx.com
```

#### Step 4: Verification
```bash
# Test all critical endpoints
curl -H "Authorization: Bearer $TOKEN" https://api.hubx.com/api/v1/student/profile/$USER_ID
curl https://api.hubx.com/api/v1/health
curl https://hubx.com
```

### 9.3 Post-Deployment (Day 1-7)

- [ ] **24-Hour Monitoring**
  - [ ] Monitor error logs
  - [ ] Check response times
  - [ ] Verify no data corruption
  - [ ] Test user workflows

- [ ] **Performance Baseline**
  - [ ] Record API response times
  - [ ] Monitor database query performance
  - [ ] Check memory/CPU usage
  - [ ] Monitor error rates

- [ ] **User Communication**
  - [ ] Notify users of launch
  - [ ] Provide support contact info
  - [ ] Monitor user feedback
  - [ ] Track user adoption

- [ ] **Rollback Plan**
  - [ ] Keep previous version deployed
  - [ ] Document rollback steps
  - [ ] Test rollback procedure
  - [ ] Have DNS/load balancer ready

---

## 10. MONITORING & LOGGING

### 10.1 Application Logging

#### Backend Logger Setup
```typescript
import morgan from 'morgan';

// Morgan HTTP request logger
app.use(morgan('combined'));

// Custom error logger
const errorLog = fs.createWriteStream('./logs/error.log', { flags: 'a' });
const accessLog = fs.createWriteStream('./logs/access.log', { flags: 'a' });

app.use(morgan('combined', { stream: accessLog }));
```

#### Log Rotation
```bash
# Install logrotate
sudo apt-get install logrotate

# Create /etc/logrotate.d/hubx
/var/log/hubx/*.log {
  daily
  rotate 14
  compress
  delaycompress
  notifempty
  create 0640 hubx hubx
  sharedscripts
  postrotate
    systemctl reload hubx > /dev/null 2>&1 || true
  endscript
}

# Apply
sudo logrotate -f /etc/logrotate.d/hubx
```

### 10.2 Error Tracking (Sentry)

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,  // 10% of transactions
});

// Capture errors
app.use((err, req, res, next) => {
  Sentry.captureException(err);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

### 10.3 Performance Monitoring

#### Key Metrics to Monitor
```
✓ API Response Time (target: <200ms)
✓ Database Query Time (target: <100ms)
✓ Server CPU Usage (target: <70%)
✓ Server RAM Usage (target: <80%)
✓ Error Rate (target: <0.1%)
✓ Request Rate (per second)
✓ Cache Hit Rate (target: >80%)
```

#### Monitoring Tools

**Option 1: Prometheus + Grafana**
```bash
# Install Prometheus
sudo apt-get install prometheus

# Install Grafana
sudo apt-get install grafana-server
```

**Option 2: DataDog**
```bash
npm install dd-trace
```

**Option 3: New Relic**
```bash
npm install newrelic
```

### 10.4 Uptime Monitoring

#### Services to Monitor
```bash
# UptimeRobot (Free tier available)
https://uptimerobot.com/

# Pingdom
https://www.pingdom.com/

# Checkhosts
https://checkhosts.net/
```

---

## 11. SCALING & PERFORMANCE

### 11.1 Horizontal Scaling

#### Load Balancer Setup (Nginx)
```nginx
upstream backend {
  server api-1.hubx.com:8000 weight=1;
  server api-2.hubx.com:8000 weight=1;
  server api-3.hubx.com:8000 weight=1;
}

server {
  listen 443 ssl http2;
  server_name api.hubx.com;

  location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

### 11.2 Database Optimization

#### Connection Pooling
```typescript
import { Pool } from '@prisma/client';

const pool = new PrismaClient({
  datasources: {
    db: {
      url: `${process.env.DATABASE_URL}?pool_size=20`
    }
  }
});
```

#### Caching Strategy
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache profile for 1 hour
async function getProfile(userId) {
  const cached = await redis.get(`profile:${userId}`);
  if (cached) return JSON.parse(cached);

  const profile = await db.studentProfile.findUnique({
    where: { userId }
  });

  await redis.setex(`profile:${userId}`, 3600, JSON.stringify(profile));
  return profile;
}
```

### 11.3 Auto-Scaling

#### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Create service with auto-scaling
docker service create --name hubx-api \
  --publish 8000:8000 \
  --replicas 3 \
  --update-delay 10s \
  hubx-api:latest
```

#### Kubernetes (Advanced)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hubx-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hubx-backend
  template:
    metadata:
      labels:
        app: hubx-backend
    spec:
      containers:
      - name: hubx-backend
        image: hubx-api:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hubx-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hubx-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 12. DISASTER RECOVERY

### 12.1 Backup Strategy

#### Automated Daily Backups
```bash
#!/bin/bash
# /opt/hubx/backup.sh

BACKUP_DIR="/mnt/backups"
DB_PASSWORD=$DB_PASSWORD
DATE=$(date +%Y%m%d_%H%M%S)

# MySQL backup
mysqldump -u hubx_app -p$DB_PASSWORD hubx_exam \
  --single-transaction \
  --quick \
  --lock-tables=false \
  > $BACKUP_DIR/mysql_$DATE.sql

# Compress
gzip $BACKUP_DIR/mysql_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/mysql_$DATE.sql.gz \
  s3://hubx-backups/mysql/

# Keep only 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

#### Cron Job
```bash
# Run daily at 2 AM
0 2 * * * /opt/hubx/backup.sh >> /var/log/hubx-backup.log 2>&1
```

### 12.2 Disaster Recovery Plan

#### RTO (Recovery Time Objective): 1 Hour
#### RPO (Recovery Point Objective): 1 Day

#### Step 1: Detect Disaster
```
- Monitor detects service down for >5 minutes
- Alert sent to on-call team
- Incident declared
```

#### Step 2: Activate Disaster Recovery
```bash
# 1. Switch DNS to backup server
aws route53 change-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --change-batch file://failover.json

# 2. Restore from latest backup
mysql -u root -p < /backups/mysql_latest.sql

# 3. Verify data integrity
mysql hubx_exam -e "SELECT COUNT(*) FROM User;"

# 4. Restart services
systemctl restart hubx-backend hubx-frontend
```

#### Step 3: Testing
```bash
# Test monthly
# Full disaster recovery drill
# Document any issues
```

---

## 13. COST ESTIMATION

### 13.1 Monthly Infrastructure Costs (Estimated)

#### Option A: AWS (Recommended for Production)
```
EC2 Instances (4 x t3.xlarge):    $400/month
RDS MySQL (db.r6i.2xlarge):       $600/month
ElastiCache Redis:                $150/month
S3 Storage (100GB):               $50/month
S3 Data Transfer:                 $20/month
CloudFront CDN:                   $100/month
Route53 DNS:                      $10/month
Backup Storage:                   $50/month
─────────────────────────────────
TOTAL:                            ~$1,380/month
```

#### Option B: DigitalOcean (Budget Option)
```
App Platform (3 x $12):           $36/month
Database (Basic):                 $50/month
Spaces (S3 equivalent):           $20/month
─────────────────────────────────
TOTAL:                            ~$106/month
```

#### Option C: VPS (Minimal Setup)
```
VPS Server (16GB RAM):            $50/month
Domain:                           $12/month
SSL (Let's Encrypt):              Free
─────────────────────────────────
TOTAL:                            ~$62/month
```

### 13.2 Third-Party Service Costs

```
Razorpay (Payment):               2-3% of transactions
OpenAI (AI):                      $0.01-0.10 per request
Email (Mailgun):                  $0.50 per 1000 emails
Sentry (Error Tracking):          Free tier or $29+
SendGrid (Email):                 $10-120/month
─────────────────────────────────
Estimated:                        $50-200/month
```

### 13.3 Total Annual Cost Estimate
```
Infrastructure:    $1,380 × 12 = $16,560
Services:          $100 × 12   = $1,200
SSL Certificate:   Free (Let's Encrypt)
─────────────────────────────────
TOTAL:                          $17,760/year
```

---

## ✅ FINAL PRE-LAUNCH CHECKLIST

### Security
- [ ] All secrets rotated and stored securely
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set (Helmet)
- [ ] JWT expiration configured
- [ ] No credentials in code

### Infrastructure
- [ ] Database replicated (if multi-region)
- [ ] Backups automated and tested
- [ ] Load balancer configured
- [ ] CDN configured
- [ ] Monitoring tools installed
- [ ] Alert thresholds set
- [ ] Logging configured
- [ ] Error tracking (Sentry) enabled

### Application
- [ ] All dependencies up to date
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Tests passing (>80% coverage)
- [ ] Build optimized for production
- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] Seed data loaded

### Performance
- [ ] API response time <200ms
- [ ] Database queries optimized
- [ ] Indexes created
- [ ] Caching enabled (Redis)
- [ ] CDN caching rules set
- [ ] Load testing passed

### Documentation
- [ ] README.md complete
- [ ] API documentation updated
- [ ] Deployment guide written
- [ ] Troubleshooting guide created
- [ ] Runbook for on-call engineers
- [ ] Disaster recovery plan documented
- [ ] Team trained

### Monitoring
- [ ] Uptime monitoring configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Log aggregation configured
- [ ] Alerts configured
- [ ] Dashboard created

---

## 📞 SUPPORT & ESCALATION

### Incident Severity Levels
```
P1 (Critical):    Service completely down
                  Escalate immediately to ops team
                  Target resolution: 30 minutes

P2 (High):        Service degraded, many users affected
                  Escalate to engineering
                  Target resolution: 2 hours

P3 (Medium):      Feature not working, some users affected
                  Log ticket, fix in next release
                  Target resolution: 24 hours

P4 (Low):         Minor issue, few users affected
                  Log and prioritize
                  Target resolution: 1 week
```

---

## 📚 ADDITIONAL RESOURCES

- [Express.js Deployment](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Prisma Production Checklist](https://www.prisma.io/docs/guides/deployment/production-checklist)
- [Next.js Production](https://nextjs.org/docs/going-to-production)
- [AWS Best Practices](https://docs.aws.amazon.com/general/latest/gr/aws-security-audit-guide.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Document Version:** 1.0.0
**Last Updated:** February 2025
**Status:** Production Ready ✅

For questions or updates, please contact the DevOps team.
