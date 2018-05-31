
/************************************************************************
This Library processes and responds to ioData database requests
type:	value defines sqlite3 database name without .db extenstions 
id:		user id
attributes: abbreviated by (att) includes all the data
att.cmd:			ioData command like 'get_dbnames'
att.dbname:			database name
att.tablename:		table name
att.data.table:		Array of Array of unformatted table with the data
att.data.columns:	Array Column header names
att.data.oldRow:	Array old row to be updated or deleted
att.data.newRow:	Array new row to be updated or inserted(replace)
att.filter.col:		Array Column filter strings used with like '%att.filter.col#'
att.filter.not:		boolean for NOT like '%att.filter.col#'
att.filter.limit:	String for limiting the results
*************************************************************************/
var path    = require("path")
var dir     = path.join( require('app-root-path').path, "dist","charts")
var log = require("./logger.js")("chart")
var JSONData = require('./jsondata.js');
var ioData = new JSONData();
var express = require('express');
var router = express.Router();

router.get( '/'  , (req,res)=>{ res.sendFile(path.join(dir,'index.html'))})

router.post("/", charts); 

function charts(req, res) {	// All data is posted here with the exception if login

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
	
	if (ioData.cmd() === "blablbslablbal") {

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


exports.router = router;
