FROM node:22.16.0-alpine
WORKDIR /app
COPY ./hoto-backend/ .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
