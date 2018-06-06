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

// GLOBALS
var chartSec
var chartMin
var chartHour
var chartDay
var chartWeek 

window.onload = async function(){
    $('#chartForm').on('submit', function(event){event.preventDefault()})
    $('#chartSelect').on('select2:select', fnChartSelect)
    $('#chartRefresh').on('click', fnChartRefresh)
    chartSec = new Draw("chartSec")
    chartMin = new Draw("chartMin")
    chartHour = new Draw("chartHour")
    chartDay = new Draw("chartDay")
    chartWeek = new Draw("chartWeek")
    getChartList().then(getChart)
    let alreadyLoggedIn = await sio.init(window.location.hostname+":"+window.location.port)
    navbar.setup(alreadyLoggedIn)
    setInterval(()=>{getChartList().then(getChart)},5000)
}
function fnChartSelect (e) {
    console.log("Selected chart:",e.params.data.text);
    getChart()
};
function fnChartRefresh(e) {
    getChartList().then(getChart)
};
async function getChartList(){
    return new Promise((resolve,reject)=>{
        try {
            var ioData = new JSONData("test","charts",{cmd:"getcharts"});
            ioData.post(function(msg){
                console.log("Received REST CHART REPLY",msg)
                $("#chartSelect").select2({data: msg.data.attributes.data});
                resolve(true)
            })
        } catch (error) {
            console.log("GETCHARTS ERROR",error)
            reject(error)
        }
    })
}
async function getChart (){
    return new Promise((resolve,reject)=>{
        try {
            let currentChart = $('#chartSelect').val();
            var ioData = new JSONData("test","charts",{cmd:"getdata", logname:currentChart});
            console.log("Sent REST ECHO REPLY")
            ioData.post(function(msg){
                console.log("Received REST CHART REPLY")
                chartSec.set(msg.data.attributes.data.sec)
                chartMin.set(msg.data.attributes.data.min)  
                chartHour.set(msg.data.attributes.data.hour)  
                chartDay.set(msg.data.attributes.data.day)  
                chartWeek.set(msg.data.attributes.data.week)
                resolve(true)
            })   
        } catch (error) {
            console.log("DRAWCHART ERROR",error)
            reject(error)
        }
    })
     
}
export default class Draw {
  constructor(divID,options){
      this.element = document.getElementById(divID);
      this.chart = echarts.init(this.element);
      this.option = {
          title: { text: "" },
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
      this.option.title.text = msg.name + " - " + msg.format
      this.option.series[0].data = arrMax
      this.option.series[1].data = arrAvg
      this.option.series[2].data = arrMin
      this.option.xAxis.data = arrLabel
      this.chart.setOption(this.option);
  }    
}