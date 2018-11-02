const puppeteer = require('puppeteer');
const async = require('async');
// const kafkaInitializer = require('../../infrastructure/kafka/initializer');
const kafkaProducer = require('../../infrastructure/kafka/producer');
const attractionDetailsExtractor = require('./attraction_details');
const browser = require('../../infrastructure/puppeteer/browser');

const ATTRACTION_DELAY_TIME_OUT = 5000;
const ATTRACTION_TOPIC_NAME =
    process.env.PRODUCER_KAFKA_ATTRACTION_TOPIC_NAME
        ? process.env.PRODUCER_KAFKA_ATTRACTION_TOPIC_NAME
        : "prototype-top-attractions";

const ATTRACTION_TOPIC_KEY =
    process.env.PRODUCER_KAFKA_ATTRACTION_TOPIC_KEY
        ? process.env.PRODUCER_KAFKA_ATTRACTION_TOPIC_KEY
        : "lonely-planet-top-attraction-key";

var attractionExtractor = module.exports;

attractionExtractor.run = async (city) => {

    const reader = async (city) => {

        const browserInstance = await browser.getBrowserInstance();

        const page = await browserInstance.newPage();
        await page.setViewport({ width: 1920, height: 926 });

        try {
            console.log("Start the attractions list scrapper for city: "  + city.name + " (url: " + city.url + ")");

            const response = await page.goto(
                    city.url,
                    {
                        timeout: 3000000
                    }
                );

            if (404 == response._status) {
                console.log('Error loading attraction list page (404) ...');
                await browserInstance.close();
            } else {

                return await page.evaluate(() => {
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
                            console.log(exception);
                        }
                        attractions.push(attractionJson);
                    });
                    return attractions;
                });

                await browserInstance.close();
                console.log('Close the browser puppeteer connection (attraction).');

            }
        } catch (err)  {
            console.log('Error loading attraction list page:', err);
            await browserInstance.close();
        }
    }

    reader(city)
        .then(async (attractions) => {

                // const kafkaInitialization = new Promise((resolve, reject) => {
                //     try {
                //         const kafkaClient = kafkaInitializer.initialize('lonely-planet-attraction', 1);
                //         return resolve(kafkaClient);
                //     } catch (err) {
                //         return reject(err);
                //     }
                // });
                //
                const initializer = async() => {
                //     const kafkaClient = await kafkaInitialization;
                //     return kafkaClient;
                    return null;
                }

                initializer()
                    .then(async (kafkaClient) => {

                        for (const attraction of attractions) {
                            // kafkaProducer.produce(kafkaClient, ATTRACTION_TOPIC_NAME, ATTRACTION_TOPIC_KEY, attraction);
                            await delayLog(attraction);
                        }

                        console.log('Attractions Crawling Done!');

                    })
                    .catch(err => {
                        console.error(err);
                    });

            })
            .catch(err => console.log(err));
}

const delayLog = async (attraction) => {
    await delay();
    console.log(attraction);
    await attractionDetailsExtractor.run(attraction);
};

const delay = function() {
    return new Promise(resolve => setTimeout(resolve, ATTRACTION_DELAY_TIME_OUT));
}
