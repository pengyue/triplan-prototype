const COUNTRY_JSON_DATA_FILE =  "../node_modules/country-json/src/country-by-name.json";
const LONELY_PLANET_BASE_URL = "https://www.lonelyplanet.com/";
var cityExtractor = require('./top_10_citiy_producer');

var eventPublisher = module.exports;

eventPublisher.run = async (browser) => {
    // var countries = require(COUNTRY_JSON_DATA_FILE)
    // console.log(countries);
    // countries.forEach( function(node){
    //     var country_url = LONELY_PLANET_BASE_URL + node.country.replace(/ /g,"-").toLowerCase();
    //     cityExtractor.run({
    //         "name": node.country,
    //         "url": country_url
    //     });
    // });

    await cityExtractor.run({
        "name": "Thailand",
        "url": "https://www.lonelyplanet.com/thailand"
    });

    await cityExtractor.run({
        "name": "Italy",
        "url": "https://www.lonelyplanet.com/italy"
    });

    await cityExtractor.run({
        "name": "France",
        "url": "https://www.lonelyplanet.com/france"
    });
}