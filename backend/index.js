const app = require("./lib/app.js")
const httpserver = require("./lib/httpserver.js")
let port = 3000
const server = new httpserver( {app:app, port:port})
server.start()
.catch((error)=>{
    console.log("Failed to start server")
})