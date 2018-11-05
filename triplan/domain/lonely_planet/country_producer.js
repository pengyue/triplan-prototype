const COUNTRY_JSON_DATA_FILE =  "../../node_modules/country-json/src/country-by-name.json";
const LONELY_PLANET_BASE_URL = "https://www.lonelyplanet.com/";
const COUNTRY_DELAT_TIME_OUT = 2000;
const SKIPPED_COUNTRIES = [
    'american-samoa',
    'antarctica',
    'cocos-(keeling)-islands',
    'bouvet-island',
    'ivory-coast',
    'french-guiana',
    'french-southern-territories',
    'gibraltar',
    'heard-island-and-mcdonald-islands',
    'holy-see-(vatican-city-state)',
    'micronesia,-federated-states-of',
    'mayotte',
    'netherlands-antilles',
    'norfolk-island',
    'palestine',
    'pitcairn',
    'saint-helena',
    'saint-pierre-and-miquelon',
    'south-georgia-and-the-south-sandwich-islands',
    'svalbard-and-jan-mayen',
    'virgin-islands,-british',
    'virgin-islands,-u.s.',
    'western-sahara',
    'yugoslavia'
];
const RENAMED_COUNTRIES = {
    "aruba": "aruba-bonaire-and-curacao/aruba",
    "bosnia-and-herzegovina": "bosnia-and-hercegovina",
    "bahamas": "the-bahamas",
    "brunei": "brunei-darussalam",
    "the-democratic-republic-of-congo": "congo",
    "cook-islands": "rarotonga-and-the-cook-islands",
    "fiji-islands": "fiji",
    "french-polynesia": "tahiti-and-french-polynesia",
    "gambia": "the-gambia",
    "guyana": "the-guianas/guyana",
    "kazakstan": "kazakhstan",
    "libyan-arab-jamahiriya": "libyan",
    "myanmar": "myanmar-burma",
    "northern-ireland": "ireland/northern-ireland",
    "russian-federation": "russia",
    "saint-kitts-and-nevis": "st-kitts-and-nevis",
    "saint-lucia": "st-lucia",
    "saint-vincent-and-the-grenadines": "st-vincent-and-the-grenadines",
    "san-marino": "italy/emilia-romagna-and-san-marino/san-marino",
    "srilanka": "sri-lanka",
    "turks-and-caicos-islands": "turks-and-caicos",
    "united-kingdom": "england",
    "united-states": "usa"
};

var cityExtractor = require('./top_10_citiy_producer');

var eventPublisher = module.exports;

eventPublisher.run = async () => {

    var countries = require(COUNTRY_JSON_DATA_FILE)
    for (const item of countries) {

        const countryNameIndex = item.country.replace(/ /g,"-").toLowerCase();
        let countryUrl = LONELY_PLANET_BASE_URL + countryNameIndex;

        if (SKIPPED_COUNTRIES.includes(countryNameIndex)) {
            continue;
        }

        if (RENAMED_COUNTRIES.hasOwnProperty(countryNameIndex)) {
            countryUrl = LONELY_PLANET_BASE_URL + RENAMED_COUNTRIES[countryNameIndex]
        }

        await delayedLog(item.country, countryUrl);
    }

    // cityExtractor.run({
    //     "name": "USA",
    //     "url": "https://www.lonelyplanet.com/usa"
    // });
}

const delayedLog = async (countryName, countryUrl) => {
    await delay();
    cityExtractor.run({
        "name": countryName,
        "url": countryUrl
    });
};

const delay = function() {
    return new Promise(resolve => setTimeout(resolve, COUNTRY_DELAT_TIME_OUT));
}