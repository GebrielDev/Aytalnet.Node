FROM node:20-alpine

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies and build tools
RUN npm prune --production
RUN apk del python3 make g++

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
