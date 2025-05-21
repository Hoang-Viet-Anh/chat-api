# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set DNS environment variable for Node.js
ENV NODE_OPTIONS="--dns-server=8.8.8.8 --dns-server=1.1.1.1"

# Copy package.json and package-lock.json if available
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Define default start command
CMD ["node", "app.js"]