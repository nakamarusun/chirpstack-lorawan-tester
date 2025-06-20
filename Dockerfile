FROM node:lts-alpine3.20 AS builder

WORKDIR /app

# Copy root package files for workspaces
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY backend/package.json backend/
COPY frontend/package.json frontend/

# Install all dependencies for all workspaces
RUN npm ci

# Copy the rest of the source code
COPY backend ./backend
COPY frontend ./frontend

# Build backend
WORKDIR /app/backend
RUN npm run build

# Build frontend
# Base url based on build args
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

WORKDIR /app/frontend
RUN npm run build

FROM node:lts-alpine3.20 AS runner

WORKDIR /app

# Copy root package files and install only production deps
COPY package.json package-lock.json ./
COPY ./backend/package.json ./backend/
RUN npm ci --omit=dev --workspace=backend

# Copy backend build output
COPY --from=builder /app/backend/dist /app/dist

# Copy frontend build output
COPY --from=builder /app/frontend/dist /app/public

ENTRYPOINT [ "node", "dist/main" ]