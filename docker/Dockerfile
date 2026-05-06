# ─────────────────────────────────────────────
# Stage 1: Composer – install PHP dependencies
# ─────────────────────────────────────────────
FROM composer:2.8 AS composer-builder

WORKDIR /app

# Salin semua file yang dibutuhkan artisan saat post-autoload-dump
COPY .env.docker .env
COPY composer.json composer.lock artisan ./
COPY app/ app/
COPY bootstrap/ bootstrap/
COPY config/ config/
COPY database/ database/
COPY resources/ resources/
COPY routes/ routes/
COPY storage/ storage/

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader

# ─────────────────────────────────────────────
FROM node:20-alpine AS node-builder

# Install PHP CLI agar artisan bisa berjalan
RUN apk add --no-cache \
    php84 \
    php84-phar \
    php84-mbstring \
    php84-openssl \
    php84-tokenizer \
    php84-xml \
    php84-xmlwriter \
    php84-dom \
    php84-session \
    php84-fileinfo \
    php84-ctype \
    php84-pdo \
    php84-json \
    php84-curl \
    && ln -sf /usr/bin/php84 /usr/local/bin/php

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Salin vendor dari stage sebelumnya agar artisan bisa bootstrap
COPY --from=composer-builder /app/vendor ./vendor

COPY . .
COPY .env.docker .env

RUN npm run build

# ─────────────────────────────────────────────
# Stage 3: Production image (PHP-FPM only)
# ─────────────────────────────────────────────
FROM php:8.4-fpm-alpine

# ── System dependencies ──────────────────────
RUN apk add --no-cache \
    supervisor \
    curl \
    bash \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    icu-dev \
    linux-headers \
    zip \
    unzip \
    git \
    mysql-client

# ── PHP extensions ───────────────────────────
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        intl \
        xml \
        opcache \
        sockets

# ── Redis extension ──────────────────────────
RUN apk add --no-cache $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS

# ── PHP config ───────────────────────────────
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

COPY --from=composer-builder /app/vendor ./vendor
COPY --from=node-builder /app/public/build ./public/build
COPY . .
COPY .env.docker .env

RUN mkdir -p storage/framework/{sessions,views,cache} \
            /var/log/supervisor \
            storage/logs \
            bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 9000 8081

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]