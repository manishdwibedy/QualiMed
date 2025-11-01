# Build React app
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Final stage: Python with Nginx
FROM python:3.11-alpine

# Install Nginx
RUN apk add --no-cache nginx

# Set working directory
WORKDIR /app

# Copy built React app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Flask app
COPY backend/ ./backend/

# Copy requirements and install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port 8080
EXPOSE 8080

# Start script
CMD ["/app/start.sh"]
