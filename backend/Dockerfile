# backend/Dockerfile
# 1) 実行環境イメージ
FROM node:22-alpine AS runtime

# 2) 作業ディレクトリ
WORKDIR /app

# 3) 依存インストール
COPY package*.json ./
RUN npm install --omit=dev

# 4) アプリ本体コピー
COPY src/ ./src/
COPY .env ./

# 5) ポート公開 & 起動
EXPOSE 3001
CMD ["node", "src/index.js"]
