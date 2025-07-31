FROM node:22.16.0-alpine AS build
WORKDIR /app
COPY ./hoto-frontend/ .
RUN npm install
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build /app/dist/* /usr/share/nginx/html
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
