# Makefile for RSS Kindle Reader Docker operations

.PHONY: help build run up down dev prod clean logs

# Default target
help:
	@echo "RSS Kindle Reader Docker Commands:"
	@echo "  build    - Build the Docker image"
	@echo "  run      - Run the container directly"
	@echo "  up       - Start services with docker-compose"
	@echo "  down     - Stop services"
	@echo "  dev      - Start development environment"
	@echo "  prod     - Start production environment"
	@echo "  logs     - Show container logs"
	@echo "  clean    - Clean up containers and images"

# Build Docker image
build:
	docker build -t rss-kindle-reader .

# Run container directly
run:
	docker run -p 3000:3000 --name rss-kindle-reader rss-kindle-reader

# Start with docker-compose
up:
	docker-compose up -d

# Stop services
down:
	docker-compose down

# Development environment
dev:
	docker-compose -f docker-compose.dev.yml up

# Production environment
prod:
	docker-compose -f docker-compose.prod.yml up -d

# Show logs
logs:
	docker-compose logs -f

# Clean up
clean:
	docker-compose down --rmi all --volumes --remove-orphans
	docker system prune -f
