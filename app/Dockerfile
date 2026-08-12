FROM node:lts AS builder
WORKDIR /app

ARG VITE_IS_DOCKER
ARG VITE_ENV
ARG VITE_SERVER_URL
ENV VITE_IS_DOCKER=${VITE_IS_DOCKER}
ENV VITE_ENV=${VITE_ENV}
ENV VITE_SERVER_URL=${VITE_SERVER_URL}

COPY . .
RUN corepack enable \
  && corepack prepare pnpm@10.9.0 --activate \
  && pnpm install --filter @mlop/app... --frozen-lockfile \
  && pnpm --filter @mlop/app build

FROM nginx:stable-alpine
COPY --from=builder /app/app/dist /usr/share/nginx/html
COPY app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
