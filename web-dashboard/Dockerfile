FROM node:20-alpine AS builder

WORKDIR /app

# Build argument for API URL (set in Railway or pass with --build-arg)
ARG VITE_API_URL=https://aytalnet-production.up.railway.app/api
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application with embedded API URL
RUN echo "Building with VITE_API_URL=$VITE_API_URL" && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start serve with PORT environment variable
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
