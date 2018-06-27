var app = require('./www.js').app;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var appRoot = require("app-root-path").path
var config = require("config")
var path = require("path")
var log = require("ucipass-logger")("auth")
var File = require("ucipass-file")
var auth = {} // This is where all exported functions are defined
log.transports.console.level = "info"
app.use(passport.initialize());
app.use(passport.session());

setup()

passport.use(new LocalStrategy(function(username, password, done) {  // THIS MUST come from POST on body.username and body.passport
	//return done(null, {id:"test"});
	log.debug("LocalStrategy: Attempt with User:",username,password);
	//var sqlite3 = require('sqlite3');
	//var db = new sqlite3.Database('./db/users.db');
	auth.getUser(username)
	.then((row)=>{
		if (!row) {
			log.error("LocalStrategy FAILED: Username:",username,"does not exist!");
			return done(null, false);
			}
		var crypto = require('crypto');
		var hash = crypto.createHash('sha256');
			hash.update(password);
			hash.update(row.salt);
			var digest = hash.digest('hex');
		if (digest === row.password) {
			log.debug("Password Match for user:",username);
			return done(null, {id:username});	// PASSPORT puts this in the user object for serialization
			}
		else{
			log.error("LocalStrategy - FAILED: Invalid password for Username:",username,"Password:",password);
			return done(null, false);
			}
	})
	.catch((err)=>{
		log.error("SQL Database Query Error:",err)
		return done(null, false);
	})
}))

passport.serializeUser(function(user, done) {
	log.debug("Serialize:",user);		// THIS IS WHERE THE user id is supposed to be put in an external session db)
	return done(null, user.id);
	})

passport.deserializeUser(function(id, done) {
	//console.log("AUTH - DeSerialize User:", id);
	log.debug("DeSerialize:" + id);
	//if (!myusers[id]) {return done(null, false);}
	return done(null, {id:id});    // THIS IS WHERE THE user id is supposed to be checked against an external session db)
	})


auth.alreadyLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()){
		//console.log("AUTH - ALREADY LOGGED IN");
		return next();
		}
	log.error("AUTH - NOT LOGGED IN, REDIRECTING TO LOGIN!","IP:",req.clientIp);
	res.redirect('/login?redir='+req.originalUrl);
	//res.redirect('/login.html')
	}

auth.login = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {				// LOGIN SEND post data to LocalStrategy body.username body.passport to CHECK11
		log.debug("authenticate: Username",user,"IP:",req.clientIp);										// LocalStrategy returns user object
		if (err) { log.error("authenticate ERROR:","IP:",req.clientIp);return next(err); }                    //If error return next with error
		if (!user) { log.error("authenticate: Invalid User ID Redirecting!","IP:",req.clientIp);return res.redirect('/login'); }  //If user is not there redirect it to login page
		req.logIn(user, function(err) {                                     //Request the actual Login from passport user object will be par or 'req'
			if (err) { 
				log.error("authenticate - ERROR User:",user,"IP:",req.clientIp)
				return next(err); //If error return next with error
				}				                    
			// ONCE LOGING IS COMPLETE!!!!
			log.info("Passport  auth success user:",user.id,"IP:",req.clientIp)
			return res.redirect(req.body.redir ? req.body.redir : "/");
			});
			})(req, res, next);												// Go to next function
	}

auth.logout = function(req, res, next) {
	log.info("LOGOUT:", ( req.user !== undefined ? req.user: 'Anonnymous'));
	req.logOut();										// logout
	req.session.destroy(function(){						// delete the auth session 
		res.redirect('/login?redir='+req.body.redir);	// redir is sent from the logout header via JSON
		//res.redirect('/login.html');	// redir is sent from the logout header via JSON
		});								
	}

auth.getUser = async function (username){
	let userdb = config.get("users.database")
	if ( userdb == "sqlite3"){
		return auth.getUserSqlite3(username)
	}
	else if ( userdb == "json"){
		return auth.getUserJSON(username)
	} else {
		reject("Users Database configuration file error")
	}
}

auth.getUserSqlite3 = async function (username){
	return new Promise((resolve,reject)=>{
		var sqlite3 = require('sqlite3');
		var dbfile = path.join( appRoot, config.get("users.sqlite3.directory"),config.get("users.sqlite3.file"))
		var db = new sqlite3.Database(dbfile);
		db.get('SELECT id,username,password,salt FROM users WHERE id = ?', username, function(err, row) {
			if (err) {
				reject(err)
			}
			else{
				resolve(row)
			}
		})
	})
}

auth.getUserJSON = async function getUserJSON(username){
	return new Promise((resolve,reject)=>{
		var filename = path.join( appRoot, config.get("users.json.directory"),config.get("users.json.file"))
		let userfile = new File(filename)
		userfile.readString()
		.then((userstring)=>{
			let users = JSON.parse(userstring)
			let row = users[username]
			resolve(row)
		})
		.catch(reject)
	})
}

async function setup(){
	database = config.get("users.database")
	if (database == "json"){
		await setupJson()
	}
	else if (database == "sqlite3"){
		await setupSqllite()
	}
}

async function setupSqllite(){
	var dbfile = path.join( appRoot, config.get("users.sqlite3.directory"),config.get("users.sqlite3.file"))
	var f = new File(dbfile)
	let dbname = "users.db"
	if (! await f.isFile() ){
		var db = require('./lib_sqlite.js');
		console.log(`database file ${dbname} does not exists! Creating.....`)
		let json = {dbname:dbname}
		await db.createTableIfNotExists("users",[["id","TEXT"],["username","TEXT"],["salt","TEXT"],["password","TEXT"]])(json)
		var id = "admin"
		var password = "admin"
		var salt = "1234567890"
		var crypto = require('crypto');
		var hash = crypto.createHash('sha256');
		hash.update(password);
		hash.update(salt);
		var digest = hash.digest('hex');
		var table 	= "users"
		var columns = ["id","username","salt","password"]
		var newrow 	= [id,id,salt,digest]

		db.sInsertRow(dbname,table,columns,newrow)
		.then(data => {
			console.log("First 'admin' user created")
		})
		.catch( e => {
			console.log("First 'admin' user creation failed with error:",e)
		})
	}
}

async function setupJson(){
	var dbfile = path.join( appRoot, config.get("users.json.directory"),config.get("users.json.file"))
	var f = new File(dbfile)
	if (! await f.isFile() ){
		console.log(`database file ${dbfile} does not exists! Creating.....`)
		var json = {"admin":{"firstName":"admin","lastName":"admin","password":"7ba9293f74fb0b610b7cce1494530ba975d15348ffec0b478b143fbe198bd917","salt":"1234567890"}}
		f.writeString(JSON.stringify(json))
		.then(data => {
			console.log("First 'admin' user created")
		})
		.catch( e => {
			console.log("First 'admin' user creation failed with error:",e)
		})
	}
}







module.exports = auth ;