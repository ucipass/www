import $ from 'jquery';
window.jQuery = $;
window.$ = $;
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import bootstrap from 'bootstrap';
import moment from 'moment';
import Draw from './drawchart.js';
import SIO from './sio.js';
import * as navbar from './navbar.js';
//import './style.css';

window.onload = async function(){
    navbar.setup()
    let sio = new SIO('http://localhost:8080')
    await sio.init()
    sio.echo()


    let chartSec = new Draw("chartSec")
    let chartMin = new Draw("chartMin")
  }