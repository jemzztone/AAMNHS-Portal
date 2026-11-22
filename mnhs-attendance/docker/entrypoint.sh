#!/bin/sh
set -e

cd /var/www/html

# The container filesystem is recreated on every deploy, so make sure the
# writable paths exist and are owned by php-fpm before Laravel boots.
mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

# Render Postgres can take a few seconds to accept connections after a
# restart; retry instead of failing the deploy on the first attempt.
attempt=1
until php artisan migrate --force; do
    if [ "$attempt" -ge 12 ]; then
        echo "Database migration failed after $attempt attempts." >&2
        exit 1
    fi
    attempt=$((attempt + 1))
    echo "Database not ready (attempt $((attempt - 1))); retrying in 5s..." >&2
    sleep 5
done

php artisan storage:link || true

# Build caches now: at image build time no runtime env vars (DB, APP_KEY,
# REDIS_*) exist, so caching there would freeze empty values into the app.
php artisan config:cache
php artisan view:cache

exec "$@"
