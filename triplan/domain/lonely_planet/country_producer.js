const COUNTRY_JSON_DATA_FILE =  "../node_modules/country-json/src/country-by-name.json";
const LONELY_PLANET_BASE_URL = "https://www.lonelyplanet.com/";
var cityExtractor = require('./top_10_citiy_producer');

var eventPublisher = module.exports;

eventPublisher.run = function () {
    // var countries = require(COUNTRY_JSON_DATA_FILE)
    // console.log(countries);
    // countries.forEach( function(node){
    //     var country_url = LONELY_PLANET_BASE_URL + node.country.replace(/ /g,"-").toLowerCase();
    //     cityExtractor.run({
    //         "name": node.country,
    //         "url": country_url
    //     });
    // });

    cityExtractor.run({
        "name": "Thailand",
        "url": "https://www.lonelyplanet.com/thailand"
    });
}