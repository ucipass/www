import $ from 'jquery';
window.jQuery = $;
window.$ = $;
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import bootstrap from 'bootstrap';
import moment from 'moment';
import * as sio from '../sioclient.js';
import * as navbar from '../navbar.js';
import JSONData from '../jsondata.js';
import echarts from 'echarts';
import 'select2';                       // globally assign select2 fn to $ element
import 'select2/dist/css/select2.css';  // optional if you have css loader
import { resolve } from 'path';
window.Dropzone = require('dropzone');
const uploadName = "clientuploads"


window.addEventListener('load', async function(){
    let alreadyLoggedIn = await sio.init(window.location.hostname+":"+window.location.port)
    navbar.setup(alreadyLoggedIn)
    //await new Promise(resolve => setTimeout(resolve, 1000));
  
    // Refresh when modal is closed
    $('#modalUploadForm').on('hidden.bs.modal', function (e) {
      location.reload();
   })   

    var previewNode = document.querySelector("#template");
    previewNode.id = "";
    var previewTemplate = previewNode.parentNode.innerHTML;
    previewNode.parentNode.removeChild(previewNode);
    
    var myDropzone = new Dropzone(document.body, { // Make the whole body a dropzone
      url: "/files/upload", // Set the url
      paramName: uploadName,
      maxFilesize: 20000, //20Gbyte
      thumbnailWidth: 80,
      thumbnailHeight: 80,
      parallelUploads: 2,
      previewTemplate: previewTemplate,
      autoQueue: false, // Make sure the files aren't queued until manually added
      previewsContainer: "#previews", // Define the container to display the previews
      clickable: ".fileinput-button" // Define the element that should be used as click trigger to select files.
    });
    
    myDropzone.on("addedfile", function(file) {
      // Hookup the start button
      file.previewElement.querySelector(".start").onclick = function() { myDropzone.enqueueFile(file); };
    });
    
    // Update the total progress bar
    myDropzone.on("totaluploadprogress", function(progress) {
      document.querySelector("#total-progress .progress-bar").style.width = progress + "%";
    });
    
    myDropzone.on("sending", function(file) {
      // Show the total progress bar when upload starts
      document.querySelector("#total-progress").style.opacity = "1";
      // And disable the start button
      file.previewElement.querySelector(".start").setAttribute("disabled", "disabled");
    });
    
    // Hide the total progress bar when nothing's uploading anymore
    myDropzone.on("queuecomplete", function(progress) {
      document.querySelector("#total-progress").style.opacity = "0";
    });
    
    // Setup the buttons for all transfers
    // The "add files" button doesn't need to be setup because the config
    // `clickable` has already been specified.
    document.querySelector("#startall").onclick = function() {
      myDropzone.enqueueFiles(myDropzone.getFilesWithStatus(Dropzone.ADDED));
    };
    document.querySelector("#cancelall").onclick = function() {
      myDropzone.removeAllFiles(true);
    };

    var ioData = new JSONData("test","files",{cmd:"dirlist"});
    window.deleteFile = function(element){
        let file = $( element ).attr( "id" )
        console.log("DELETE", file)
        var ioData = new JSONData("test","files",{cmd:"delete", file:file});
        ioData.post((msg)=>{
            console.log("DELETE REPLY:",msg)
            window.location.reload(true)
        })
    }
    ioData.post((msg)=>{
        let json = JSON.parse(msg).json.data.attributes.dirlist
        json.forEach(file => {
            var filename = file.name.replace(/^.*[\\\/]/, '')
            $("#filetable").append(`
            <tr>
            <th scope="row"><a href="${file.name}">${filename}</a></th>
            <td >${file.size}</td>
            <td >${file.mtime}</td>
            <td >${file.mtime}</td>
            <td ><button id="${file.name}" class="btn btn-danger" onclick="window.deleteFile(this)"   >Delete</button></td>
            </tr>
            `);           
        });
    })
})