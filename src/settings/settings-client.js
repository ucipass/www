import * as sio from '../sioclient.js';
import * as navbar from '../navbar.js';
import JSONData from '../jsondata.js'
import * as moment from "moment"

window.onload = async function(){
  let alreadyLoggedIn = await sio.init(window.location.hostname+":"+window.location.port)
  navbar.setup(alreadyLoggedIn)
  let elementName = "settingsForm"
  loadForm(elementName)
  $('#save').click((elem)=>{ saveForm(elementName) })
  $('#refresh').click((elem)=>{ loadForm(elementName) })
}

function loadForm(elementName){
  let form = $(`#${elementName}`)
  var ioData = new JSONData("test","settings",{cmd:"loadSettings"});
  ioData.post(function(msg){
    let json = JSON.parse(msg.data.attributes.form)
    console.log("LOAD",json)
    form.empty();
    for (let key in json){
      let val = `
      <div class="form-group row">
      <label for="${key}" class="col-sm-2 col-form-label">${key}</label>
      <div class="col-sm-10">
        <input type="text" class="form-control" data-settings="keys" id="${key}" placeholder="${json[key]} "value="${json[key]}">
      </div>
      </div>
      `
      form.append(val)
    }
  })

}
function saveForm(elementName){
  let json = {}
  $(`#${elementName} :input`).each(function( index ) {
    //console.log( index + ": " + $( this ).attr("id"),$( this ).val());
    let key = $( this ).attr("id")
    let val = $( this ).val()
    json[key]=val
  });
  console.log("SAVE",json)
  let form = JSON.stringify(json)
  var ioData = new JSONData("test","settings",{cmd:"saveSettings", form:form});
  //console.log("Sent REST ECHO REPLY")
  ioData.post(function(msg){
    console.log("Received REST SAVE REPLY")
  })

  
}
