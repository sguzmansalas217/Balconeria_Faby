FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_OPTIONS="--max-old-space-size=1024"

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN node node_modules/vite/bin/vite.js build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
