# 1) ベースイメージ

FROM node:22-alpine AS runtime

# 2) 作業ディレクトリ

WORKDIR /app

# 3) 依存インストール

# package.json のみコピーし、npm install を使用して lockfile がなくてもインストール可能に

COPY package*.json ./
RUN npm install --production

# 4) ソースコードをコピー

COPY src/ ./src/
COPY .env ./

# 5) ポート公開 & 起動コマンド

EXPOSE 3001
CMD ["node", "src/index.js"]

