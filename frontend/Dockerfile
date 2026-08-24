# syntax=docker/dockerfile:1

FROM node:24.19.0-alpine3.24 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api
ARG VITE_TURNSTILE_SITE_KEY=
ARG VITE_DEBUG_API=false

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_TURNSTILE_SITE_KEY=${VITE_TURNSTILE_SITE_KEY} \
    VITE_DEBUG_API=${VITE_DEBUG_API}

RUN npm run build

FROM nginx:1.28.3-alpine3.23 AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
