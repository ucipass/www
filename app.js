var path	= require("path")
var app     = require('./bin/www.js').app		// Express.js
var auth 	= require('./bin/auth.js');			// Authentication middleware using Passport (using "app")
var users 	= require('./bin/users.js').router;	// Router for User Management



app.post('/login' , auth.login ); //redirects to login page or original URL based on ?redir=
app.post('/logout', auth.logout); //redirects to login page
app.get( '/login' , (req,res)=>{
	res.render('login',{
		title:"Login Page" ,
		user:req.user?req.user.id:null ,
		message: "Unauthorized access is strictly prohibited!",
		redir:req.query.redir });
	}
);
app.get( '/'      , auth.alreadyLoggedIn, (req,res)=>{
	res.render('home',{
		title:"Home" ,
		user:req.user?req.user.id:null ,
		message: "Welcome!",
		redir:req.query.redir });
	}
);
app.use( "/users" , auth.alreadyLoggedIn ,users)
app.get( '/test'  , auth.alreadyLoggedIn ,(req,res) => {
	res.render('test',{ user:req.user ? req.user.id : null })
});

//
// CATCH ALL BAD ONE REQUEST
//

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

module.exports = app;


