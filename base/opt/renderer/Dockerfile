FROM node:22

WORKDIR /opt/renderer

RUN apt-get update && apt-get install --no-install-recommends -y node-browserify uglifyjs && rm -rf /var/lib/apt/lists/*

COPY package.json .

COPY package-lock.json .

RUN npm i

COPY . .

RUN npm run compile

EXPOSE 10082

CMD ["npm", "run", "start"]
