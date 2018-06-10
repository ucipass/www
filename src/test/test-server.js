
/************************************************************************
Replies to echo messages valid request:
{
	"data":
	{
		"id":"test",
		"type":"test",
		"attributes":{
			"cmd":"echo"
		}		
	}
}
*************************************************************************/
var name = "test"
var path     = require("path")
var dirHTML  = path.join( require('app-root-path').path, "dist",name)
var dirBIN   = path.join( require('app-root-path').path, "bin")
var log      = require("ucipass-logger")("test")
log.transports.console.level = "error"
var JSONData = require( path.join(dirBIN, "jsondata.js"))
var ioData = new JSONData();
var express = require('express');
var router = express.Router();

router.get( '/'  , (req,res)=>{ res.sendFile(path.join(dirHTML,'index.html'))})

router.post("/", test); 

function test(req, res) {	// All data is posted here with the exception if login

	if (req.body.data){
		ioData.setjson(req.body);
		log.info("RECV:",ioData.id(),ioData.att().cmd);
		log.debug("RECV ATT:",ioData.att());
	}
	else{
		log.error("POST INVALID: ",req.body);
		res.end("INVALID POST received by Nodejs!\n");
		return;
	}
	if (ioData.cmd() === "echo") {
		ioData.json.error = null;
		ioData.json.data.type = ioData.json.data.type+'-reply';
		ioData.json.data.attributes.msg = "This is a reply message from the server";
		log.info('SEND:', ioData.id(),  ioData.cmd(), "reply");
		res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
	}
	else {
		ioData.json.error = "no matching command";
		ioData.json.data.type = ioData.json.data.type+'-nomatch';
		ioData.json.data.attributes.data = null;
		log.error('SEND:', ioData.type(),'ID:',ioData.id()+" ATT:"+ ioData.attributes());
		res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
		return;	
	}

}

module.exports = router;
