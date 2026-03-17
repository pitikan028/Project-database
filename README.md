# BATON MOTOR E-Commerce Platform

A modern e-commerce platform built with NestJS, MySQL 8.0, and Docker.

## Prerequisites

- Docker Desktop
- Node.js 18+ (optional, for local development)
- DBeaver (for database management)

## Project Structure

```
├── src/
│   ├── modules/           # Feature modules
│   ├── database/          # Database entities and migrations
│   ├── common/            # Common utilities and decorators
│   ├── app.module.ts      # Root module
│   ├── app.controller.ts  # Root controller
│   ├── app.service.ts     # Root service
│   └── main.ts            # Application entry point
├── database/
│   └── init.sql           # Database initialization script
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker build configuration
├── .env.example           # Environment variables template
└── package.json           # Project dependencies
```

## Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd baton-motor-api
```

### 2. Copy environment file
```bash
cp .env.example .env
```

### 3. Start Docker containers
```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`

### 4. Verify API health
```bash
curl http://localhost:3000/api/health
```

## Database Connection with DBeaver

1. Open DBeaver
2. Click "New Database Connection"
3. Select MySQL and click "Next"
4. Configure:
   - **Server Host**: localhost
   - **Port**: 3306
   - **Database**: baton_motor
   - **Username**: baton_user
   - **Password**: baton_pass
5. Click "Test Connection" and then "Finish"

## Database Schema

The system includes the following tables:
- `users` - User accounts and profiles
- `categories` - Product categories
- `products` - Product catalog
- `product_images` - Product images
- `shopping_carts` - Shopping cart management
- `cart_items` - Items in shopping carts
- `orders` - Customer orders
- `order_items` - Items in orders
- `reviews` - Product reviews
- `wishlists` - User wishlists
- `wishlist_items` - Items in wishlists

## API Endpoints

### Health Check
- `GET /api/health` - Check API health status

More endpoints will be added as features are developed.

## Development

### Install dependencies
```bash
docker-compose exec app npm install
```

### Run migrations
```bash
docker-compose exec app npm run migration:run
```

### View logs
```bash
docker-compose logs -f app
```

### Stop containers
```bash
docker-compose down
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | Application environment |
| DB_HOST | mysql | Database host |
| DB_PORT | 3306 | Database port |
| DB_USERNAME | baton_user | Database user |
| DB_PASSWORD | baton_pass | Database password |
| DB_NAME | baton_motor | Database name |
| DB_ROOT_PASSWORD | root | MySQL root password |
| JWT_SECRET | your-secret-key | JWT secret key |
| API_PORT | 3000 | API server port |

## Features

- User authentication and authorization
- Product catalog management
- Shopping cart system
- Order management
- Product reviews and ratings
- Wishlist functionality
- Inventory management

## License

MIT
