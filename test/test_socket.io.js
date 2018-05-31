var url = "http://localhost:3000"
var path = require("path")
var supertest = require("supertest")
var app = require(path.join(__dirname,"..","app.js"))
var agent = supertest.agent(url)
var request = require("request")
var cookieParser = require('cookie-parser')
const {promisify} = require('util');
var log = require("../bin/logger.js")("moccha")
log.transports.console.level = "info"

describe('Socket.io Server Test', function(){
    it("POST Session Cookie Test", function(done){
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
                form:    { username: "test", password:"test" },
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
    it("Post Socket.io authentication", async function(){
        let resolve,reject
        let auth = new Promise((res,rej)=>{resolve=res;reject=rej})
        var jar = request.jar()
        let sessionID = null
        request.post(
            {
                url:     url+"/login",
                form:    { username: "test", password:"test" },
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
        await auth
        let sauth = new Promise((res,rej)=>{resolve=res;reject=rej})
        var socket = require('socket.io-client')('http://localhost:3000');
        socket.on('connect', async function(){
            log.info("AUTH Client socket.io connected with ID",socket.id);
            log.debug(sessionID)
            socket.emit('auth', { sid:sessionID }, (msg)=>{
                if(msg){
                    log.info("AUTH Client Socket.io Login Success:")
                    resolve(true)
                }else{
                    log.info("AUTH Client Socket.io Login Success:")
                    resolve(false)
                }
            })            
        });
        socket.on('event', function(data){});
        socket.on('disconnect', function(){});
        //await promisify(setTimeout)(2000)
        return Promise.all([auth,sauth])
    })
})