// 乘车人信息表

// 线路表
const mongoose = require('mongoose')


// 需要在使用mongoose.Schema 对于这个表的对应指定进行声明
var linkmanSchema = mongoose.Schema({
        uid: String,        // 管理主用户的uid
        realName: { type: String, require },   // 真实姓名
        idNum: { type: String, require },      // 身份证号码
        phone: { type: String,require  }       // 联系电话    
});



// mongoose.model(对应的是我们的数据库中哪个表，表的描述)
var LinkMan = mongoose.model('linkman', linkmanSchema);

module.exports = LinkMan;

