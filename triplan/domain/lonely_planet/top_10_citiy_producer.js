const puppeteer = require('puppeteer');
var async = require('async');
var attractionExtractor = require('./city_attractions');
var kafkaInitializer = require('../../infrastructure/kafka/initializer');
var kafkaProducer = require('../../infrastructure/kafka/producer');

const CITY_TOPIC_NAME =
    process.env.PRODUCER_KAFKA_CITY_TOPIC_NAME
        ? process.env.PRODUCER_KAFKA_CITY_TOPIC_NAME
        : "prototype-top-10-cities";

const CITY_TOPIC_KEY =
    process.env.PRODUCER_KAFKA_CITY_TOPIC_KEY
        ? process.env.PRODUCER_KAFKA_CITY_TOPIC_KEY
        : "lonelyplanet-top-10-city-key";

var cityExtractor = module.exports;

cityExtractor.run = function (country) {

    const subscriber = async (country) => {

        console.log("Start the city scrapper for country: " + country.name + " (url: " + country.url + ")");

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();

        await page.setViewport({width: 1920, height: 926});

        try {
            const response = await page.goto(country.url);

            if (404 == response._status) {
                console.log('Error loading city page (404) ...');
                await browser.close();
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
                    // get the city data
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
            await browser.close();
        }
    }

    subscriber(country)
        .then( cities => {

            console.log(" ");

            kafkaInitializer = new Promise((resolve, reject) => {
                try {
                    const kafka = kafkaInitializer.initialize('lonelyplanet-city', 1);
                    return resolve(kafka);
                } catch (err) {
                    return reject(err);
                }
            });

            const initializer = async() => {
                const kafka = await kafkaInitializer;
                return kafka;
            }

            initializer()
                .then(client => {
                    cities.forEach((city) => {
                        kafkaProducer.produce(client, CITY_TOPIC_NAME, CITY_TOPIC_KEY, city);
                        attractionExtractor.run(city);
                    });
                })
                .catch(err => {
                    console.error(err);
                });

        })
        .catch(
            err => console.log(err)
        );
}



