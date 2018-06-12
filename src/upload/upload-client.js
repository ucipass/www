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
    var ioData = new JSONData("test","upload/dirlist",{cmd:"dirlist"});
    ioData.post(function(msg){
        let json = JSON.parse(msg).json.data.attributes.dirlist
        json.forEach(file => {
            $("#filetable").append(`
            <tr>
            <th scope="row">${file.name}</th>
            <td id='sio-delay'>${file.size}</td>
            <td id='sio-sent'>${file.mtime}</td>
            </tr>
            `);           
        });
    })
}