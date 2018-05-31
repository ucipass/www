import $ from 'jquery';
window.jQuery = $;
window.$ = $;
import * as sio from './sioclient.js';
import * as navbar from './navbar.js';

window.addEventListener("load", async function(event) {
  let alreadyLoggedIn = await sio.init(window.location.hostname+":"+window.location.port)
  navbar.setup(alreadyLoggedIn)

})