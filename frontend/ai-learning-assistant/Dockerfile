# Stage 1: Build the React Application
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# This creates your production dist folder
RUN npm run build 

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Copy our custom Nginx routing rules
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built React files from Stage 1 into Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]