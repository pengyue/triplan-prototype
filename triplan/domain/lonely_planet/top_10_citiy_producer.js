const puppeteer = require('puppeteer');
const async = require('async');
const attractionExtractor = require('./city_attractions');
const kafkaInitializer = require('../../infrastructure/kafka/initializer');
const kafkaProducer = require('../../infrastructure/kafka/producer');
const browser = require('../../infrastructure/puppeteer/browser');

const CITY_DELAY_TIME_OUT = 2000;
const CITY_TOPIC_NAME =
    process.env.PRODUCER_KAFKA_CITY_TOPIC_NAME
        ? process.env.PRODUCER_KAFKA_CITY_TOPIC_NAME
        : "prototype-top-10-cities";

const CITY_TOPIC_KEY =
    process.env.PRODUCER_KAFKA_CITY_TOPIC_KEY
        ? process.env.PRODUCER_KAFKA_CITY_TOPIC_KEY
        : "lonely-planet-top-10-city-key";

const cityExtractor = module.exports;

cityExtractor.run = async (country) => {

    const browserInstance = await browser.getBrowserInstance();

    const subscriber = async (country) => {

        console.log("Start the city scrapper for country: " + country.name + " (url: " + country.url + ")");

        const page = await browserInstance.newPage();

        await page.setViewport({width: 1920, height: 926});

        try {
            const response = await page.goto(
                country.url,
                {
                    timeout: 3000000
                });

            if (404 == response._status) {
                console.log('Error (404) crawler cities for country (' + country.name + ') ...... ');
                return null;
            } else {

                // click on the button to expand list
                var SELECTOR = "div > button.js-top-places";

                await page.focus(SELECTOR);

                await page.waitFor(1000);

                await page.click(SELECTOR);

                // get city details
                return await page.evaluate(() => {

                    let cities = [];

                    // get the top 10 city elements
                    let top10CitiesElms = document.querySelectorAll('ul.tlist__secondary > li.tlist__secondary-item');
                    top10CitiesElms.forEach((cityElement) => {
                        let city = {};
                        try {
                            city.name = cityElement.querySelector('a').innerText;
                            city.url = cityElement.querySelector('a').href;

                        } catch (exception) {
                            console.log(exception);
                        }

                        cities.push(city);

                    });

                    return cities;

                });

            }

        } catch (err)  {
            console.log('Error loading city page:', err);
            return null;
        }
    }

    subscriber(country)
        .then(async (cities) => {

                if (!cities) {
                    return null;
                }

                const kafkaInitialization = new Promise((resolve, reject) => {
                    try {
                        const kafkaClient = kafkaInitializer.initialize('lonely-planet-city', 1);
                        return resolve(kafkaClient);
                    } catch (err) {
                        return reject(err);
                    }
                });

                const initializer = async() => {
                    const kafkaClient = await kafkaInitialization;
                    return kafkaClient;
                }

                initializer()
                    .then(async (kafkaClient) => {

                        for (const city of cities) {
                            await delayLog(kafkaClient, city);
                        }

                    })
                    .catch(
                        err => console.log(err)
                    );

        })
        .catch(
            error => console.log(error)
        );
};

const delayLog = async (kafkaClient, city) => {
    await delay();
    console.log(city);
    kafkaProducer.produce(kafkaClient, CITY_TOPIC_NAME, CITY_TOPIC_KEY, city);
    await attractionExtractor.run(city);
};

const delay = function() {
    return new Promise(resolve => setTimeout(resolve, CITY_DELAY_TIME_OUT));
}
