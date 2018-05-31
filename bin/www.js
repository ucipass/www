var express = require('express');
var app = express();
var server = require('http').createServer(app);
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var secretKey = "SuperSecretKey123!" ;
var session = require('express-session');	
// MEMORY SESSION STORE
//var sessionstore = require('sessionstore');
//var mySessionStore = new sessionstore.createSessionStore();  // Sessionstore in memory
/*var mySession = {
	store: mySessionStore,  
	secret: secretKey,  
	saveUninitialized: true, 
	resave: true
};*/
// SQLITE3 SESSION STORE
var SQLiteStore = require('connect-sqlite3')(session); // Optional sessionstore
var mySQLiteStore = new SQLiteStore({db: 'sessions.db', dir: path.join( __dirname, "..","db") })
var mySession = { store: mySQLiteStore,
	secret: secretKey,
	saveUninitialized: true, 
	resave: true,
	cookie: { httpOnly: true, maxAge:  24 * 60 * 60 * 1000 } /* 1 day*/  }

// GEO IP
var requestIp = require('request-ip');
app.use(requestIp.mw()) // Adds req.clientIp;
app.use(function(req,res,next){// Adds req.clientCountry;
	var loc = geoip.lookup(req.clientIp)
	if (loc){req.clientCountry=loc.country}
	else{req.clientCountry="XX"}
	next()
	}) 

			
// LOGGING
var log = require("./logger.js")("www")
log.transports.console.level = "error"
log.stream =   { write: function(message, encoding) {
	if (message.indexOf(' 404 ') == -1) log.info(message.trim())
	else log.error(message.trim())
}}
var morgan = require('morgan');
var geoip = require('geoip-lite');
morgan.token('logIP', function logIP (req) {return req.logIP})
morgan.token('logCC', function logCC (req) {return req.logCC})
app.use(function(req,res,next){req.logIP = req.clientIp;next()})
app.use(function(req,res,next){req.logCC = req.clientCountry;next()})
app.use(morgan(':date[iso] :logIP :logCC :method :status :url :user-agent', {stream: log.stream}))
//app.use(morgan(':date[iso] :logIP :logCC :method :status :url :user-agent', {stream: accessLogStream}))
//app.use(morgan(':method :logIP :logCC :status :url :response-time'));

// EXPRESS STUFF
app.set('views','./views/');
app.set('view engine','pug');
app.locals.pretty = true // indent produces HTML for clarity
app.use(cookieParser("SecretKey123"));
app.use(session(mySession));
app.use(bodyParser.json({limit: '50mb',parameterLimit: 10000}));
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 10000,limit: '50mb' }));

// EXPORT
module.exports.app			= app;			//used by app.js
module.exports.server		= server;		//used by app.js and sio.js
module.exports.mySession	= mySession;	//used by auth.js

server.listen(3000, function () {
        console.log('Node JS listening on port 3000!');
		});
var sio = require('./sio.js');
