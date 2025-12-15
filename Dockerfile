# Dockerfile for ff-tournois
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production || true
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","server.js"]
