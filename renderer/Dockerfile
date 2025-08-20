FROM node:20

WORKDIR /opt/renderer

RUN apt-get update && \
    apt-get install --no-install-recommends -y node-browserify uglifyjs && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 10082

CMD ["npm", "run", "start"]
