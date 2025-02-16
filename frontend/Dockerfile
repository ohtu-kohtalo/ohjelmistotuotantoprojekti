FROM node:23

WORKDIR /app

COPY . .

RUN chmod -R 777 *

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev"]