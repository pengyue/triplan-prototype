const COUNTRY_JSON_DATA_FILE =  "../../node_modules/country-json/src/country-by-name.json";
const LONELY_PLANET_BASE_URL = "https://www.lonelyplanet.com/";
const COUNTRY_DELAT_TIME_OUT = 180000;
var cityExtractor = require('./top_10_citiy_producer');

var eventPublisher = module.exports;

eventPublisher.run = async (browser) => {

    var countries = require(COUNTRY_JSON_DATA_FILE)

    for (const item of countries) {
        await delayedLog(item);
    }

    // cityExtractor.run({
    //     "name": "America Samoa",
    //     "url": "https://www.lonelyplanet.com/american-samoa"
    // });
    //
    // cityExtractor.run({
    //     "name": "USA",
    //     "url": "https://www.lonelyplanet.com/usa"
    // });
}

const delayedLog = async (node) => {
    await delay();

    var country_url = LONELY_PLANET_BASE_URL + node.country.replace(/ /g,"-").toLowerCase();
    console.log(country_url);
    cityExtractor.run({
        "name": node.country,
        "url": country_url
    });
};

const delay = function() {
    return new Promise(resolve => setTimeout(resolve, COUNTRY_DELAT_TIME_OUT));
}