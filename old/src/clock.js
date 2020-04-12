import './css/clock.css';
import clockFace from './images/clockFace.png'
import hourHand from './images/hourHand.png'
import minuteHand from './images/minuteHand.png'
import secondHand from './images/secondHand.png'

window.addEventListener("load", function(event) {

  document.getElementById('hourHand').src = hourHand;
  document.getElementById('minuteHand').src = minuteHand;
  document.getElementById('secondHand').src = secondHand;
  document.getElementById("clock").style.backgroundImage = clockFace
  var props = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ')
  var prop
  var el = document.createElement('div');

  for(var i = 0, l = props.length; i < l; i++) {
    if(typeof el.style[props[i]] !== "undefined") {
      prop = props[i];
      break;
    }
  }

  function startClock() {
    var angle = 360/60,
        date = new Date(),
        hour = date.getHours() % 12,
        minute = date.getMinutes(),
        second = date.getSeconds(),
        hourAngle = (360/12) * hour + (360/(12*60)) * minute;

    if(prop) {
        $('#minute')[0].style[prop] = 'rotate('+angle * minute+'deg)';
        $('#second')[0].style[prop] = 'rotate('+angle * second+'deg)';
        $('#hour')[0].style[prop] = 'rotate('+hourAngle+'deg)';
    }
  }

  startClock();

})