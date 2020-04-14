const dbclient = require("./lib/mongooseclient.js")
new Promise( async (resolve, reject) => {
    setTimeout( ()=> {
        return(reject(new Error("db connect timeout")))
    }, 1000)
    return dbclient()
    .then(resolve)
    .catch(error => {
        reject(error)
    })
})
.then(()=> { 
    const app = require("./lib/app.js")
    const httpserver = require("./lib/httpserver.js")
    const port = 3001
    const server = new httpserver( {app:app, port:port})   
    return server.start()
})
.catch((error)=>{
    console.log("Failed to start server",error.message)
})