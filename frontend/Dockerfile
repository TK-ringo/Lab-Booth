# frontend/Dockerfile

# ------------- ビルド環境 -------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ------------- 実行環境 --------------
FROM nginx:stable-alpine

# htpasswd 生成用
RUN apk add --no-cache apache2-utils

# Nginx 設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

# エントリポイント
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 公開ファイル
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
