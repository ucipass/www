import echarts from 'echarts';

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
    set(data){
        this.option.title.text = data.title
        this.option.series[0].data = data.max
        this.option.series[1].data = data.avg
        this.option.series[2].data = data.min
        this.option.xAxis.data = data.labels
        this.chart.setOption(this.option);
    }    
}