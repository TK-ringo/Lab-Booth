# frontend/Dockerfile

# 1) ビルド環境
FROM node:22-alpine AS builder
WORKDIR /app

# パッケージ定義だけ先にコピーして依存インストール
COPY package*.json ./
RUN npm ci

# 残りソースをコピーしてビルド
COPY . .
RUN npm run build

# 2) 実行環境
FROM nginx:stable-alpine
# カスタム nginx 設定を上書き
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルド成果物を公開ディレクトリに配置
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
