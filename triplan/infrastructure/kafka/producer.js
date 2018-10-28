var kafka = require('kafka-node');
var kafkaProducer = module.exports;

kafkaProducer.produce = function(client, topicName, eventKey, event) {
    var kafkaProducer = kafka.Producer;
    var keyedMessage = kafka.KeyedMessage;
    eventProducer = new kafkaProducer(client);

    km = new keyedMessage(eventKey, JSON.stringify(event));
    payloads = [
        { topic: topicName, messages: [km], partition: 0 }
    ];

    eventProducer.send(payloads, function (err, event) {
        if (err) {
            console.error("Failed to publish event with key " + eventKey + " to topic " + topicName + " :" + JSON.stringify(err));
        }
        console.log("Published event with key " + eventKey + " to topic " + topicName + " :" + JSON.stringify(payloads));
    });
}