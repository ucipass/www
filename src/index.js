import $ from 'jquery';
window.jQuery = $;
window.$ = $;
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import bootstrap from 'bootstrap';
import moment from 'moment';
import Draw from './drawchart.js';
import * as sio from './sio.js';
import * as navbar from './navbar.js';
//import './style.css';

window.onload = async function(){
  navbar.setup()
  sio.init(window.location.hostname+":"+window.location.port).then(()=> sio.echo())

  let chartSec = new Draw("chartSec")
  let chartMin = new Draw("chartMin")
}