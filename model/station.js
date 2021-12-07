// 站点
const mongoose = require('mongoose')


// 需要在使用mongoose.Schema 对于这个表的对应指定进行声明
var stationSchema = mongoose.Schema({
        stationName: String,    // 站点名称
        cityName: String,       // 隶属于哪个城市
        stationAdd: String,     // 站点地址
        stationGps: Array,      // 站点的gps坐标信息 方便后面我们基于lbs 客户看到距离站点的距离 
});


// mongoose.model(对应的是我们的数据库中哪个表，表的描述)
var Station = mongoose.model('station', stationSchema);


module.exports = Station;

