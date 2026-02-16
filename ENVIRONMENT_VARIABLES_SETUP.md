# 🔐 ENVIRONMENT VARIABLES SETUP GUIDE

## Overview

Environment variables are critical for production deployment. This guide explains each variable and how to set it up.

---

## TABLE OF CONTENTS
1. [Backend Variables](#backend-variables)
2. [Frontend Variables](#frontend-variables)
3. [How to Generate Secrets](#how-to-generate-secrets)
4. [Service-Specific Setup](#service-specific-setup)
5. [Testing Your Configuration](#testing-your-configuration)

---

## BACKEND VARIABLES

### Location: `Hubx_backend/.env`

### 1. DATABASE_URL
**What it is:** Connection string to your MySQL database
**Format:** `mysql://username:password@host:port/database`

#### Example Values:
```env
# Development
DATABASE_URL="mysql://root:password@localhost:3306/hubx_exam"

# Production (RDS)
DATABASE_URL="mysql://hubx_app:strong-password@prod-db.us-east-1.rds.amazonaws.com:3306/hubx_exam"

# Production (Self-hosted)
DATABASE_URL="mysql://hubx_app:strong-password@192.168.1.100:3306/hubx_exam"
```

**How to Create:**
```bash
# 1. Create database
mysql -u root -p << EOF
CREATE DATABASE hubx_exam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hubx_app'@'%' IDENTIFIED BY 'your-strong-password';
GRANT ALL PRIVILEGES ON hubx_exam.* TO 'hubx_app'@'%';
FLUSH PRIVILEGES;
EOF

# 2. Use this as DATABASE_URL
DATABASE_URL="mysql://hubx_app:your-strong-password@localhost:3306/hubx_exam"

# 3. Test connection
mysql -u hubx_app -p -h localhost hubx_exam -e "SELECT 1;"
```

---

### 2. JWT_SECRET & JWT_REFRESH_SECRET
**What it is:** Random string used to sign JWT tokens
**Why:** Secures user authentication
**Length:** Minimum 32 characters (64+ recommended)

#### Generate Secure Secret:
```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: a7f3e8d2b9c4a1f6e0d3c8b5a2f9e6d1c4b7a0f3e6d9c2b5a8f1e4d7a0c3f6

# Option 2: OpenSSL
openssl rand -hex 32
# Output: b8e4f1a6d2c7e9b3f0a5c8d1e6b3a8f1c4d7a0e3f6b9c2d5e8a1f4c7b0d3a6

# Option 3: Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

#### Production Setup:
```env
# Generate 2 different secrets
JWT_SECRET="a7f3e8d2b9c4a1f6e0d3c8b5a2f9e6d1c4b7a0f3e6d9c2b5a8f1e4d7a0c3f6"
JWT_REFRESH_SECRET="b8e4f1a6d2c7e9b3f0a5c8d1e6b3a8f1c4d7a0e3f6b9c2d5e8a1f4c7b0d3a6"

# Token expiration times
JWT_EXPIRE="7d"              # Access token valid for 7 days
JWT_REFRESH_EXPIRE="30d"     # Refresh token valid for 30 days
```

---

### 3. REDIS_URL
**What it is:** Connection string to Redis cache server
**Format:** `redis://[password@]host:port`

#### Example Values:
```env
# Development (local)
REDIS_URL="redis://localhost:6379"

# Production with password
REDIS_URL="redis://:your-redis-password@redis.hubx.com:6379"

# Production (AWS ElastiCache)
REDIS_URL="redis://prod-redis-cluster.123abc.ng.0001.use1.cache.amazonaws.com:6379"
```

#### Setup Redis Locally:
```bash
# Install
sudo apt-get install redis-server

# Set password in /etc/redis/redis.conf
requirepass your-strong-redis-password

# Restart
sudo systemctl restart redis-server

# Test connection
redis-cli -h localhost -p 6379 ping
# Should respond with PONG
```

---

### 4. AWS S3 CONFIGURATION
**What it is:** Cloud storage for user uploads (exams, PDFs, etc.)

#### Get AWS Credentials:
```
1. Go to AWS Console → IAM → Users
2. Create new user: "hubx-app"
3. Attach policy: AmazonS3FullAccess (or custom policy below)
4. Create access keys
5. Copy Key ID and Secret
```

#### Custom IAM Policy (Recommended):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::hubx-exam-uploads",
        "arn:aws:s3:::hubx-exam-uploads/*"
      ]
    }
  ]
}
```

#### Environment Variables:
```env
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIA1234567890ABCDEF"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
AWS_S3_BUCKET="hubx-exam-uploads"
```

#### Create S3 Bucket:
```bash
# Using AWS CLI
aws s3 mb s3://hubx-exam-uploads --region us-east-1

# Enable versioning (optional, for backup)
aws s3api put-bucket-versioning \
  --bucket hubx-exam-uploads \
  --versioning-configuration Status=Enabled

# Test upload
echo "test" > test.txt
aws s3 cp test.txt s3://hubx-exam-uploads/test.txt
```

---

### 5. RAZORPAY (PAYMENT GATEWAY)
**What it is:** Payment processing for exam purchases
**⚠️ CRITICAL:** Use LIVE keys in production, TEST keys in development

#### Get Razorpay Keys:
```
1. Go to https://dashboard.razorpay.com
2. Login to your account
3. Settings → API Keys
4. Copy Key ID and Key Secret

NEVER share these keys!
```

#### Environment Variables:
```env
# PRODUCTION (LIVE KEYS)
RAZORPAY_KEY_ID="rzp_live_abc123def456ghi789"
RAZORPAY_KEY_SECRET="aBcDeF1234567890gHiJk"

# STAGING/TESTING (TEST KEYS - PREFIX: rzp_test_)
# RAZORPAY_KEY_ID="rzp_test_xxx"
```

#### Test Payment Flow:
```
1. Create payment with live keys
2. Use test card: 4111111111111111
3. Expiry: Any future date (e.g., 12/25)
4. CVV: Any 3 digits
5. Payment should succeed
```

---

### 6. EMAIL CONFIGURATION (SMTP)
**What it is:** Email service for notifications and alerts

#### Using Gmail:
```bash
# 1. Enable 2-Step Verification on Gmail account
# 2. Go to myaccount.google.com/apppasswords
# 3. Generate app password for "Mail"
# 4. Copy the 16-character password
```

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"  # 16-char app password
MAIL_FROM="noreply@hubx.com"
```

#### Using SendGrid (Alternative):
```bash
# 1. Create account at https://sendgrid.com
# 2. Go to Settings → API Keys
# 3. Create new API key
```

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxxxxxxxxxxxx"
MAIL_FROM="noreply@hubx.com"
```

#### Using Mailgun (Alternative):
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@sandbox123.mailgun.org"
SMTP_PASSWORD="your-smtp-password"
MAIL_FROM="noreply@hubx.com"
```

#### Test Email Configuration:
```bash
# Create test file: test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

transporter.sendMail({
  from: process.env.MAIL_FROM,
  to: 'your-email@example.com',
  subject: 'Test Email',
  text: 'If you receive this, email is configured correctly!'
}, (err, info) => {
  if (err) console.log('Error:', err);
  else console.log('Success:', info.response);
});

# Run test
node test-email.js
```

---

### 7. OPENAI API KEY
**What it is:** AI model for generating exam questions
**Cost:** Pay-as-you-go (~$0.01-0.10 per request)

#### Get OpenAI API Key:
```
1. Go to https://platform.openai.com/account/api-keys
2. Create new secret key
3. Copy immediately (can't view again)
4. Add billing method
```

```env
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### Cost Management:
```
1. Set usage limits: https://platform.openai.com/account/billing/limits
2. Recommended: $100/month hard limit
3. Monitor usage: https://platform.openai.com/account/billing/overview
4. Use gpt-3.5-turbo for lower cost
```

---

### 8. APPLICATION CONFIGURATION

#### PORT
```env
PORT="8000"  # Default port, can be changed
```

#### FRONTEND_URL
**What it is:** URL of your frontend (for CORS)

```env
# Development
FRONTEND_URL="http://localhost:3000"

# Production
FRONTEND_URL="https://hubx.com"

# Staging
FRONTEND_URL="https://staging.hubx.com"
```

#### NODE_ENV
```env
NODE_ENV="production"  # CRITICAL for production!

# Options:
# - "development" (for dev)
# - "staging" (for QA)
# - "production" (for live)
```

#### LOG_LEVEL
```env
LOG_LEVEL="info"  # What to log

# Options:
# - "debug" (verbose, for development)
# - "info" (important info)
# - "warn" (warnings only)
# - "error" (errors only)
```

---

### 9. ERROR TRACKING (SENTRY - OPTIONAL)
**What it is:** Automatic error reporting and monitoring

```bash
# 1. Create account at https://sentry.io
# 2. Create new project (Node.js)
# 3. Copy DSN from Setup instructions
```

```env
SENTRY_DSN="https://abc123def456@ghi789.ingest.sentry.io/987654"
```

---

### 10. SECURITY SETTINGS

#### Rate Limiting
```env
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_REQUESTS_PER_MINUTE="100"  # 100 requests per 15 min
```

#### File Upload Size
```env
MAX_FILE_SIZE="50"  # Maximum 50 MB file uploads
```

---

### 11. FEATURE FLAGS

```env
# Enable/disable features
ENABLE_EMAIL_NOTIFICATIONS="true"
ENABLE_SMS_NOTIFICATIONS="false"
ENABLE_2FA="false"  # Two-factor authentication
```

---

## FRONTEND VARIABLES

### Location: `Hubx_frontend/.env.local`

### Complete Frontend .env:
```env
# ============================================
# API CONFIGURATION
# ============================================

# Development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Production
# NEXT_PUBLIC_API_BASE_URL=https://api.hubx.com/api
# NEXT_PUBLIC_WS_URL=wss://api.hubx.com

# ============================================
# FEATURE FLAGS
# ============================================

# Use real API instead of mock data
NEXT_PUBLIC_USE_MOCK_DATA=false

# ============================================
# ANALYTICS (OPTIONAL)
# ============================================

# Google Analytics
# NEXT_PUBLIC_GA_TRACKING_ID=UA-XXXXXXXXX-X

# Sentry error tracking
# NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

---

## HOW TO GENERATE SECRETS

### Secure Random String (32 chars):
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python3 -c "import secrets; print(secrets.token_hex(32))"

# Bash
tr -dc A-Za-z0-9 </dev/urandom | head -c 32
```

### Generate Multiple Secrets at Once:
```bash
#!/bin/bash
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 32)"
echo "REDIS_PASSWORD=$(openssl rand -hex 16)"
```

---

## SERVICE-SPECIFIC SETUP

### Complete AWS Setup
```bash
# 1. Install AWS CLI
pip install awscli

# 2. Configure credentials
aws configure
# Enter:
# - Access Key ID
# - Secret Access Key
# - Region: us-east-1
# - Output format: json

# 3. Create S3 bucket
aws s3 mb s3://hubx-exam-uploads

# 4. Create IAM user
aws iam create-user --user-name hubx-app

# 5. Create access keys
aws iam create-access-key --user-name hubx-app

# 6. Attach policy
aws iam put-user-policy --user-name hubx-app --policy-name S3Access --policy-document file://policy.json

# 7. Test S3 access
aws s3 ls s3://hubx-exam-uploads
```

### Complete MySQL Setup
```bash
# 1. Install MySQL
sudo apt-get install mysql-server mysql-client

# 2. Secure installation
sudo mysql_secure_installation

# 3. Connect
mysql -u root -p

# 4. Create database and user
CREATE DATABASE hubx_exam CHARACTER SET utf8mb4;
CREATE USER 'hubx_app'@'%' IDENTIFIED BY 'your-strong-password';
GRANT ALL PRIVILEGES ON hubx_exam.* TO 'hubx_app'@'%';
FLUSH PRIVILEGES;

# 5. Test connection
mysql -u hubx_app -p -h localhost hubx_exam -e "SELECT 1;"
```

---

## TESTING YOUR CONFIGURATION

### Test Backend Connection:
```bash
# 1. Create .env file
cp .env.example .env

# 2. Edit with your values
nano .env

# 3. Test database connection
npx prisma db execute --stdin < /dev/null

# 4. Generate Prisma client
npm run prisma:generate

# 5. Start server
npm run dev

# 6. Check server running
curl http://localhost:8000/api/v1/health
```

### Test Frontend Configuration:
```bash
# 1. Create .env.local
cp .env.example .env.local

# 2. Edit with your values
nano .env.local

# 3. Build
npm run build

# 4. Start
npm start

# 5. Check browser console for errors
# Visit http://localhost:3000
```

### Test All Variables:
```bash
# Create test script: test-env.js
require('dotenv').config();

const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'REDIS_URL',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'NODE_ENV'
];

let missing = [];
requiredVars.forEach(v => {
  if (!process.env[v]) missing.push(v);
});

if (missing.length > 0) {
  console.error('Missing variables:', missing);
  process.exit(1);
} else {
  console.log('✅ All required variables configured!');
}

# Run
node test-env.js
```

---

## PRODUCTION DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All variables set in production environment
- [ ] No localhost URLs (except development)
- [ ] NODE_ENV="production"
- [ ] Using LIVE Razorpay keys (not test keys)
- [ ] Database URL points to production database
- [ ] Redis URL points to production Redis
- [ ] AWS credentials are production keys
- [ ] SSL/TLS certificate configured
- [ ] Email service tested
- [ ] All secrets are strong (32+ characters)
- [ ] No secrets in code files
- [ ] .env file in .gitignore
- [ ] Environment variables stored securely
- [ ] Backup strategy configured
- [ ] Monitoring/logging enabled
- [ ] Error tracking (Sentry) configured

---

## SECURITY BEST PRACTICES

✅ **DO:**
- Use environment variables for all secrets
- Rotate keys every 90 days
- Use different keys for each environment
- Use strong passwords (32+ characters)
- Log successful deployments
- Monitor for unauthorized access

❌ **DON'T:**
- Commit .env files to Git
- Share secrets via email/chat
- Use same credentials for multiple services
- Keep old/unused keys active
- Write secrets in code comments
- Store secrets in plain text files

---

**Last Updated:** February 2025
**Version:** 1.0.0
