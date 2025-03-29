FROM node:16-alpine

WORKDIR /app

# Install basic build tools (similar to what would be on a local dev machine)
RUN apk add --no-cache python3 make g++ gcc

# Copy everything (just like we would clone the repo locally)
COPY . .

# Install dependencies (with legacy peer deps to handle conflicts)
RUN npm install --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "start"] 