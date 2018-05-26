import io from 'socket.io-client';

export default class SIO {
    constructor(url){
        this.url = url
        this.socket = null
    }
    init(username,password){
        let resolve,reject
        let p = new Promise((res,rej)=>{resolve = res; reject = rej})
        let lastSocketID = null
        this.socket = io.connect(this.url, {reconnect: true});
        let socket = this.socket
        this.socket.on('connect', function () {
            console.log("socket.io client connected", socket.id);
            resolve(socket)
        });
        this.socket.on('disconnect', function () {
            console.log("socket.io client disconnected", socket.id); 
        });
        return p
    }
    echo(msg){
        msg = msg ? msg : "echo"
        console.log("Sent Echo with message:",msg,"on:",new Date().toISOString())
        this.socket.emit('echo', msg, (reply)=>{
            console.log("Received Echo reply message:",reply,"on:",new Date().toISOString())
        });
    }    
}