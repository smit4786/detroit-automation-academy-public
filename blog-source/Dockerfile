# --- Stage 1: Build Hugo Site ---
FROM klakegg/hugo:ext-alpine AS build
WORKDIR /src
COPY . .
RUN hugo --minify

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine
COPY --from=build /src/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
