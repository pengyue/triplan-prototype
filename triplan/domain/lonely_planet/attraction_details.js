const puppeteer = require('puppeteer');
var async = require('async');

var attractionDescriptionExtractor = module.exports;

attractionDescriptionExtractor.run = function (attraction) {

    const reader = async() => {

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 926 });


        try {
            console.log("Start the description scrapper for attraction: "  + attraction.name + " (url: " + attraction.url + ")");

            const response = await
            page.goto(
                attraction.url,
                {
                    timeout: 3000000
                }
            );

            if (404 == response._status) {
                console.log('Error loading attraction description page (404) ...');
                await browser.close();
            } else {
                let description = await page.evaluate(() => {
                    let contents = [];
                    let fetchedDivs = document.querySelectorAll("div [class*='styles__textArticle___'] div p");

                    fetchedDivs.forEach((div) => {
                        contents.push(div.innerText);
                    });

                    return contents.join(' ');
                });

                return {
                    'name': attraction.name,
                    'url': attraction.url,
                    'description': description
                }
            }

        } catch (err)  {
            console.log('Error loading attraction description page:', err);
            await browser.close();
        }
    }

    reader()
        .then( description => {

            console.log(" ");

            console.log(description);
        })
        .catch(

            err => {
                console.log("=============================================");
                console.log(attraction.name)
                console.log(attraction.url)
                console.log(err)
            }
        );
}