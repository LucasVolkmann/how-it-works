FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --only=production
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/server.bootstrap.js"]
