
var axios = require( 'axios')
var moment = require( 'moment') ;
var _ = require( 'lodash' );

setInterval( ()=>{
    let value = _.random(1,10)
    data = {
        "data":
        {
            "id":"test",
            "type":"test",
            "attributes":{
                "cmd":"log",
                "data": value
            }		
        }
    }
    let url = 'http://localhost:3000/charts'
    axios.post(url, data)
    .then((d)=>{console.log("Post Success:",value,url)})
    .catch((e)=>{console.log("Post Failure:",value,url)})
    
},1000)

