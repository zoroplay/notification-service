FROM node:18-alpine
RUN mkdir -p /app
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY entrypoint.sh /app/entrypoint.sh
COPY . .

RUN npm i -g @nestjs/cli
RUN npm install

RUN chmod +x /app/entrypoint.sh

RUN npm run build
EXPOSE 80
EXPOSE 5000
ENTRYPOINT [ "/app/entrypoint.sh" ]
CMD ["npm", "start"]