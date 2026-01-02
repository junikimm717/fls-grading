FROM node:latest AS builder

WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm install
COPY . /app/
RUN npm run build

ENTRYPOINT ["/app/entrypoint.sh"]

EXPOSE 3000
