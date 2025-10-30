.PHONY: qs run deps build fmt help

BLUE=\033[0;34m
GREEN=\033[0;32m
RED=\033[0;31m
NC=\033[0m

qs: deps build run

run:
	@echo "$(GREEN)Starting all services...$(NC)"
	npx concurrently \
		--names "FE,BE" \
		--prefix-colors "yellow,cyan" \
		--kill-others \
		--kill-others-on-fail \
		"cd frontend && npm start" \
		"cd backend && go run cmd/main.go"

deps:
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	cd backend && go mod tidy
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd frontend && npm install

build:
	@echo "$(BLUE)Building backend service...$(NC)"
	cd backend && CGO_ENABLED=0 go build -o build/server cmd/main.go
	@echo "$(BLUE)Building frontend service...$(NC)"
	cd frontend && npm run build

fmt:
	@echo "$(BLUE)Formatting backend code...$(NC)"
	cd backend && go fmt ./...
	@echo "$(BLUE)Formatting frontend code...$(NC)"
	cd frontend && npm run format

compose-build:
	@echo "$(GREEN)Building all services using Docker Compose...$(NC)"
	docker-compose build

compose-up:
	@echo "$(GREEN)Starting all services using Docker Compose...$(NC)"
	docker-compose up -d

compose-down:
	@echo "$(RED)Stopping all services using Docker Compose...$(NC)"
	docker-compose down

compose-stop:
	@echo "$(RED)Stopping all services using Docker Compose...$(NC)"
	docker-compose stop

help:
	@echo "\n$(GREEN)Available commands:$(NC)"
	@printf "  %-18s - %s\n" "make run" "Run project service"
	@printf "  %-18s - %s\n" "make deps" "Install project dependencies"
	@printf "  %-18s - %s\n" "make build" "Build the project for production"
	@printf "  %-18s - %s\n" "make fmt" "Format the project code"
	@printf "  %-18s - %s\n" "make help" "Show this help message"
