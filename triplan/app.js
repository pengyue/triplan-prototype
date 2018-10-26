'use strict';

require('events').EventEmitter.defaultMaxListeners = 0

// Constants
const PORT = (process.env.PRODUCER_NODE_UI_LISTEN_PORT) ? process.env.PRODUCER_NODE_UI_LISTEN_PORT : 8000;
const HOST = '0.0.0.0';
const HEALTH_LIVENESS = "/health-liveness";
const HEALTH_READINESS = "/health-readiness";

const bodyParser = require('body-parser');
const express = require('express');
var countryExtractor = require('./domain/lonely_planet/country_producer');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs')

// App
app.get('/city/producer', function (req, res) {
    res.render('index');
});

//health check
app.get(HEALTH_LIVENESS, function (req, res) {
    res.render('health/liveness')
});
app.get(HEALTH_READINESS, function (req, res) {
    res.render("health/readiness");
});

countryExtractor.run();

app.listen(PORT, HOST);

console.log("Running on http://" + HOST + ":" + PORT);
console.log(" ");

