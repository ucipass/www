<template>
  <div class="experiment">
    <div class="wrapper">
      <div id="experiment">
        <div id="clock" style="backgroundImage: Clock/clockFace.png;">
          <div id="hour" >
            <img 
              id="hourHand" 
              src="Clock/hourHand.png" 
              :style='hourStyle'
            />
          </div>
          <div id="minute" >
            <img 
              id="minuteHand" 
              src="Clock/minuteHand.png" 
              :style='minStyle'
            />
          </div>
          <div id="second" >
            <img 
              id="secondHand" 
              src="Clock/secondHand.png" 
              :style='secStyle'
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { setTimeout } from 'timers';
import { Promise } from 'q';

export default {
  name: "Clock",
  props: {
    msg: String
  },
  data: function(){
    return{
      prop: null,
      transformStyle: null,
      clockReady: new Promise.resolve(), 
      hour: 0,
      minute: 0,
      second: 0,
      hourTransition: 0,
      hourDegree: 0,
      minTransition: 0,
      minDegree: 0,
      secTransition: 0,
      secDegree: 0
    }
  },
  methods:{
    async clockStart() {
      var props = "transform WebkitTransform MozTransform OTransform msTransform".split(" ");
      var el = document.createElement("div");

      for (var i = 0, l = props.length; i < l; i++) {
        if (typeof el.style[props[i]] !== "undefined") {
          this.transformStyle = props[i];
          break;
        }
      }

      await this.clockReset(3)
      setInterval(() => {
        let date = new Date()
        let second = date.getSeconds()
        if (second == 0){
          this.clockReset()
        }
      }, 600);
    },
    async clockReset(transitionTimeParam){
      let additionalWait = 0.1 // Cannot be 0 to allow transition to happen
      let initialTransition = transitionTimeParam ? transitionTimeParam : 0
      let date = new Date() 
      date.setSeconds(date.getSeconds()+initialTransition+additionalWait)
      let hour = date.getHours() % 12
      let minute = date.getMinutes()
      let second = date.getSeconds()
      let msecond = date.getMilliseconds()
      let hourAngle = (360 / 12) * hour + (360 / (12 * 60)) * minute
      let minAngle = (360 / 60) * minute +  (360/60) * ( second/60)
      let secAngle = (360 / 60) * (second + msecond/1000) 
      this.secDegree = secAngle
      this.secTransition = initialTransition
      this.minDegree = minAngle
      this.minTransition = initialTransition
      this.hourDegree = hourAngle
      this.hourTransition = initialTransition
      await new Promise(resolve => setTimeout(resolve, (initialTransition + additionalWait)*1000))
      this.secDegree = 360
      this.secTransition = 60 - second
      this.minDegree = 360
      this.minTransition = (60 - minute) * 60
      console.log()
    }
  },
  computed: {
    hourStyle(){
      let transition = "transition: transform "+ this.hourTransition.toString() +"s linear;"
      let degree = "transform: rotate("+this.hourDegree.toString()+"deg);"
      let style = transition + degree
      return style
    },
    minStyle(){
      let transition = "transition: transform "+ this.minTransition.toString() +"s linear;"
      let degree = "transform: rotate("+this.minDegree.toString()+"deg);"
      let style = transition + degree
      return style
    },
    secStyle(){
      let transition = "transition: transform "+ this.secTransition.toString() +"s linear;"
      let degree = "transform: rotate("+this.secDegree.toString()+"deg);"
      let style = transition + degree
      return style
    }
    
  },
  mounted() {
    this.clockStart();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.start {
  text-align: center;
  font-size: 2em;
  font-weight: bold;
  margin: 0 0 2em;
}

#clock {
  position: relative;
  width: 378px;
  height: 378px;
  background-image: url("../../public/Clock/clockFace.png");
  margin: 3em auto;
}

#clock div {
  position: absolute;
}

/* The magic */
/* #clock img[src*="second"] {
  -webkit-transition: -webkit-transform 600000s linear;
  -moz-transition: -moz-transform 600000s linear;
  -o-transition: -o-transform 600000s linear;
  -ms-transition: -ms-transform 600000s linear;
  transition: transform 600000s linear;
}

#clock img[src*="second"] {
  -webkit-transform: rotate(3600000deg);
  -moz-transform: rotate(3600000deg);
  -o-transform: rotate(3600000deg);
  -ms-transform: rotate(3600000deg);
  transform: rotate(3600000deg);
}

#clock img[src*="minute"] {
  -webkit-transition: -webkit-transform 360000s linear;
  -moz-transition: -moz-transform 360000s linear;
  -o-transition: -o-transform 360000s linear;
  -ms-transition: -ms-transform 360000s linear;
  transition: transform 360000s linear;
}

#clock img[src*="minute"] {
  -webkit-transform: rotate(36000deg);
  -moz-transform: rotate(36000deg);
  -o-transform: rotate(36000deg);
  -ms-transform: rotate(36000deg);
  transform: rotate(36000deg);
} */

/* #clock img[src*="hour"] {
  -webkit-transition: -webkit-transform 216000s linear;
  -moz-transition: -moz-transform 216000s linear;
  -o-transition: -o-transform 216000s linear;
  -ms-transition: -ms-transform 216000s linear;
  transition: transform 216000s linear;
}

#clock img[src*="hour"] {
  -webkit-transform: rotate(160deg);
  -moz-transform: rotate(160deg);
  -o-transform: rotate(160deg);
  -ms-transform: rotate(160deg);
  transform: rotate(160deg);
} */
</style>
