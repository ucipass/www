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
var refresh

window.onload = async function(){
    $('#chartForm').on('submit', function(event){event.preventDefault()})
    $('#chartSelect').on('select2:select', fnChartSelect)
    $('#refreshSelect').on('select2:select', fnChartRefresh)
    $("#refreshSelect").select2({
        placeholder: "Refresh Rate",
        allowClear: true
    });
    chartSec = new Draw("chartSec")
    chartMin = new Draw("chartMin")
    chartHour = new Draw("chartHour")
    chartDay = new Draw("chartDay")
    chartWeek = new Draw("chartWeek")
    getChartList().then(getChart)
    let alreadyLoggedIn = await sio.init(window.location.hostname+":"+window.location.port)
    navbar.setup(alreadyLoggedIn)
    }
function fnChartSelect (e) {
    console.log("Selected chart:",e.params.data.text);
    getChart()
};
function fnChartRefresh(e) {
    clearInterval(refresh)
    let ms = parseInt(e.params.data.id)*1000
    refresh = setInterval( ()=>{ getChart() }, ms)
};
async function getChartList(){
    return new Promise((resolve,reject)=>{
        try {
            var ioData = new JSONData("test","charts",{cmd:"getcharts"});
            ioData.post(function(msg){
                console.log("Received REST CHART REPLY",msg)
                msg.data.attributes.data.unshift({text: "", id: ""})
                console.log(msg)
                $("#chartSelect").select2({
                    placeholder: "Charts",
                    allowClear: true,
                    width: 'resolve',
                    data: msg.data.attributes.data
                });
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
            console.log("Sent Chart Request")
            ioData.post(function(msg){
                console.log("Received Chart Data")
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
          tooltip: { trigger: 'axis'        },
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
          yAxis: {
              min:'dataMin',
              max:'dataMax'
          },
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
        if       ( element.label && msg.formatName == "seconds"){
            let time = moment(element.label, msg.format).format("MMM/DD HH:mm:ssA")
            arrLabel.push(time)
        }else if ((element.label && msg.formatName == "minutes")){
            let time = moment(element.label, msg.format).format("MMM/DD HH:mmA")
            arrLabel.push(time)
        }else if ((element.label && msg.formatName == "hours")){
            let time = moment(element.label, msg.format).format("MMM/DD HH:00A")
            arrLabel.push(time)
        }else if ((element.label && msg.formatName == "days")){
            let time = moment(element.label, msg.format).format("YYYY/MMM/DD")
            arrLabel.push(time)
        }else if ((element.label && msg.formatName == "weeks")){
            let time = moment(element.label, msg.format).format("YYYY/MMM/DD")
            arrLabel.push(time)
        }else if ((element.label)){
            arrLabel.push(element.label)
        }else{
            arrLabel.push("")
        }
        arrAvg.push(element.avg)
        arrMax.push(element.max)
        arrMin.push(element.min)          
      });
      this.option.title.text = msg.name + " - " + msg.formatName
      this.option.series[0].data = arrMax
      this.option.series[1].data = arrAvg
      this.option.series[2].data = arrMin
      this.option.xAxis.data = arrLabel
      this.option.yAxis.min = Math.floor(msg.minset)
      this.option.yAxis.max = Math.ceil(msg.maxset)
      this.chart.setOption(this.option);
  }    
}