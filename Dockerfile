# -------------------------------------------------------------------
# Dockerfile for Starlight™ Hyperlift (Spaceship)
# Guide: https://www.spaceship.com/knowledgebase/hyperlift-deploy-app-github-dockerfile/
#
# Key Hyperlift Notes:
# - Do NOT use EXPOSE: Hyperlift manages network ports via environment variables.
# - Default Hyperlift application port is 8080 (configurable in Hyperlift Manager).
# - Automatic builds trigger when pushing to the connected GitHub branch.
# -------------------------------------------------------------------

# Stage 1: Build application assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install all dependencies (including devDependencies needed for build)
COPY package*.json ./
RUN npm ci

# Copy full source and build production bundle
COPY . .
RUN npm run build

# Stage 2: Production runtime image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Default port for Hyperlift is 8080 (override via PORT env variable in Hyperlift settings)
ENV PORT=8080

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy built server bundle and static files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/public/static ./static

# Use standard non-root node user for security
USER node

# Start production server
CMD ["node", "dist/index.js"]
