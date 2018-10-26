const puppeteer = require('puppeteer');
var async = require('async');
// var attractionDetailsExtractor = require('./attraction_details');

var attractionExtractor = module.exports;

attractionExtractor.run = function (city) {

    const reader = async () => {

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

    reader()
        .then( attractions => {

            console.log(attractions);
            // console.log(" ");
            //
            // setTimeout(function () {
            //     attractions.forEach((attraction) => {
            //         attractionDetailsExtractor.run(attraction);
            //     });
            // }, 5000);

        })
        .catch(
            err => console.log(err)
        );
}
