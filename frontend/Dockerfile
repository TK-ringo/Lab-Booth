# frontend/Dockerfile

# 1) Build stage

FROM node:22-alpine AS builder

WORKDIR /app

# 依存インストール

COPY frontend/package*.json ./
RUN npm ci

# ソース全体をコピーしてビルド

COPY frontend/ ./
RUN npm run build

# 2) Production stage

FROM nginx:stable-alpine

# カスタム nginx 設定をコピー

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# ビルド成果物を配置

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]