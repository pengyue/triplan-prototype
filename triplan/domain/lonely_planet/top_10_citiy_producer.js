const async = require('async');
const attractionExtractor = require('./city_attractions');
const kafkaInitializer = require('../../infrastructure/kafka/initializer');
const kafkaProducer = require('../../infrastructure/kafka/producer');
const browser = require('../../infrastructure/puppeteer/browser');

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

    const reader = async (country) => {

        console.log("Start the city scrapper for country: " + country.name + " ( url: " + country.url + " )");

        try {

            const cluster = await browser.getBrowserInstance();

            const countryProcess = await cluster.task(async ({ page, data: country }) => {

                const response = await page.goto(country.url, { waitUntil: 'domcontentloaded' });

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
                    (await page.evaluate(() => {

                        let cities = [];

                        // get the top 10 city elements
                        let top10CitiesElms = document.querySelectorAll('ul.tlist__secondary > li.tlist__secondary-item');
                        top10CitiesElms.forEach((cityElement) => {
                            let city = {};
                            try {
                                city.name = cityElement.querySelector('a').innerText;
                                city.url = cityElement.querySelector('a').href;

                            } catch (exception) {
                                console.log("city-parsing: " + exception);
                            }

                            cities.push(city);

                        });

                        return cities;

                    })).forEach((city) => {

                        if (!city) {
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
                            return await kafkaInitialization;
                        }

                        initializer()
                            .then(async (kafkaClient) => {
                                kafkaProducer.produce(kafkaClient, CITY_TOPIC_NAME, CITY_TOPIC_KEY, city);
                                console.log('City message pushed ...');
                                await attractionExtractor.run(city);
                            })
                            .catch(
                                err => console.log("city-pushing: " + err)
                            );


                    });
                }
            });

            console.log("Queueing country (" + country.name + ") ... ");
            await cluster.queue(country, countryProcess);

            await cluster.idle();

        } catch (err)  {
            console.log('Error loading city page:', err);
            return null;
        }
    }

    reader(country)
        .then(async () => console.log("city-result ..."))
        .catch(error => console.log("city-result-error: " + error));
};

