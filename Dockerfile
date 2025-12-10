FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port (will be overridden by environment variable in docker-compose)
EXPOSE 5001

# Start the application
CMD ["npm", "run", "dev"]
