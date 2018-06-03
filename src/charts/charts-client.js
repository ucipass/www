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


window.onload = async function(){
  let alreadyLoggedIn = await sio.init(window.location.hostname+":"+window.location.port)
  navbar.setup(alreadyLoggedIn)

  let chartSec = new Draw("chartSec")
  let chartMin = new Draw("chartMin")
  let chartHour = new Draw("chartHour")
  let chartDay = new Draw("chartDay")
  let chartWeek = new Draw("chartWeek")

  setInterval(()=>{
    var ioData = new JSONData("test","charts",{cmd:"getdata"});
    //console.log("Sent REST ECHO REPLY")
    ioData.post(function(msg){
        console.log("Received REST CHART REPLY"/*,msg*/)
        chartSec.set(msg.data.attributes.data.sec)
        chartMin.set(msg.data.attributes.data.min)  
        chartHour.set(msg.data.attributes.data.hour)  
        chartDay.set(msg.data.attributes.data.day)  
        chartWeek.set(msg.data.attributes.data.week)  
    })
  },2000)
}

export default class Draw {
  constructor(divID,options){
      this.element = document.getElementById(divID);
      this.chart = echarts.init(this.element);
      this.option = {
          title: { text: divID },
          tooltip: {},
          legend: { data: ['Sales'] },
          xAxis: {
              axisLabel: {
                  show: true,
                  //interval: 'auto',    // {number}
                  interval: 0,
                  rotate: 45,
                  margin: 2,
                  //formatter: '{value}',
                  textStyle: {
                      color: 'blue',
                      align: "right",
                      baseline: "top",
                      fontFamily: 'sans-serif',
                      fontSize: 9,
                      fontStyle: 'normal',
                      fontWeight: 'normal'
                  }
              },
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          yAxis: {},
          series: [
              {
                  name: 'Max',
                  type: 'line',
                  data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              },
              {
                  name: 'Avg',
                  type: 'line',
                  data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              },
              {
                  name: 'Min',
                  type: 'line',
                  data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              }
          ]
      }
      this.chart.setOption(this.option);
  }
  set(msg){
      let arrLabel = []
      let arrMax = []
      let arrMin = []
      let arrAvg = []
      msg.data.forEach(element => {
          arrLabel.push(element.label)
          arrAvg.push(element.avg)
          arrMax.push(element.max)
          arrMin.push(element.min)          
      });
      this.option.title.text = msg.name
      this.option.series[0].data = arrMax
      this.option.series[1].data = arrAvg
      this.option.series[2].data = arrMin
      this.option.xAxis.data = arrLabel
      this.chart.setOption(this.option);
  }    
}