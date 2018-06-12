
/************************************************************************
UPLOAD FILE TO ./upload directory
*************************************************************************/
var name = "upload"
var path     = require("path")
var fs     = require("fs")
var util = require("util")
var dirHTML  = path.join( require('app-root-path').path, "dist",name)
var dirBIN   = path.join( require('app-root-path').path, "bin")
var dirUPLOAD   = path.join( require('app-root-path').path, "upload")
var log      = require("ucipass-logger")("UPLOAD")
var JSONData = require( path.join(dirBIN, "jsondata.js"))
var ioData = new JSONData();
var express = require('express');
var router = express.Router();
const fileUpload = require('express-fileupload');
if (!fs.existsSync(dirUPLOAD)){ fs.mkdirSync(dirUPLOAD);}
var readir = util.promisify(fs.readdir)
var stat = util.promisify(fs.stat)
router.use(fileUpload());
router.get( "/"    , (req,res)=>{ 
	res.sendFile(path.join(dirHTML,'index.html'))
})
router.post( '/dirlist'  , async (req,res)=>{ 
	let ioData = new JSONData();
	if (req.body.data){
		ioData.setjson(req.body);
		log.debug("RECV:",ioData.id(),ioData.att().cmd);
		log.debug("RECV ATT:",ioData.att());
	}
	else{
		log.error("POST INVALID: ",req.body);
		res.end("INVALID POST received by Nodejs!\n");
		return;
	}
	if (ioData.cmd() === "dirlist") {
		let dirlist = []
		let dir =  await readir(dirUPLOAD)
		for ( let i = 0 ; i< dir.length; i++){
			let file = dir[i]
			let fpath = path.join(dirUPLOAD, file )
			let s =  await stat( fpath)
			if (s.isFile()){
				dirlist.push({name:file,mtime:s.mtime,size:s.size})
			}
		}
		ioData.att().dirlist = dirlist
		res.json(JSON.stringify(ioData))
	}


})
	
router.post('/', function(req, res) {
	if (!req.files)
	  return res.status(400).send('No files were uploaded.');
   
	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	let sampleFile = req.files.sampleFile;
   
	// Use the mv() method to place the file somewhere on your server
	sampleFile.mv( path.join(dirUPLOAD,sampleFile.name), function(err) {
	  if (err)
		return res.status(500).send(err);
	  res.send('File uploaded!');
	});
  });

module.exports = router;
