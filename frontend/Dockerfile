# 1: Production build
FROM node:23 AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

RUN chown -R root:0 /app/dist && chmod -R g+rwX /app/dist

# 2: Deployment
FROM nginx:alpine-slim

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Create the client_temp directory
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    chown -R nginx:nginx /var/cache/nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
