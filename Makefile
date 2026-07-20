.PHONY: help build up down logs shell db-shell migrate seed clean restart

# Default target
help:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║   IT Services Freetown - Docker Development Commands      ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Available commands:"
	@echo "  make build          Build Docker images"
	@echo "  make up             Start all containers"
	@echo "  make down           Stop all containers"
	@echo "  make restart        Restart containers"
	@echo "  make logs           View application logs"
	@echo "  make shell          Open Node.js shell in app container"
	@echo "  make db-shell       Access PostgreSQL database shell"
	@echo "  make migrate        Run database migrations"
	@echo "  make seed           Seed database with sample data"
	@echo "  make studio         Open Prisma Studio (DB visualization)"
	@echo "  make clean          Remove containers and volumes"
	@echo "  make status         Show container status"
	@echo "  make backup         Backup database to backup.sql"
	@echo "  make restore        Restore database from backup.sql"
	@echo ""

build:
	docker-compose build

up:
	docker-compose up -d
	@echo "✅ Containers started!"
	@echo "   Website:      http://localhost:3000"
	@echo "   Admin:        http://localhost:3000/admin"
	@echo "   Adminer:      http://localhost:8080"

down:
	docker-compose down

restart: down up

logs:
	docker-compose logs -f app

logs-db:
	docker-compose logs -f postgres

logs-all:
	docker-compose logs -f

shell:
	docker-compose exec app bash

db-shell:
	docker-compose exec postgres psql -U postgres -d its_freetown_db

migrate:
	docker-compose exec app npx prisma migrate deploy
	@echo "✅ Migrations complete!"

seed:
	docker-compose exec app npx prisma db seed
	@echo "✅ Database seeded!"

studio:
	docker-compose exec app npx prisma studio

clean:
	docker-compose down -v
	@echo "✅ Containers and volumes removed!"

status:
	docker-compose ps

backup:
	docker-compose exec -T postgres pg_dump -U postgres its_freetown_db > backup.sql
	@echo "✅ Database backed up to backup.sql"

restore:
	docker-compose exec -T postgres psql -U postgres its_freetown_db < backup.sql
	@echo "✅ Database restored from backup.sql"

init: build up migrate
	@echo "✅ Initial setup complete!"
	@echo "   Visit http://localhost:3000 to view the site"

test:
	docker-compose exec app npm run build

install:
	docker-compose exec app npm install

lint:
	docker-compose exec app npm run lint

format:
	docker-compose exec app npm run format

ps:
	@docker-compose ps

stats:
	docker stats --no-stream

prune:
	docker system prune -a
	@echo "✅ Docker system cleaned!"

version:
	@echo "Docker version:"
	@docker --version
	@echo "Docker Compose version:"
	@docker-compose --version
