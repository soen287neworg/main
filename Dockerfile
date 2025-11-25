# Build stage
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./
COPY prisma ./prisma/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:24-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.output ./.output/

# Set user
USER nextjs

# Expose port (adjust if your app uses a different port)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", ".output/server/index.mjs"]