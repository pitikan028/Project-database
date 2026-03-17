# BATON MOTOR E-Commerce Project Setup

This is a NestJS e-commerce application with Docker and PostgreSQL database support.

## Project Overview
- **Framework**: NestJS
- **Database**: MySQL 8.0
- **Container**: Docker & Docker Compose
- **Tools**: DBeaver for database management
- **Project**: BATON MOTOR E-Commerce Platform

## Setup Progress

- [x] Create NestJS project structure
- [x] Set up Docker and docker-compose configuration
- [x] Create database schema and migrations
- [x] Install dependencies
- [x] Configure environment variables
- [x] Set up Docker containers
- [ ] Validate database connection
- [ ] Launch the application

## Completed Tasks

### Phase 1: Project Scaffolding ✓
- Created NestJS application with TypeScript configuration
- Set up 11 TypeORM entities for database tables
- Configured Docker and Docker Compose for PostgreSQL + Node.js
- Created comprehensive database initialization script (init.sql)
- Set up all required configuration files (.env, .prettierrc, .eslintrc)

### Database Tables Created ✓
- users
- categories
- products
- product_images
- shopping_carts
- cart_items
- orders
- order_items
- reviews
- wishlists
- wishlist_items

### Files Created
- src/main.ts - Application entry point
- src/app.module.ts - Root NestJS module
- src/database/entities/ - 11 TypeORM entities
- database/init.sql - SQL schema initialization
- docker-compose.yml - Multi-container setup
- Dockerfile - Node.js application image
- .env & .env.example - Environment configuration

## Getting Started

### Prerequisites
- Docker Desktop installed
- Node.js (optional, for local development)
- DBeaver installed
- NestJS CLI: `npm install -g @nestjs/cli`

### Quick Start
1. Clone and navigate to project
2. Setup `.env` file
3. Run `docker-compose up`
4. Database will be available at `localhost:5432`
5. Application will run at `localhost:3000`

## File Structure
```
project-root/
├── src/
│   ├── modules/
│   ├── common/
│   ├── database/
│   └── main.ts
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```
