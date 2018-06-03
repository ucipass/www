var url = "http://localhost:3000"
var path = require("path")
var supertest = require("supertest")
var app = require(path.join(__dirname,"..","app.js"))
var agent = supertest.agent(url)
var request = require("request")
var cookieParser = require('cookie-parser')
const {promisify} = require('util');
var log = require("../bin/logger.js")("moccha")
log.transports.console.level = "debug"
var username = "admin"
var password = "admin"

describe('Web Server Test', function(){
    it("Login Authentication as admin", function(done){
        agent
        .post('/login')
        .send({
            username: 'admin',
            password: 'admin'
        })
        .expect(302)
        .end(function(err, res) {
            if (err) {
                throw err;
            }
            done()
        })
    })
    it("Already Logged-in as admin", function(done){
        agent
        //.get('/')
        //.expect(302)
        .get('/')
        .expect(200)
        .end(function(err, res) {
            if (err) {
                throw err;
            }
            done()
        })
    })
    it("Session Cookie Test", function(done){
        var jar = request.jar()
        request({url: url, jar: jar}, function () {
            var cookie_string = jar.getCookieString(url); // "key1=value1; key2=value2; ..."
            cookies = jar.getCookies(url);
            if ( ! cookies.length ) { done("NO COOKIES!");return}
            cookies.forEach((cookie) => {
                //console.log(cookie.key,cookie.value)
                if (cookie.key == "connect.sid"){
                    let signedSessionID = decodeURIComponent(cookie.value)
                    let sessionID = cookieParser.signedCookie(signedSessionID,"SuperSecretKey123!")
                    jar = request.jar()
                    done()
                    return
                }else{
                    jar = request.jar()
                    done("Cookie Connect.sid not found!")
                    return
                }        
            });
        })
    })
    it("Request POST authentication", async function(){
        //await promisify(setTimeout)(2000)
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
    })
})