// 线路表
const mongoose = require('mongoose')


// 需要在使用mongoose.Schema 对于这个表的对应指定进行声明
var flightSchema = mongoose.Schema({
        flightNum: String,     // 线路编号  
        startCity: String,     // 起点城市
        arriveCity: String,    // 到达城市
        ticketPrice: Number,   // 票价  以分为单位 显示给客户看的时候就要非常注意 价格的转换
        maxNum: Number,        //  最大的售票数量
        preDay: Number ,       //  最长的预售天数
        startStations: Array,  //  起点城市允许上车的站点
        arriveStations:Array, // 终点城市允许下车的站点 
        startTime: String      // 出发时间
},{
        timestamps:true
});


// mongoose.model(对应的是我们的数据库中哪个表，表的描述)
var Flight = mongoose.model('flight', flightSchema);


module.exports = Flight;

