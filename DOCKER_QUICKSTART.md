# Docker Setup Quick Start

Get started with Docker in 5 minutes!

## Prerequisites
- Install Docker Desktop: https://www.docker.com/products/docker-desktop

## Quick Start

### 1. Create `.env.local`
```bash
cat > .env.local << EOF
# Database
DB_NAME=its_freetown_db
DB_USER=postgres
DB_PASSWORD=change_me_to_secure_password

# Application
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin (generate with: node -e "console.log(require('crypto').createHash('sha256').update('admin123').digest('hex'))")
ADMIN_PASSWORD_HASH=a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3

# reCAPTCHA (get from https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

# Security
FORM_SIGNING_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
EOF
```

### 2. Start Docker containers
```bash
docker-compose up -d
```

### 3. Wait for PostgreSQL to be ready (30 seconds)
```bash
docker-compose logs -f postgres
```

### 4. Run database migrations
```bash
docker-compose exec app npx prisma migrate deploy
```

### 5. Open application
- Website: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin
- Database UI (Adminer): http://localhost:8080
- Database: postgres (user: postgres, password: your password from .env.local)

## Common Commands

```bash
# View logs
docker-compose logs -f app

# Access Node shell
docker-compose exec app bash

# Access database
docker-compose exec postgres psql -U postgres -d its_freetown_db

# Rebuild after code changes
docker-compose up -d --build

# Stop all containers
docker-compose down

# Remove everything including database data
docker-compose down -v
```

## Database Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres its_freetown_db > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres its_freetown_db < backup.sql
```

## Production Deployment

See full deployment guide: [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md)

Quick options:
- **AWS ECS**: ~$44/month
- **Google Cloud Run**: ~$21/month (cheapest)
- **DigitalOcean**: ~$72/month

## Troubleshooting

**Port 3000 already in use?**
```bash
# Change in docker-compose.yml line: ports: - "3001:3000"
# Or kill existing process:
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Docker won't start?**
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

**Database won't connect?**
```bash
docker-compose exec postgres psql -U postgres -d its_freetown_db -c "SELECT 1"
```

## Next Steps

1. ✅ Local development with Docker running
2. Push to GitHub to trigger Docker build workflow
3. Deploy to cloud platform (AWS/GCP/DigitalOcean)

Happy coding! 🚀
