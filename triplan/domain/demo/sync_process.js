let process = module.exports;

process.run = async () => {
    let countries = [
        {
            "name": "China",
            "url": "https://www.lonelyplanet.com/china"
        }, {
            "name": "Thailand",
            "url": "https://www.lonelyplanet.com/thailand"
        } , {
            "name": "Greece",
            "url": "https://www.lonelyplanet.com/greece"
        }, {
            "name": "Italy",
            "url": "https://www.lonelyplanet.com/italy"
        }
    ]

    for (const item of countries) {
        await delayedLog(item);
    }

    console.log('Done!');
};

const delayedLog = async function(item){
    await delay();

    console.log(item);
};

const delay = function() {
    return new Promise(resolve => setTimeout(resolve, 3000));
}
