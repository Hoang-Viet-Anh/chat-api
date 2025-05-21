# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json if available
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Step 2: Run the app with a lightweight server
FROM node:20-alpine AS runner

# Configure DNS resolvers
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
    echo "nameserver 1.1.1.1" >> /etc/resolv.conf

# Expose the port your app listens on (change if not 3000)
EXPOSE 3000

# Define default start command
CMD ["node", "app.js"]

