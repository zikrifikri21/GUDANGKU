# Warehouse Management System

A modern warehouse management application built with Laravel 13 and React (Inertia.js).

## Features

- **Product Management** - Manage products with SKU, pricing, stock levels, and images
- **Category Management** - Organize products into categories
- **Supplier Management** - Track supplier information and contact details
- **Stock Transactions** - Record in/out stock movements with transaction history
- **Low Stock Alerts** - Automatic detection of products below minimum stock level
- **Authentication** - Secure user authentication with Laravel Fortify

## Tech Stack

- **Backend**: Laravel 13 (PHP 8.3+)
- **Frontend**: React + Inertia.js
- **Authentication**: Laravel Fortify
- **Styling**: Tailwind CSS
- **Testing**: Pest PHP
- **Code Quality**: Pint (PHP formatter), ESLint, Prettier

## Prerequisites

- PHP 8.3+
- Composer
- Node.js 18+
- Database (MySQL/PostgreSQL/SQLite)

## Installation

```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Install Node.js dependencies
npm install

# Build assets
npm run build
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Runs PHP server, queue worker, and Vite dev server concurrently.

### Production Mode
```bash
php artisan serve
npm run build
```

## Available Commands

| Command | Description |
|---------|-------------|
| `composer run setup` | Full setup (install, env, migrate, build) |
| `npm run dev` | Start development servers |
| `npm run test` | Run tests with linting |
| `npm run lint` | Fix PHP code style |
| `npm run lint:check` | Check PHP code style |
| `npm run ci:check` | Run full CI checks |

## Database Schema

- **products** - id, category_id, supplier_id, sku, name, description, stock, unit, min_stock, price, image, timestamps
- **categories** - id, name, description, timestamps
- **suppliers** - id, name, contact, address, timestamps
- **stock_transactions** - id, product_id, user_id, type, quantity, note, timestamps
- **users** - Laravel default (managed by Fortify)

## License

MIT