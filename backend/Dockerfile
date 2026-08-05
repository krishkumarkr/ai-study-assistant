# Use a lightweight version of Node 20
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies first (for faster caching)
COPY package*.json ./
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Command to run your server
CMD ["node", "server.js"]