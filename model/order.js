// 线路表
const mongoose = require('mongoose')


// 需要在使用mongoose.Schema 对于这个表的对应指定进行声明
var orderSchema = mongoose.Schema({
        uid: String,        // 哪个用户的订单
        phone: String,      // 当前订单的联系电话
        startCity: String,  // 起点城市
        arriveCity: String, // 到达城市
        startStationId: String, // 起点站点id
        arriveStationId: String, // 到达站点id
          // 1 已下单未支付 2 已支付待确认 3 已确认 待核销 4 用户已乘车 5 用户未乘车单已过期 6 用户退票申请中 7用户退票成功 8 用户退票失败 9 取消
        orderState: Number, 
        payAt: Date, // 用户支付时间
        ip: String , // 用户下单的时候的ip
        orderDate: Date, // 订单的乘车时间
        checkDate: Date, // 乘车时的验票时间
        linkMan: Array , // 当前订单的乘车人
        amount: Number, // 订单总金额 （以分为单位）
});




// mongoose.model(对应的是我们的数据库中哪个表，表的描述)
var Order = mongoose.model('order', orderSchema);


module.exports = Order;

