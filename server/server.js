var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    cache = require('./cache.js'),
    app = express();

app.use('/scripts', express.static(__dirname + '/../bower_components'));
app.use(express.static(__dirname + '/../client'));
app.use(bodyParser.json());
app.use(require('./routes.js'));

app.listen(process.env.PORT || 3000, function() {
    console.log('Server running on port 3000');
});
cache.connect();
