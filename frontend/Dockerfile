# ─────────────────────────────────────────────────────────────
# Stage 1: Build του Vite bundle
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# 1. Αντιγραφή μόνο των manifests → επιτρέπει στο Docker να cache-άρει
#    το βήμα npm install όσο τα packages μένουν ίδια
COPY package*.json ./
RUN npm ci --no-update-notifier

# 2. Αντιγραφή του υπόλοιπου κώδικα και build
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2: Σερβίρισμα μέσω Nginx (+ reverse proxy για /api)
# ─────────────────────────────────────────────────────────────
FROM nginx:alpine

# Nginx config:
#   - SPA routing: try_files fallback στο index.html (για React Router)
#   - Reverse proxy: /api/* → backend container στη θύρα 8080
#     (το όνομα "backend" προϋποθέτει docker network — αν τρέχεις
#      μεμονωμένα τον container, άλλαξέ το σε host ή προσθετό docker-compose)
RUN printf '%s\n' \
    'server {' \
    '    listen 80;' \
    '    root /usr/share/nginx/html;' \
    '    index index.html;' \
    '' \
    '    location /api/ {' \
    '        proxy_pass http://backend:8080;' \
    '        proxy_set_header Host $host;' \
    '        proxy_set_header X-Real-IP $remote_addr;' \
    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
    '        proxy_set_header X-Forwarded-Proto $scheme;' \
    '        proxy_set_header Cookie $http_cookie;' \
    '        proxy_pass_header Set-Cookie;' \
    '        proxy_read_timeout 30s;' \
    '    }' \
    '' \
    '    location / {' \
    '        try_files $uri $uri/ /index.html;' \
    '    }' \
    '}' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
