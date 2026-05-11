FROM node:20
RUN mkdir -p /app
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY . .

RUN npm install

RUN npm run proto:install

RUN npm run build

# Generate Prisma client
RUN npx prisma generate

#grpc port
EXPOSE 5000

#http port
EXPOSE 3020
CMD ["npm", "run", "start:prod"]