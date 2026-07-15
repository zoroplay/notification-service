#!/bin/sh

# Resolve any failed migrations before deploying
# npx prisma migrate resolve --rolled-back 20240126030431_ 2>/dev/null || true

# Apply Prisma migrations and start the application
# npx prisma migrate deploy
npx prisma generate

# Run database migrations
# npx prisma migrate dev --name init 

# Run the main container command
exec "$@"