#!/bin/sh
# frontend/docker-entrypoint.sh

set -e

# 必須変数チェック
if [ -z "${ADMIN_PASSWORD}" ]; then
  echo "ERROR: ADMIN_PASSWORD env var is not set." >&2
  exit 1
fi

# admin ユーザーで .htpasswd を作成（毎回上書き）
htpasswd -bc /etc/nginx/.htpasswd admin "${ADMIN_PASSWORD}"

# Nginx 起動
exec nginx -g "daemon off;"
