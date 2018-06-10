var url = "http://localhost:3000"
var path = require("path")
var dirBIN   = path.join( require('app-root-path').path, "bin")
const DEBUG_LEVEL = "info"
const winston = require("winston")
const log = new (winston.Logger)({transports: [ new (winston.transports.Console)({level:DEBUG_LEVEL}) ]});
log.transports.console.level = "debug"
var request = require("request")
var cookieParser = require('cookie-parser')
const {promisify} = require('util');
var username = "admin"
var password = "admin"

var json = {
	"data":
	{
		"id":"test",
		"type":"test",
		"attributes":{
			"cmd":"log",
            "data":4,
            "logname":"pump-level"
		}		
	}
}

function login(){
    let resolve,reject
    let auth = new Promise((res,rej)=>{resolve=res;reject=rej})
    var jar = request.jar()
    request.post(
        {
            url:     url+"/login",
            form:    { username: username, password:password },
            jar: jar
        },function(err, response, body){
            if (err) {
                log.error("AUTH Client Post Failure");
                reject("AUTH Client  Post Failure")
            }
            if (body.includes("/login")) {
                log.error("AUTH Client  Login Failure");
                reject("AUTH Client  Login Failure")
            }
            else{
                var cookie_string = jar.getCookieString(url);
                var cookies = jar.getCookies(url);
                cookies.forEach(item => {
                    if(item.key == "connect.sid") {
                        let key = decodeURIComponent(item.value)
                        sessionID = require('cookie-parser').signedCookie(key,"SuperSecretKey123!")
                    }
                });
                log.info("AUTH Client  Post Login Success with SID:",sessionID);
                resolve(true)
            }
        });
    return auth   
}

function postLoop(){
    setInterval(()=>{ 
        //var random = Math.floor(Math.random()*10);
        var random = Math.random()*10;
        json.data.attributes.data = random+10
        console.log("Chart log sent:",random,new Date())
        var jar = request.jar()
        request.post(
            {
                url:     url+"/charts",
                json:    json,
                jar: jar
            },function(err, response, body){
                if (err) {
                    log.error("Charts Post Failure");
                }
                else{
                    var cookie_string = jar.getCookieString(url);
                    var cookies = jar.getCookies(url);
                    log.info("Charts Reply Received");
                }
            });

    },1000)
}

postLoop()