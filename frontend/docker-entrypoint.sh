#!/bin/sh
# frontend/docker-entrypoint.sh
set -e

# 生成済み htpasswd は不要になったので単に Nginx 起動
exec nginx -g "daemon off;"
