
/************************************************************************
UPLOAD FILE TO ./upload directory
*************************************************************************/
var name = "upload"
var path     = require("path")
var fs     = require("fs")
var dirHTML  = path.join( require('app-root-path').path, "dist",name)
var dirBIN   = path.join( require('app-root-path').path, "bin")
var dirUPLOAD   = path.join( require('app-root-path').path, "upload")
var log      = require("ucipass-logger")()
var JSONData = require( path.join(dirBIN, "jsondata.js"))
var ioData = new JSONData();
var express = require('express');
var router = express.Router();
const fileUpload = require('express-fileupload');
if (!fs.existsSync(dirUPLOAD)){ fs.mkdirSync(dirUPLOAD);}

router.use(fileUpload());
router.get( "/"    , (req,res)=>{ 
	res.sendFile(path.join(dirHTML,'index.html'))
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
