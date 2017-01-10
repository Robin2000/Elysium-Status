var fs = require('fs');
var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var http = require('http');
var colors = require('colors');
var router = express.Router(); 

//--- EXPRESS CORE SETUP ---
//Hide software from potential attackers.
app.disable('x-powered-by');

//Use bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var Keeper = require('./modules/keeper');
var keeper = new Keeper();
keeper.process();




var http_port = 80;
var https_port = 443;
var is_live = true;

if (process.argv[2] == 'dev') {
    http_port = 8080;
    https_port = 8081;
    is_live = false;
}

// START THE SERVER
// =============================================================================
http.createServer(app).listen(http_port);

console.log(colors.yellow('CORE') + ' Enabled ' + colors.bold('HTTP') + ' at ' + http_port);

/**
 * BEGIN
 */

app.use('/static', express.static('static'))
app.use('/', router);




router.get('/', function(req, res){
    res.sendFile('index.html', {root: __dirname })
});

router.get('/fetch', function(req, res){
    res.json(keeper.get());
});

router.get('/stats', function(req, res){

    var outcontent = {
        time: new Date(),
        servers: {}
    };

    for (var serverName in keeper.statuses) {
        
        var outServer = {};
        var storedServer = keeper.statuses[serverName];

        outServer.status = storedServer.status;
        outServer.last_updated = storedServer.last_updated;

        //Include memory for some servers..
        if (storedServer.memory != undefined) outServer.memory = storedServer.memory;
        

        outcontent.servers[serverName] = outServer;

    }

    res.json(outcontent);

});