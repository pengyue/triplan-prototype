const puppeteer = require('puppeteer');
const async = require('async');
const ATTRACTION_DETAILS_DELAY_TIME_OUT = 30000;
const attractionDescriptionExtractor = module.exports;

attractionDescriptionExtractor.run = async (attraction) => {

    const reader = async() => {

        try {
            console.log("Start the description scrapper for attraction: "  + attraction.name + " (url: " + attraction.url + ")");

            // const browser = await puppeteer.launch({
            //     headless: true,
            //     args: ['--no-sandbox']
            // });
            // const page = await browser.newPage();
            // await page.setViewport({ width: 1920, height: 926 });
            //
            // const response = await page.goto(
            //     attraction.url,
            //     {
            //         timeout: 3000000
            //     }
            // );
            //
            // if (404 == response._status) {
            //     console.log('Error loading attraction description page (404) ...');
            //     return null;
            // } else {
            //     let attractionDescription = await page.evaluate(() => {
            //         let contents = [];
            //         let fetchedDivs = document.querySelectorAll("div [class*='styles__textArticle___'] div p");
            //
            //         fetchedDivs.forEach((div) => {
            //             contents.push(div.innerText);
            //         });
            //
            //         return contents.join(' ');
            //     });
            //
            //     console.log(attractionDescription);
            //     return {
            //         'name': attraction.name,
            //         'url': attraction.url,
            //         'description': attractionDescription
            //     }
            // }

        } catch (err)  {
            console.log('Error loading attraction description page:', err);
            return null;
        }
    }

    reader()
        .then(attractionDetail => {

            //
            // // kafkaInitializer = new Promise((resolve, reject) => {
            // //     try {
            // //         const kafkaClient = kafkaInitializer.initialize('lonely-planet-attraction', 1);
            // //         return resolve(kafkaClient);
            // //     } catch (err) {
            // //         return reject(err);
            // //     }
            // // });
            //
            // const initializer = async() => {
            //     // const kafkaClient = await kafkaInitializer;
            //     // return kafkaClient;
            //     return null;
            // }
            //
            // initializer()
            //     .then(async (kafkaClient) => {
            //
            //         //kafkaProducer.produce(kafkaClient, ATTRACTION_TOPIC_NAME, ATTRACTION_TOPIC_KEY, attraction);
            //         await delayLog(attractionDetail);
            //
            //         console.log('Attractions Details Crawling Done ...');
            //     })
            //     .catch(err => {
            //         console.error(err);
            //     });

        })
        .catch(error => console.log(error));
}

// const delayLog = async (attractionDetail) => {
//     await delay();
//     console.log(attractionDetail);
// };
//
// const delay = function() {
//     return new Promise(resolve => setTimeout(resolve, ATTRACTION_DETAILS_DELAY_TIME_OUT));
// }