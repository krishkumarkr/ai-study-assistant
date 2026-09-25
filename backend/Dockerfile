# Use a lightweight version of Node 20
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies first (for faster caching)
COPY package*.json ./
RUN npm install

# Copy ONLY the download script and pre-cache the model (cached until script changes)
COPY scripts/downloadModel.js scripts/
RUN node scripts/downloadModel.js

#Copy the rest of backend code
COPY . .

# Expose the port where app runs on
EXPOSE 8000

# Command to run the server
CMD ["node", "server.js"]
