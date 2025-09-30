.PHONY: qs run deps build compose-up compose-down help

BLUE=\033[0;34m
GREEN=\033[0;32m
RED=\033[0;31m
NC=\033[0m

qs: compose-up deps build run

run:
	@echo "$(GREEN)Starting all services...$(NC)"
	npx concurrently \
		--names "FE,BE" \
		--prefix-colors "yellow,cyan" \
		--kill-others \
		--kill-others-on-fail \
		"cd frontend && npm run dev" \
		"cd backend && go run cmd/server/main.go"

deps:
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	cd backend && go mod tidy
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd frontend && npm install

build:
	@echo "$(BLUE)Building backend service...$(NC)"
	cd backend && CGO_ENABLED=0 go build -o build/server cmd/server/main.go
	@echo "$(BLUE)Building frontend service...$(NC)"
	cd frontend && npm run build

compose-up:
	@echo "$(BLUE)Starting all containers...$(NC)"
	cd backend && docker-compose up -d
	@echo "$(BLUE)Waiting for services to be ready...$(NC)"
	@sleep 10

compose-down:
	@echo "$(BLUE)Stopping and removing all containers, volumes, and images...$(NC)"
	cd backend && docker-compose down --volumes --remove-orphans --rmi all
	@echo "$(GREEN)All Docker resources cleaned up$(NC)"

help:
	@echo "$(GREEN)Available commands:$(NC)"
	@echo "  make run    	   - Run project service"
	@echo "  make deps   	   - Install project dependencies"
	@echo "  make build  	   - Build the project for production"
	@echo "  make compose-up   - Start all Docker containers"
	@echo "  make compose-down - Stop and remove all Docker containers, volumes, and images"
	@echo "  make help   	   - Show this help message"
