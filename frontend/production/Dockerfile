# 1: Production build
FROM node:23 AS builder

WORKDIR /app

COPY ../package*.json ./

RUN npm ci

COPY ../ ./

RUN npm run build

RUN chown -R root:0 /app/dist && chmod -R g+rwX /app/dist

# 2: Deployment
FROM nginxinc/nginx-unprivileged:alpine-slim

# Copy custom config
COPY production/default.conf /etc/nginx/conf.d/default.conf

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Set permissions for /var/cache/nginx
RUN mkdir -p /var/cache/nginx && \
    chmod -R 777 /var/cache/nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
