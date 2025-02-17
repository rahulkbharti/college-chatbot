FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy all static files
COPY . .

# Replace environment variables at runtime
CMD ["sh", "-c", "envsubst < config.js > /usr/share/nginx/html/config.js && exec nginx -g 'daemon off;'"]
