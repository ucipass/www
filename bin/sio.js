class SIO{
    constructor(json){
        this.server = json && json.server ? json.server : require("http")
        .createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('Socket.io server');
            res.end();
        })
        .listen(8080,"127.0.0.1",(err)=>{
            let address = this.server.address().address
            let port = this.server.address().port
            console.log("Socket.io is listening on:", address+":"+port+this.path )
        });
        this.path = json && json.path ? json.path : "/socket.io"
        this.datafn = json && json.datafn ? json.datafn : (data)=>{console.log("Unhandled data:",data)}
        this.clients = []
        this.io = require('socket.io')(this.server,{path: this.path})
        this.io.on('connection', (socket) => {
            this.clients.push(socket)
            let lastSocket = socket.id
            console.log('Socket.io user connected',socket.id);
            socket.on('disconnect', ()=>{
                console.log('Socket.io user disconnected with id:',lastSocket);
            })
            socket.on('auth', ( msg , callback )=>{
                try{
                    if(msg.username == "test"){
                        console.log("auth success",msg, new Date())
                        callback(true)
                    }else{
                        console.log("auth fail",msg, new Date())
                        callback(false)
                    }
                }catch(e){
                    console.log("Error with callback on echo")
                    callback(false)
                }
            });
            socket.on('echo', ( msg , callback )=>{
                try{
                    console.log("echo recevied", new Date())
                    callback("echo-reply")
                }catch(e){
                    console.log("Error with callback on echo")
                }
            });
            socket.on("data", this.datafn)
            socket.on('subscribe', (room)=> { 
                console.log('joining room', room.user);
                socket.join(room.user, (err) => {
                    if (err){console.log(err)}
                    else{ console.log( "New Rooms",Object.keys(socket.rooms))}	
                }); 
            })
            socket.on('unsubscribe', (room)=> {  
                console.log('leaving room', room);
                socket.leave(room); 
            })
        })
    }
    logRooms(){
        setInterval(()=>{
            console.log("Rooms:",Object.keys(io.sockets.adapter.rooms).toString())
        },1000)
    }
}

module.exports = SIO

if (require.main === module) {
    console.log('called directly');
    let sio = new SIO()
}