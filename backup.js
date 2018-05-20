#!node
var path = require('path');
var fs = require('fs');
var archiver = require('archiver');
var archive = archiver('zip');

var dt = new Date()
var dtStr = dt.getFullYear()+ "-" + (dt.getMonth()+1) + "-" + dt.getDate() + "_" + dt.getHours()  + "-" + dt.getMinutes() + "-" + dt.getSeconds() + "." + dt.getMilliseconds()
var backupFileName = path.join(__dirname , 'express_'+ dtStr+'.zip')

var output = fs.createWriteStream(backupFileName);
output.on('close',	() => { console.log('ZIP created:',backupFileName)	});

archive.on('error', (err) => { throw err });
archive.pipe(output);

archive.glob(      path.join(__dirname , '*.js'  ) );
archive.glob(      path.join(__dirname , '*.json') );
archive.directory( path.join(__dirname , 'bin'   ) , 'bin' )
archive.directory( path.join(__dirname , 'public') , 'public' )
archive.directory( path.join(__dirname , 'views' ) , 'views' )
archive.directory( path.join(__dirname , 'db'    ) , 'db' )
archive.directory( path.join(__dirname , 'test'  ) , 'test' )

archive.finalize();

