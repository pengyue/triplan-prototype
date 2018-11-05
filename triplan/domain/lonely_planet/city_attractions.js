const async = require('async');
const kafkaInitializer = require('../../infrastructure/kafka/initializer');
const kafkaProducer = require('../../infrastructure/kafka/producer');
const attractionDetailsExtractor = require('./attraction_details');
const browser = require('../../infrastructure/puppeteer/browser');

const ATTRACTION_TOPIC_NAME =
    process.env.PRODUCER_KAFKA_ATTRACTION_TOPIC_NAME
        ? process.env.PRODUCER_KAFKA_ATTRACTION_TOPIC_NAME
        : "prototype-top-attractions";

const ATTRACTION_TOPIC_KEY =
    process.env.PRODUCER_KAFKA_ATTRACTION_TOPIC_KEY
        ? process.env.PRODUCER_KAFKA_ATTRACTION_TOPIC_KEY
        : "lonely-planet-top-attraction-key";

const attractionExtractor = module.exports;

attractionExtractor.run = async (city) => {

    const reader = async (city) => {

        try {
            const cluster = await browser.getBrowserInstance();

            console.log("Start the attractions list scrapper for city: "  + city.name + " ( url: " + city.url + " )");

            const cityProcess = await cluster.task(async ({ page, data: city }) => {

                const response = await page.goto(city.url, { waitUntil: 'domcontentloaded' });

                if (404 == response._status) {
                    console.log('Error (404) crawler attractions for city (' + city.name + ') ...... ');
                    return null;
                } else {

                    (await page.evaluate(() => {
                        let attractions = [];
                        // get the attraction elements
                        let attractionsElms = document.querySelectorAll('div.SightsList-item');
                        // get the attraction data
                        attractionsElms.forEach((attractionElement) => {
                            let attractionJson = {};
                            try {
                                attractionJson.name = attractionElement.querySelector('h5').innerText;
                                attractionJson.url = attractionElement.querySelector('a').href;
                                attractionJson.location = attractionElement.querySelector('p').innerText;
                            }
                            catch (exception){
                                console.log("attraction-parsing: " + exception);
                            }
                            attractions.push(attractionJson);
                        });

                        return attractions;
                    })).forEach((attraction) => {

                        if (!attraction) {
                            return null;
                        }

                        const kafkaInitialization = new Promise((resolve, reject) => {
                            try {
                                const kafkaClient = kafkaInitializer.initialize('lonely-planet-attraction', 1);
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
                                kafkaProducer.produce(kafkaClient, ATTRACTION_TOPIC_NAME, ATTRACTION_TOPIC_KEY, attraction);
                                console.log('Attractions message pushed ...');
                                await attractionDetailsExtractor.run(attraction);
                            })
                            .catch(err => {
                                console.log("attraction-pushing: " + err);
                            });
                    });;

                }

            });

            await cluster.queue(city, cityProcess);

            await cluster.idle();

        } catch (error)  {
            console.log('Error loading attraction list page:', error);
            return null;
        }
    }

    reader(city)
        .then(async () => console.log("attraction-result ..."))
        .catch(error => console.log("attraction-result-error: " + error));
};


