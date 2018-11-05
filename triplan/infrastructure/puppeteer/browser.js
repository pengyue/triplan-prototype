const { Cluster } = require('puppeteer-cluster');
let instance = null;

module.exports.getBrowserInstance = async () => {
    if (!instance) {
        instance =
        await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 4,
            monitor: true,
        });
    }
    return instance;
}