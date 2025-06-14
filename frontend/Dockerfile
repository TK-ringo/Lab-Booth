# ----------- 1st stage : ビルド -----------------
FROM node:22-alpine AS builder
WORKDIR /app

# 依存インストールをキャッシュするため package.* だけ先にコピー
COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm  \
    npm ci

# 残りのフロントエンドソースをコピーしてビルド
COPY frontend/ .
RUN npm run build            # → dist/ が生成されます

# ----------- 2nd stage : 配信 -------------------
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
