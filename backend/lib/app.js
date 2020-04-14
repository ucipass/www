const express = require('express');
const app = express();
const createError = require('http-errors');
const path = require('path')
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors') // ONLY FOR DEVELOPMENT!!!
const history = require('connect-history-api-fallback');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongooseConnection  =  require("../lib/mongooseclient.js")()
app.mongooseConnection = mongooseConnection // For mocha test to close

// // LOGGING

var log = require("ucipass-logger")("app")
log.transports.console.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info"

const TESTING = process.env.NODE_ENV == "testing" ? true : false 
const SECRET_KEY      = process.env.SECRET_KEY ? process.env.SECRET_KEY : "InsecureRandomSessionKey"
const PREFIX          = process.env.PREFIX ? path.posix.join("/",process.env.PREFIX) : "/"
const PREFIX_LOGIN    = path.posix.join("/",PREFIX, "login")
const PREFIX_LOGOUT   = path.posix.join("/",PREFIX, "logout")
const PREFIX_DOWNLOAD = path.posix.join("/",PREFIX, "download")
const URL_USERS_CREATE= path.posix.join("/",PREFIX,"users", "create")
const URL_USERS_READ  = path.posix.join("/",PREFIX,"users", "read")
const URL_USERS_UPDATE= path.posix.join("/",PREFIX,"users", "update")
const URL_USERS_DELETE= path.posix.join("/",PREFIX,"users", "delete")


app.use(cors({origin:true,credentials: true}));; //PLEASE REMOVE FOR PRODUCTION
app.use(session({
  store: new MongoStore({
      mongooseConnection: mongooseConnection
  }),
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 * 1 // one week
    //maxAge: 1000 * 5  // 5 seconds
  }
}));

// app.use(session({
//   secret: SECRET_KEY,
//   resave: false,
//   saveUninitialized: false
// }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// DEBUG MIDDLEWARE
app.use(function (req, res, next) {
  if ( TESTING ){
    log.debug('Middleware path:',req.path)
  }
  next()
})


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(function(username, password, done) {  // THIS MUST come from POST on body.username and body.passport

  // const WebuserSchema = new mongoose.Schema({
  //   username: { type: String, required: true, unique: true },
  //   password: { type: String, required: true },
  //   expiration: { type: Date, required: true, default: Date.now },
  // });
  // const Webuser = mongooseConnection.model( "Webuser", WebuserSchema)
  mongooseConnection.getUser(username)
  .then((user)=>{
    if( username == user.username  && password == user.password){
      return done(null, {id:username});	// PASSPORT puts this in the user object for serialization
    }
    else{
      return done(null, false);
    }    
  })
  .catch((err)=>{
    return done(null, false);
  })    




}))

passport.serializeUser(function(user, done) {
	return done(null, user.id); // THIS IS WHERE THE user id is supposed to be put in an external session db)
})

passport.deserializeUser(function(id, done) {
	return done(null, {id:id});    // THIS IS WHERE THE user id is supposed to be checked against an external session db)
})

passport.checkLogin = function(req, res, next) {
	if (req.isAuthenticated()){
		return next();
    }
  if (process.env.NODE_ENV == 'testing'){
    log.warn("AUTH - NOT LOGGED IN IP:",req.clientIp);
  }else{
    log.error("AUTH - NOT LOGGED IN IP:",req.clientIp);
  }
	
	res.json(false);
	// res.redirect(PREFIX_LOGIN)
	}

  app.use(history());
//=================================================
//  WEB USERS
//=================================================

app.post(URL_USERS_CREATE, passport.checkLogin, async (req, res) => {
  let user = req.body
  mongooseConnection.createUser(user)
  .then((response)=> res.json("success"))  
  .catch((error)=> res.json(error))  
  
})

app.post(URL_USERS_READ, passport.checkLogin, async (req, res) => {
  let users = await mongooseConnection.getUsers().catch(()=>{[]})  
  res.json(users)
})

app.post(URL_USERS_DELETE, passport.checkLogin, async (req, res) => {
  let users = req.body
  mongooseConnection.deleteUser(users)
  .then((response)=> {
    res.json("success")
  })  
  .catch((error)=> {
    res.json(error)
  })  
})

app.post(URL_USERS_UPDATE, passport.checkLogin, async (req, res) => {
  let user = req.body
  mongooseConnection.updateUser(user)
  .then((response)=> {
    res.json("success")
  })  
  .catch((error)=> {
    res.json(error)
  })  
})


//=================================================
//  LOGIN & LOGOUT
//=================================================
let mypath = path.join(__dirname, "../dist")
app.use( "/", express.static(  mypath ))
app.use( "/users", express.static(  mypath ))
// app.use( "/clients" ,express.static('clients'), serveIndex('clients', {'icons': true}))
log.info("Listening path:", PREFIX)

// app.get('/', (req, res) => {
//     res.send('Socket Manager')
// })

app.get('/favicon.ico', (req, res) => res.status(204));

app.post(PREFIX_LOGIN, function (req,res,next) {
  passport.authenticate('local', function(err, user, info) {				// LOGIN SEND post data to LocalStrategy body.username body.passport to CHECK11
		log.debug("authenticate: Username",user,"IP:",req.clientIp);										// LocalStrategy returns user object
    
    if (err) { 
      log.error("authenticate ERROR:","IP:",req.clientIp);
      return next(err); 
    }                    //If error return next with error
    
    if (!user) {
      if (process.env.NODE_ENV == 'testing' || process.env.NODE_ENV == 'development'){
        log.info("Authentication failed","IP:",req.clientIp);
      }
      else{
        log.error("Authentication failed","IP:",req.clientIp);
      }
      
      return res.json(false);
    }  //If user is not there redirect it to login page
    
    req.logIn(user, function(err) {                                     //Request the actual Login from passport user object will be par or 'req'
			if (err) { 
        log.error("authentication internal error: User:",user,"IP:",req.clientIp)
        return next(err); //If error return next with error
      }

			// LOGING IS COMPLETE!!!!
			log.info("Passport  auth success user:",user.id,"IP:",req.clientIp)
      // return res.json("success");
      return res.status(err ? 500 : 200).send(err ? err : user);
      // return res.redirect('')
		});
	})(req, res, next);	
})

app.post(PREFIX_LOGOUT, function (req,res,next) {
	log.info("LOGOUT:", ( req.user !== undefined ? req.user: 'Anonnymous'));
	req.logOut();										// logout
	req.session.destroy(function(){						// delete the auth session 
    res.json("success");
  });								
 
})

app.get(PREFIX_LOGIN, passport.checkLogin, (req,res) => {
  res.json("success");
})


//=================================================
//  ERROR HANDLER
//=================================================
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

// catch 404 and forward to error handler
app.use((req, res, next) => {
  log.error("INVALID URL:",req.url)
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
