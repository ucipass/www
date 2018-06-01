
/************************************************************************


Replies to log messages valid request:
{
	"data":
	{
		"id":"test",
		"type":"test",
		"attributes":{
			"cmd":"log"
			"data":1
		}		
	}
}

*************************************************************************/
var name = "charts"
var path     = require("path")
var dirHTML  = path.join( require('app-root-path').path, "dist",name)
var dirBIN   = path.join( require('app-root-path').path, "bin")
var log      = require( path.join( dirBIN,"logger.js"  ))("chart")
var JSONData = require( path.join( dirBIN,'jsondata.js'));
var ioData = new JSONData();
var express = require('express');
var router = express.Router();
const Mychart = require('ucipass-chart')
var chart = new Mychart("sensor")
var moment = require("moment")

router.get( '/'  , (req,res)=>{ res.sendFile(path.join(dirHTML,'index.html'))})

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

	if (ioData.cmd() === "log") {
		console.log(ioData.att().data)
		chart.log(ioData.att().data, moment())
		ioData.json.error = null;
		ioData.json.data.type = ioData.json.data.type+'-reply';
		ioData.json.data.attributes.msg = "This is a reply message from the server";
		log.info('SEND:', ioData.id(),  ioData.cmd(), "reply");
		res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
	}
	else if (ioData.cmd() === "getdata") {
		let msg = {}
		msg.json = chart.getChartSecond()
		msg.json_mins_60 = chart.getChartMinute()
		msg.json_hours_60 = chart.getChartHour()
		msg.json_days_60 = chart.getChartDay()
		msg.json_weeks_60 = chart.getChartWeek()
		ioData.json.data.attributes.data = msg;
		ioData.json.data.type = ioData.json.data.type+'-reply';
		ioData.json.error = null;
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
