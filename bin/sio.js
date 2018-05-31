let app = require("./www.js").app
let server = require("./www.js").server
var session = require("./www.js").mySession
var log = require("./logger.js")("www")
let sio = require('socket.io')(server)
let clients = []

sio.on('connection', (socket) => {
    clients.push(socket)
    let lastSocket = socket.id
    let user = socket.user
    let auth = socket.auth
    log.info('Socket.io user connected',socket.id);
    socket.on('disconnect', ()=>{
        log.info('Socket.io user disconnected id:',lastSocket);
    })
    socket.on('auth', ( msg , callback )=>{
        var session = require("./www.js").mySession
        if(msg && msg.sid){
            session.store.get(msg.sid, function(error, session){
                if( session.passport && session.passport.user){
                    log.info("Socket.io auth success user:",session.passport.user, socket.id)
                    socket.auth = true
                    socket.user = session.passport.user
                    callback(true)
                    return        
                }
                else{
                    log.info("Socket.io auth fail id:",socket.id)
                    callback(false)
                    return
                }
            })
        }
        else if(msg && msg.cookie){
            log.debug("COOKIE",socket.request.headers.cookie)
            let sessionID = getExpressSessionFromHeader(socket.request.headers.cookie)
            session.store.get(sessionID, function(error, session){
                if( session && session.passport && session.passport.user){
                    log.info("Socket.io auth success user:",session.passport.user, socket.id)
                    socket.auth = true
                    socket.user = session.passport.user
                    callback(true)
                    return        
                }
                else{
                    log.info("Socket.io auth fail id:",socket.id)
                    callback(false)
                    return
                }
            })
        }
        else{
            log.error("Socket.io no session ID sent!")
            callback(false)
        }
    });
    socket.on('echo', ( msg , callback )=>{
        try{
            log.debug("Socket.io echo recevied from",socket.id)
            callback(msg)
        }catch(e){
            log.error("Socket.io error with sending reply on echo")
        }
    });
    socket.on('data', ( msg , callback )=>{
        if(auth){
            console.log("Reply data", new Date())
            callback("Reply data")
        }else{
            console.log("Not Authenticated")
            callback(false)
        }
    });
})

function logRooms(){
        setInterval(()=>{
            console.log("Rooms:",Object.keys(io.sockets.adapter.rooms).toString())
        },1000)
    }

function getExpressSessionFromHeader(header){
    let sessionID = null
    let cookieArray = header.split(";")
    if (! cookieArray.length) {
        log.info("Socket.io auth fail id:",socket.id)
        callback(false)
        return
    }
    cookieArray.forEach(item => {
        if(item.trim().startsWith("connect.sid")) {
            let key = decodeURIComponent(item.trim().slice(12))
            sessionID = require('cookie-parser').signedCookie(key,"SuperSecretKey123!")
        }
    });
    return sessionID
}
module.exports = {sio}

if (require.main === module) {
    console.log('called directly');
    let sio = new SIO()
}