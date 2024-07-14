#!/usr/bin/env bash

# Set variables
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="s8-fd-server"

# Ensure Docker Compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "Error: Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Stop and remove existing containers
echo "Stopping and removing existing containers..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME down

# Build and start services
echo "Building and starting services..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME up --build -d

# Display running containers
echo "Running containers:"
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME ps

# Display logs (optional)
echo "To view logs, run: docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f"
