import io from 'socket.io-client';

var socket = null;
async function init(url){
    let resolve,reject
    let p = new Promise((res,rej)=>{resolve = res; reject = rej})
    let lastSocketID = null
    socket = io.connect(url, {reconnect: true});
    let lastID = socket.id
    socket.on('connect', function () {
        console.log("socket.io client connected", lastID);
        resolve(socket)
    });
    socket.on('disconnect', function () {
        console.log("socket.io client disconnected", lastID); 
    });
    return p
}

function echo(msg){
    msg = msg ? msg : "echo"
    console.log("Sent Echo with message:",msg,"on:",new Date().toISOString())
    socket.emit('echo', msg, (reply)=>{
        console.log("Received Echo reply message:",reply,"on:",new Date().toISOString())
    });
}

async function auth(username,password){
    let resolve,reject
    let p = new Promise((res,rej)=>{resolve = res; reject = rej})
    socket.emit('auth', {username:username,password:password}, (reply)=>{
        if (reply){
            console.log("Authentication Successful!",new Date().toISOString())
            resolve(true)
        }else{
            console.log("Authentication Failed!",new Date().toISOString())
            resolve(false)
        }
    });
    return p
}


export { init, auth, echo}