# Docker Setup Guide for IT Services Freetown

Complete guide to containerize and deploy your Next.js application using Docker.

## Table of Contents
1. [Local Development with Docker](#local-development-with-docker)
2. [Deployment to AWS](#deployment-to-aws)
3. [Deployment to Google Cloud](#deployment-to-google-cloud)
4. [Deployment to DigitalOcean](#deployment-to-digitalocean)
5. [Troubleshooting](#troubleshooting)

---

## Local Development with Docker

### Prerequisites
- Docker Desktop installed ([download](https://www.docker.com/products/docker-desktop))
- Docker Compose included with Docker Desktop

### Quick Start

1. **Clone the repository** (if not already done)
   ```bash
   git clone https://github.com/ryanstewart047/web-app-it-services-freetown.git
   cd web-app-it-services-freetown
   ```

2. **Create `.env.local` file** with your configuration
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required variables:
   ```env
   # Database
   DB_NAME=its_freetown_db
   DB_USER=postgres
   DB_PASSWORD=your_secure_password_here
   
   # Application
   NODE_ENV=development
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   
   # Admin
   ADMIN_PASSWORD_HASH=your_hash_here
   
   # Google reCAPTCHA
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_key_here
   RECAPTCHA_SECRET_KEY=your_secret_here
   
   # Security
   FORM_SIGNING_KEY=your_random_key_here
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```
   
   This will:
   - Build the Next.js image
   - Start PostgreSQL database
   - Start the application on http://localhost:3000
   - Start Adminer (database UI) on http://localhost:8080

4. **Initialize database**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   docker-compose exec app npx prisma db seed
   ```

5. **View logs**
   ```bash
   docker-compose logs -f app
   ```

6. **Stop the application**
   ```bash
   docker-compose down
   ```

### Useful Commands

```bash
# Rebuild images after dependency changes
docker-compose up -d --build

# Access database
docker-compose exec postgres psql -U postgres -d its_freetown_db

# Run prisma commands
docker-compose exec app npx prisma studio

# View all containers
docker ps

# Remove everything (including data!)
docker-compose down -v
```

---

## Deployment to AWS

### Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- ECR (Elastic Container Registry) repository created

### Step 1: Create AWS Resources

```bash
# Create ECR repository
aws ecr create-repository \
  --repository-name its-freetown \
  --region us-east-1

# Create RDS PostgreSQL database
aws rds create-db-instance \
  --db-instance-identifier its-freetown-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --allocated-storage 20 \
  --master-username postgres \
  --master-user-password your_secure_password \
  --region us-east-1
```

### Step 2: Set GitHub Secrets

In GitHub repository settings, add these secrets:

```
AWS_ACCESS_KEY_ID         = (from AWS IAM)
AWS_SECRET_ACCESS_KEY     = (from AWS IAM)
ADMIN_PASSWORD_HASH       = (your hashed password)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY = (your reCAPTCHA key)
RECAPTCHA_SECRET_KEY      = (your reCAPTCHA secret)
FORM_SIGNING_KEY          = (random 32-char string)
```

### Step 3: Create ECS Task Definition

Create `its-freetown-task.json`:

```json
{
  "family": "its-freetown-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "its-freetown",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/its-freetown:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NEXT_PUBLIC_SITE_URL",
          "value": "https://your-domain.com"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:its-freetown/db-url"
        },
        {
          "name": "ADMIN_PASSWORD_HASH",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:its-freetown/admin-hash"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/its-freetown",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Step 4: Create ECS Cluster and Service

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name its-freetown-cluster

# Create ECS service (using CloudFormation is easier)
# See AWS documentation for detailed service configuration
```

### Step 5: Deploy

Push to main branch:
```bash
git push origin main
```

The GitHub Actions workflow will automatically build and push to ECR, then deploy to ECS.

### Cost Estimate
- **ECS Fargate**: $0.015/hour = ~$11/month
- **RDS db.t3.micro**: $0.017/hour = ~$12/month
- **ALB**: ~$16/month
- **Data transfer**: ~$5/month
- **Total**: ~$44-50/month

---

## Deployment to Google Cloud

### Prerequisites
- Google Cloud Account
- gcloud CLI installed and configured
- Cloud Run enabled

### Step 1: Setup Google Cloud Project

```bash
# Set project
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required services
gcloud services enable run.googleapis.com
gcloud services enable cloudsql.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudkms.googleapis.com
```

### Step 2: Create Cloud SQL Instance

```bash
# Create PostgreSQL instance
gcloud sql instances create its-freetown-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create its_freetown_db \
  --instance=its-freetown-db

# Create user
gcloud sql users create postgres \
  --instance=its-freetown-db \
  --password=your_secure_password
```

### Step 3: Set GitHub Secrets

In GitHub repository settings, add:

```
GCP_PROJECT_ID            = your-project-id
GCP_SA_KEY                = (JSON service account key)
GCP_DATABASE_URL          = postgresql://postgres:password@IP:5432/its_freetown_db
ADMIN_PASSWORD_HASH       = (your hashed password)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY = (your reCAPTCHA key)
RECAPTCHA_SECRET_KEY      = (your reCAPTCHA secret)
FORM_SIGNING_KEY          = (random 32-char string)
```

### Step 4: Create Service Account

```bash
# Create service account
gcloud iam service-accounts create cloud-run-deployer \
  --display-name="Cloud Run Deployer"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:cloud-run-deployer@$PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/run.admin

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=cloud-run-deployer@$PROJECT_ID.iam.gserviceaccount.com
```

### Step 5: Deploy

Push to main branch:
```bash
git push origin main
```

GitHub Actions will automatically deploy to Cloud Run.

### Cost Estimate
- **Cloud Run** (1M requests/month): ~$6
- **Cloud SQL db-f1-micro**: ~$10/month
- **Networking**: ~$5/month
- **Total**: ~$21/month (cheapest option)

---

## Deployment to DigitalOcean

### Prerequisites
- DigitalOcean Account with App Platform
- doctl CLI installed
- Container Registry enabled

### Step 1: Setup DigitalOcean

```bash
# Authenticate
doctl auth init

# Create container registry
doctl registry create its-freetown-registry

# Create database
doctl databases create its-freetown-db \
  --engine pg \
  --region nyc3 \
  --num-nodes 1

# Create App Platform
doctl apps create \
  --spec app.yaml
```

### Step 2: Create app.yaml

```yaml
name: its-freetown
services:
- name: api
  github:
    repo: ryanstewart047/web-app-it-services-freetown
    branch: main
  build_command: npm run build
  http_port: 3000
  source_dir: /
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    scope: RUN_TIME
    value: ${db.connection_string}
  - key: ADMIN_PASSWORD_HASH
    scope: RUN_TIME
    value: ${admin_password_hash}
  routes:
  - path: /
    source:
      type: SERVICE
      name: api
  health_check:
    http_path: /api/admin/auth

databases:
- name: db
  engine: PG
  version: "15"
  production: true

static_sites:
- name: assets
  source_dir: public
  routes:
  - path: /assets
```

### Step 3: Set GitHub Secrets

```
DIGITALOCEAN_ACCESS_TOKEN  = (from Account settings)
DIGITALOCEAN_REGISTRY      = registry name
DIGITALOCEAN_APP_ID        = app ID from App Platform
ADMIN_PASSWORD_HASH        = (your hashed password)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY = (your reCAPTCHA key)
RECAPTCHA_SECRET_KEY       = (your reCAPTCHA secret)
FORM_SIGNING_KEY           = (random 32-char string)
```

### Step 4: Deploy

Push to main:
```bash
git push origin main
```

DigitalOcean App Platform will auto-deploy on commit.

### Cost Estimate
- **App Platform**: $12/month minimum
- **Managed PostgreSQL**: $60+/month
- **Total**: ~$72+/month

---

## Troubleshooting

### Docker build fails
```bash
# Clean Docker cache and rebuild
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Database connection error
```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Check environment variables
docker-compose config | grep DATABASE_URL
```

### Application won't start
```bash
# View app logs
docker-compose logs app

# Check Prisma migrations
docker-compose exec app npx prisma migrate status

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

### Port already in use
```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or change port in docker-compose.yml
# ports:
#   - "3001:3000"
```

### Permission denied errors
```bash
# On Linux, add Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

---

## Security Best Practices

1. **Never commit secrets**
   - Use `.env.local` locally
   - Use GitHub Secrets for CI/CD
   - Use managed secrets (AWS Secrets Manager, Google Secret Manager)

2. **Use environment-specific configurations**
   - Keep different settings for dev/staging/production
   - Rotate passwords regularly

3. **Monitor logs**
   - Set up CloudWatch (AWS) or Cloud Logging (GCP)
   - Alert on errors and unusual activity

4. **Use HTTPS**
   - Enable SSL/TLS certificates
   - Use managed certificates when possible

5. **Database backups**
   - Enable automated backups
   - Test restore procedures regularly

---

## Support

For issues or questions:
1. Check Docker logs: `docker-compose logs app`
2. Review the Dockerfile for build issues
3. Check GitHub Actions workflow logs
4. Consult platform-specific documentation

Happy deploying! 🚀
