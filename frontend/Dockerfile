FROM node:23

WORKDIR /app

COPY . .

RUN npm install

RUN chown -R root:0 /app && chmod -R g+rwX /app

EXPOSE 5173

CMD ["npm", "run", "dev"]