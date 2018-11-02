// instance.js
const puppeteer = require('puppeteer');
let instance = null;

module.exports.getBrowserInstance = async () => {
    if (!instance) {
        instance =
            await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox']
            });
    }
    return instance;
}