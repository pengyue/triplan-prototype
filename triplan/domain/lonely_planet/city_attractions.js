const puppeteer = require('puppeteer');
var async = require('async');
var kafkaInitializer = require('../../infrastructure/kafka/initializer');
var kafkaProducer = require('../../infrastructure/kafka/producer');
// var attractionDetailsExtractor = require('./attraction_details');

const ATTRACTION_TOPIC_NAME =
    process.env.PRODUCER_KAFKA_ATTRACTION_TOPIC_NAME
        ? process.env.PRODUCER_KAFKA_ATTRACTION_TOPIC_NAME
        : "prototype-top-attractions";

const ATTRACTION_TOPIC_KEY =
    process.env.PRODUCER_KAFKA_ATTRACTION_TOPIC_KEY
        ? process.env.PRODUCER_KAFKA_ATTRACTION_TOPIC_KEY
        : "lonely-planet-top-attraction-key";

var attractionExtractor = module.exports;

attractionExtractor.run = function (city) {

    const reader = async (city) => {

        const browser = await puppeteer.launch({
            headless: true,
                args: ['--no-sandbox']
        });
        const page = await browser.newPage();
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
                await browser.close();
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

            }
        } catch (err)  {
            console.log('Error loading attraction list page:', err);
            await browser.close();
        }
    }

    reader(city)
        .then(attractions => {

                console.log(" ");

                kafkaInitializer = new Promise((resolve, reject) => {
                    try {
                        const kafkaClient = kafkaInitializer.initialize('lonely-planet-attraction', 1);
                        return resolve(kafkaClient);
                    } catch (err) {
                        return reject(err);
                    }
                });

                const initializer = async() => {
                    const kafkaClient = await kafkaInitializer;
                    return kafkaClient;
                }

                initializer()
                    .then(kafkaClient => {
                        attractions.forEach((attraction) => {
                            console.log('================> Pushing attraction to kafka' + attraction.name);
                            kafkaProducer.produce(kafkaClient, ATTRACTION_TOPIC_NAME, ATTRACTION_TOPIC_KEY, attraction);
                            //attractionDetailsExtractor.run(attraction);
                        });
                    })
                    .catch(err => {
                        console.error(err);
                    });

            })
            .catch(err => console.log(err));
}
