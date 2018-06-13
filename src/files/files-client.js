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


window.onload = async function(){
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
}