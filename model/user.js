// 用户
const mongoose = require('mongoose')


// 需要在使用mongoose.Schema 对于这个表的对应指定进行声明
var userSchema = mongoose.Schema({
        wxNickName: String,  // 微信昵称
        wxHeadPhoto: String, // 微信头像
        wxInfo: Object,     // 其他的微信返回回来的用户信息
        wxOpenId: String , // 微信用户标识id 每一个公众号或者小程序 用户对于这个平台都会有一个唯一的openid 这个是识别我们用户的主要标识
        phone: String, // 用户手机号码 不需要密码了 登录或者验证用户信息的时候我们使用 短信验证码来实现        
},{
        timestamps: true // 设置为true会自动的帮我们添加及维护两个字段 createdAt  updatedAt
});




// mongoose.model(对应的是我们的数据库中哪个表，表的描述)
var User = mongoose.model('user', userSchema);


module.exports = User;

