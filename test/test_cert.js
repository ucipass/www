var forge = require('node-forge');
var File = require('ucipass-file')
var assert = require('assert')
var fs = require('fs')
var createCert = require('../bin/cert.js')
forge.options.usePureJavaScript = true;

describe('Certificate Test', function(){ 
    after(async ()=>{
        var options = {
            certFilename:       'testcert.crt',
            keyFilename:        'testcert.key',
        }
        let fcrt = new File(options.certFilename)
        let fkey = new File(options.keyFilename)
        await fcrt.unlink()
        await fkey.unlink()
    })
    it("Create Certificate", async function(){
        let resolve,reject
        let p = new Promise((res,rej)=>{resolve=res;reject=rej})
        var options = {
            certFilename:       'testcert.crt',
            keyFilename:        'testcert.key',
        }
        await createCert(options)
        let fcrt = new File(options.certFilename)
        let fkey = new File(options.keyFilename)
        if ( await fcrt.isFile() && await fkey.isFile() ){
            resolve(true)
        }else(
            reject(false)
        )
    })
    it("SSL Server Use", async function(){
        let resolve,reject
        let p = new Promise((res,rej)=>{resolve=res;reject=rej})
        var options = {
            certFilename:       'testcert.crt',
            keyFilename:        'testcert.key',
        }
        await createCert(options)
        var express = require('express');
        var app = express();
        var https = require('https');
        var key = fs.readFileSync('testcert.key');
        var cert = fs.readFileSync( 'testcert.crt' );
        var options = {
            key: key,
            cert: cert
        };
        app.get('/', (request, response) => {
            response.send('Hello from Express!')
        })
        try{
            https.createServer(options, app).listen(8443,(err)=>{
                if (err){
                    console.log(err);
                    reject(err)
                }else{
                    resolve(true)
                }

            });
        }catch(err){
            console.log(err)
            reject(e)
        }
        return p
    })
})