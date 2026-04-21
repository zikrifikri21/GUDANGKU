# Warehouse Management System

A modern warehouse management application built with Laravel 13 and React (Inertia.js).

## Features

- **Product Management** - Manage products with SKU, pricing, stock levels, and images
- **Category Management** - Organize products into categories
- **Supplier Management** - Track supplier information and contact details
- **Stock Transactions** - Record in/out stock movements with transaction history
- **Low Stock Alerts** - Automatic detection of products below minimum stock level
- **Authentication** - Secure user authentication with Laravel Fortify

## Realtime Features

- **Live Stock Updates** - Real-time stock transaction notifications across all connected clients
- **Low Stock Alerts** - Instant browser notifications when product stock falls below minimum
- **Product Sync** - Live updates when products are created, updated, or deleted
- **Connection Status** - Visual indicator showing realtime connection state

## Tech Stack

- **Backend**: Laravel 13 (PHP 8.3+)
- **Frontend**: React + Inertia.js
- **Authentication**: Laravel Fortify
- **Realtime**: Laravel Reverb (WebSocket)
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

### Start Reverb Server (Required for Realtime)
```bash
php artisan reverb:start
```

### Production Mode
```bash
php artisan serve
npm run build
php artisan reverb:start
```

## Environment Variables

Make sure these are configured in `.env`:

```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

## Browser Notifications

The app requests browser notification permission on first load. Users can:
- Allow notifications to receive real-time alerts
- Block notifications to disable browser alerts
- Still see in-app toast notifications regardless of browser permission

## Available Commands

| Command | Description |
|---------|-------------|
| `composer run setup` | Full setup (install, env, migrate, build) |
| `npm run dev` | Start development servers |
| `php artisan reverb:start` | Start Reverb WebSocket server |
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