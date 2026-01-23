# Canteen Microservices

Canteen management system based on microservices architecture.

## Description

Distributed system composed of 4 microservices:

- **Users Service**: User management and authentication
- **Menu Service**: Menu and dish management (GraphQL)
- **Orders Service**: Order management
- **Recommendations Service**: Recommendation system

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Available ports: 80 and 5433

## Getting Started

```bash
docker compose build

docker tag canteen-microservices-users-service:latest canteen-users-service:latest
docker tag canteen-microservices-menu-service:latest canteen-menu-service:latest
docker tag canteen-microservices-orders-service:latest canteen-orders-service:latest
docker tag canteen-microservices-recommendations-service:latest canteen-recommendations-service:latest
docker tag canteen-microservices-api-gateway:latest canteen-api-gateway:latest

docker config create init_db_sql ./init-db/init-db.sql

docker stack deploy -c docker-stack.yml canteen
```

## Access

- **API Gateway**: http://localhost
- **PostgreSQL**: localhost:5433


## 💾 Database

### Accessing PostgreSQL

```bash
# Via Docker Compose
docker compose exec postgres psql -U user_db_owner

# Via Docker Swarm
docker exec -it <CONTAINER_ID> psql -U user_db_owner

# From host machine
psql -h localhost -p 5433 -U user_db_owner
```

### Useful PostgreSQL Commands

```sql
-- List databases
\l

-- Connect to a database
\c users_canteen

-- List tables
\dt

-- View table structure
\d users

-- Query data
SELECT * FROM users;
SELECT * FROM dishes;
SELECT * FROM bookings;
```

### Database Structure

#### users_canteen
- `users`: System users
- `user_liked_dishes`: User favorite dishes

#### menu_db
- `dishes`: Dish catalog
- `period_time`: Service periods (lunch/dinner)
- `menus`: Daily menus associated with dishes and periods

#### bookingdb
- `bookings`: User orders/bookings

#### recommendations_canteen
- `recommendations`: Recommendation history

### Database Reset

```bash
# Docker Compose
docker compose down -v
docker compose up -d

# Docker Swarm
docker service rm canteen_postgres
docker volume rm canteen_postgres_data
docker stack deploy -c docker-stack.yml canteen
```

## 🔐 Environment Variables

### Critical Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `JWT_SECRET` | Secret key for JWT | `your-secret-key-change-in-production` |
| `DB_PASSWORD` | Database password | `vanveen321` |
| `DB_USER` | Database user | `user_db_owner` |

### Variables per Service

Each service has specific variables in their `.env.docker` files:
- `PORT`: Service port
- `DB_HOST`: Database host
- `DB_NAME`: Specific database name
- URLs of other services for inter-service communication

## 🔧 Swarm Management

### View State

```bash
# Cluster nodes
docker node ls

# Deployed stacks
docker stack ls

# Services in a stack
docker stack services canteen

# Tasks of a service
docker service ps canteen_users-service

# Detailed inspection
docker service inspect canteen_users-service
```

### Networking

```bash
# List networks
docker network ls

# Inspect swarm network
docker network inspect canteen_canteen-network
```

### Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect canteen_postgres_data

# Remove unused volumes
docker volume prune
```

### Configs and Secrets

```bash
# List configs
docker config ls

# View config content
docker config inspect canteen_init_db_sql
```

### Monitoring

```bash
# Real-time stats
docker stats

# Swarm events
docker events

# Aggregated service logs
docker service logs canteen_users-service -f --tail 100
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port 80 already in use
```bash
# Windows - check process on port 80
netstat -ano | findstr :80

# Stop the process or change the port in docker-compose.yml/docker-stack.yml
ports:
    - "8080:80"
```

#### 2. Services not starting in Swarm
```bash
# Check logs
docker service logs canteen_users-service

# Check events
docker service ps canteen_users-service --no-trunc

# Check if image exists
docker images | grep canteen
```

#### 3. Database not initializing
```bash
# Check postgres logs
docker service logs canteen_postgres -f

# Check if init-db.sql was loaded
docker config ls
docker config inspect canteen_init_db_sql
```

#### 4. "network not found" error in Swarm
```bash
# Check networks
docker network ls

# Recreate the stack
docker stack rm canteen
docker stack deploy -c docker-stack.yml canteen
```

#### 5. Services not communicating with each other
```bash
# Check connectivity within the network
docker exec <container-id> ping menu-service
docker exec <container-id> curl http://menu-service:5002/health

# Check if they are on the same network
docker network inspect canteen_canteen-network
```

#### 6. Rebuild after code changes
```bash
# Docker Compose
docker compose down
docker compose build --no-cache
docker compose up -d

# Docker Swarm
docker build -t canteen-users-service:latest ./services/users --no-cache
docker service update --image canteen-users-service:latest canteen_users-service
```

### Useful Debug Commands

```bash
# Enter a container
docker exec -it <container-id> /bin/sh

# View environment variables
docker exec <container-id> env

# Test connectivity
docker exec <container-id> ping postgres
docker exec <container-id> nc -zv postgres 5432

# Clean everything (CAUTION!)
docker system prune -a --volumes
```

### Check Health Checks

```bash
# Container health status (Compose)
docker compose ps

# Health status in Swarm
docker service ps canteen_postgres
```

## 📚 Additional Resources

### Official Documentation
- [Docker Compose](https://docs.docker.com/compose/)
- [Docker Swarm](https://docs.docker.com/engine/swarm/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Node.js](https://nodejs.org/docs/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [GraphQL](https://graphql.org/learn/)

### Microservices Architecture
- [Microservices Patterns](https://microservices.io/)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)

## 👥 Contributors

This project was developed by:

### Development Team

- **José Guedes** - Full-Stack Developer [40230110@esmad.ipp.pt]
- **Eduardo Sousa** - Full-Stack Developer [40230115@esmad.ipp.pt]
- **Xavier Kooijman** - Full-Stack Developer [40220456@esmad.ipp.pt]  

## 📄 License

This project is for educational purposes.



