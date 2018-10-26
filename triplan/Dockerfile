FROM pengyue/puppeteer-chrome-linux:latest

WORKDIR /home/pptruser/app

USER root

RUN chown -R pptruser:pptruser /home/pptruser

USER pptruser

COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 80
CMD [ "npm", "start" ]