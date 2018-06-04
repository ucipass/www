var fs    = require("fs")
var path    = require("path")
var dirApp  = require('app-root-path').path
var dirHTML = path.join( dirApp , "dist")
var dirDB   = path.join( dirApp , "db")
var dirLOG  = path.join( dirApp , "log")
if (!fs.existsSync(dirHTML)){ fs.mkdirSync(dirHTML);}
if (!fs.existsSync(dirDB)){ fs.mkdirSync(dirDB);}
if (!fs.existsSync(dirLOG)){ fs.mkdirSync(dirLOG);}
var express = require('express')		// Express.js
var favicon = require('serve-favicon');
var app     = require('./bin/www.js').app		// Express.js App
var server     = require('./bin/www.js').server		// Express.js App
var auth 	= require('./bin/auth.js');			// Authentication middleware using Passport (using "app")
var users 	= require('./bin/users.js');	// Router for User Management
var charts 	= require('./src/charts/charts-server.js');	// Router for charts Management
var test 	= require('./src/test/test-server.js');	// Router for test Management


app.use( favicon(path.join(dirHTML, 'public/images/favicon.ico')));
app.use( '/public'                      , express.static(path.join(dirHTML, 'public')));
app.use( '/private',auth.alreadyLoggedIn, express.static(path.join(dirHTML, 'private')));
app.post('/login' , auth.login ); //redirects to login page or original URL based on ?redir=
app.post('/logout', auth.logout); //redirects to login page

app.get( '/'        , (req,res)=>{ res.sendFile(path.join(dirHTML,'index.html'))})	
app.get( '/login*'  , (req,res)=>{ res.sendFile(path.join(dirHTML,'login.html'))})
app.use( "/users"   , auth.alreadyLoggedIn ,users)
app.use( "/charts"  ,charts)
app.use( "/test"    , test)

app.use(function(req, res, next) {
	var message ="<p>Invalid URL! Your session is being logged! Unauthorized access to this site is strictly prohibited!</p>"
	message += "<p>"+req.clientIp+"</p>"	
	res.status(404).send(message);
	if (req.method == "POST") {
		let data = null
		if (req.body && req.body.data){ data = req.body.data }
		console.log(req.method,'from:',req.clientIp,"INVALID JSON:",req.url,"DATA:", data ? data : "invalid JSON.data");
	}else{
		console.log(req.method,'from:',req.clientIp,"INVALID URL:",req.url);
	}
});

module.exports = server;


