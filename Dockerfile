# Step 1: Build the React Vite app
FROM node:18 AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --force

RUN npm install --save-dev @types/react @types/node

# Copy the source code
COPY . ./

# Use build argument to determine the environment-specific variables
ARG VITE_BACKEND_BASE_URL
ARG VITE_APPLICATION_ADMIN
ARG VITE_APPLICATION_SUPER_ADMIN
ARG VITE_APPLICATION_CARE_GIVER
ARG VITE_FILE_DOWNLOAD_PATH

# Create the .env file dynamically based on build arguments
RUN echo "VITE_BACKEND_BASE_URL=$VITE_BACKEND_BASE_URL" >> .env && \
    echo "VITE_APPLICATION_ADMIN=$VITE_APPLICATION_ADMIN" >> .env && \
    echo "VITE_APPLICATION_SUPER_ADMIN=$VITE_APPLICATION_SUPER_ADMIN" >> .env && \
    echo "VITE_APPLICATION_CARE_GIVER=$VITE_APPLICATION_CARE_GIVER" >> .env && \
    echo "VITE_FILE_DOWNLOAD_PATH=$VITE_FILE_DOWNLOAD_PATH" >> .env

# Run TypeScript checks
RUN npx tsc --noEmit



# Build the React Vite app
RUN npm run build

# Step 2: Setup Nginx to serve the app
FROM nginx:alpine

# Copy the custom nginx config file from the frontend directory
# COPY ./nginx.conf /etc/nginx/nginx.conf

# Copy the built Vite app from the previous build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
