.PHONY: help install dev build test clean docker-build docker-up docker-down docker-logs

# Colors for terminal output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo '$(BLUE)ScholarPass - Available Commands:$(NC)'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo '$(BLUE)Installing dependencies...$(NC)'
	npm install

dev: ## Start development servers
	@echo '$(BLUE)Starting development servers...$(NC)'
	npm run dev

build: ## Build all applications
	@echo '$(BLUE)Building applications...$(NC)'
	npm run build

test: ## Run all tests
	@echo '$(BLUE)Running tests...$(NC)'
	npm run test

test-coverage: ## Run tests with coverage
	@echo '$(BLUE)Running tests with coverage...$(NC)'
	npm run test:coverage

lint: ## Run linters
	@echo '$(BLUE)Running linters...$(NC)'
	npm run lint

lint-fix: ## Fix linting issues
	@echo '$(BLUE)Fixing linting issues...$(NC)'
	npm run lint:fix

format: ## Format code
	@echo '$(BLUE)Formatting code...$(NC)'
	npm run format

format-check: ## Check code formatting
	@echo '$(BLUE)Checking code formatting...$(NC)'
	npm run format:check

type-check: ## Check TypeScript types
	@echo '$(BLUE)Checking TypeScript types...$(NC)'
	npm run type-check

clean: ## Clean build artifacts and dependencies
	@echo '$(YELLOW)Cleaning build artifacts...$(NC)'
	npm run clean
	rm -rf node_modules

# Docker commands
docker-build: ## Build Docker images
	@echo '$(BLUE)Building Docker images...$(NC)'
	docker-compose build

docker-up: ## Start Docker containers
	@echo '$(BLUE)Starting Docker containers...$(NC)'
	docker-compose up -d

docker-up-dev: ## Start Docker development containers
	@echo '$(BLUE)Starting Docker development containers...$(NC)'
	docker-compose -f docker-compose.dev.yml up -d

docker-down: ## Stop Docker containers
	@echo '$(YELLOW)Stopping Docker containers...$(NC)'
	docker-compose down

docker-down-dev: ## Stop Docker development containers
	@echo '$(YELLOW)Stopping Docker development containers...$(NC)'
	docker-compose -f docker-compose.dev.yml down

docker-logs: ## Show Docker logs
	@echo '$(BLUE)Showing Docker logs...$(NC)'
	docker-compose logs -f

docker-restart: ## Restart Docker containers
	@echo '$(YELLOW)Restarting Docker containers...$(NC)'
	docker-compose restart

docker-clean: ## Remove Docker containers and volumes
	@echo '$(YELLOW)Cleaning Docker containers and volumes...$(NC)'
	docker-compose down -v
	docker system prune -f

# Database commands
db-seed: ## Seed database
	@echo '$(BLUE)Seeding database...$(NC)'
	cd apps/api && npm run seed

# CI/CD
ci: lint type-check test ## Run CI checks
	@echo '$(GREEN)✓ All CI checks passed$(NC)'

# Setup
setup: install docker-up-dev ## Initial project setup
	@echo '$(GREEN)✓ Project setup complete$(NC)'
	@echo '$(BLUE)Next steps:$(NC)'
	@echo '  1. Copy .env.example to .env in apps/api and apps/web'
	@echo '  2. Run: make dev'
