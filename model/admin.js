// 后台管理员
const mongoose = require('mongoose')


// 需要在使用mongoose.Schema 对于这个表的对应指定进行声明
var adminSchema = mongoose.Schema({
       name: String ,   // 管理员用户名
       pwd: String  ,   // 管理员密码
       phone: String ,  // 用户手机
       wxOpenId: String , // 单独的记录一个openid方便管理员在微信侧实现免密登录
});


// mongoose.model(对应的是我们的数据库中哪个表，表的描述)
var Admin = mongoose.model('admin', adminSchema);


module.exports = Admin;

