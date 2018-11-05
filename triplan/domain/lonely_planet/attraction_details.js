const async = require('async');
const browser = require('../../infrastructure/puppeteer/browser');
const kafkaInitializer = require('../../infrastructure/kafka/initializer');
const kafkaProducer = require('../../infrastructure/kafka/producer');
const attractionDescriptionExtractor = module.exports;

const ATTRACTION_DETAILS_TOPIC_NAME =
    process.env.PRODUCER_KAFKA_ATTRACTION_DETAILS_TOPIC_NAME
        ? process.env.PRODUCER_KAFKA_ATTRACTION_DETAILS_TOPIC_NAME
        : "prototype-cities-attraction-details";

const ATTRACTION_DETAILS_TOPIC_KEY =
    process.env.PRODUCER_KAFKA_ATTRACTION_DETAILS_TOPIC_KEY
        ? process.env.PRODUCER_KAFKA_ATTRACTION_DETAILS_TOPIC_KEY
        : "lonely-planet-top-city-attraction-details-key";

attractionDescriptionExtractor.run = async (attraction) => {

    const reader = async() => {

        try {
            console.log("Start the description scrapper for attraction: "  + attraction.name + " ( url: " + attraction.url + " )");

            const cluster = await browser.getBrowserInstance();

            const attractionDetailProcess = await cluster.task(async ({ page, data: attraction }) => {

                const response = await page.goto(attraction.url, { waitUntil: 'domcontentloaded' });

                if (404 == response._status) {
                    console.log('Error loading attraction description page (404) ...');
                    return null;
                } else {
                    let attractionDescription = await page.evaluate(() => {
                        let contents = [];
                        let fetchedDivs = document.querySelectorAll("div [class*='styles__textArticle___'] div p");

                        fetchedDivs.forEach((div) => {
                            contents.push(div.innerText);
                        });

                        return contents.join(' ');
                    });

                    console.log("Attraction Details: " + attractionDescription);

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
                    };

                    initializer()
                        .then(async (kafkaClient) => {
                            kafkaProducer.produce(
                                kafkaClient,
                                ATTRACTION_DETAILS_TOPIC_NAME,
                                ATTRACTION_DETAILS_TOPIC_KEY,
                                {
                                    'name': attraction.name,
                                    'url': attraction.url,
                                    'description': attractionDescription
                                });
                            console.log('Attractions Details message pushed ...');
                        })
                        .catch(err => {
                            console.log("attraction-detail-pushing:" + err);
                        });
                }
            });

            await cluster.queue(attraction, attractionDetailProcess);

            await cluster.idle();

        } catch (err)  {
            console.log('Error loading attraction description page:', err);
            return null;
        }
    }

    reader()
        .then(async() => console.log("attraction-detail-result ... "))
        .catch(error => console.log("attraction-detail-result-error:" + error));
};
