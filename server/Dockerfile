# Backend: Express + Prisma (PostgreSQL)
FROM node:22-slim

WORKDIR /app

# Prisma heeft openssl nodig
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Dependencies (eerst alleen package.json voor caching)
COPY package.json ./
RUN npm install

# Broncode + Prisma-schema
COPY . ./
RUN npx prisma generate

EXPOSE 4000

RUN chmod +x docker-entrypoint.sh
CMD ["./docker-entrypoint.sh"]
