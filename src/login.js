import $ from 'jquery';
window.jQuery = $;
window.$ = $;
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import bootstrap from 'bootstrap';
import moment from 'moment';
import * as sio from './sioclient.js';
import * as navbar from './navbar.js';
//import './style.css';

window.onload = async function(){
  let alreadyLoggedIn = await sio.init(window.location.hostname+":"+window.location.port)
  navbar.setup(alreadyLoggedIn)

}