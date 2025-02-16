FROM node:23

WORKDIR /app

COPY . .

RUN npm install

RUN chown -R node:node /app

EXPOSE 5173

CMD ["npm", "run", "dev"]