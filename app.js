const express = require('express');
const app = express();


// 跨域 cors
const cors = require('cors')
app.use(cors()); // 解除cors跨域限制

// mongodb 连接
const mongoose = require('./db')  // 把刚才配置的mongoose链接导入

const bodyParser = require('body-parser')
// 针对表单格式传递的post body的参数 application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// 针对的是已json形式 body 传参的  application/json
var jsonParser = bodyParser.json()
app.use(jsonParser)
app.use(urlencodedParser)


// 各个路由的导入
const userRouter = require('./routers/user')   // 用户路由
const orderRouter = require('./routers/order') // 订单路由
const flightRouter = require('./routers/flight') // 航班线路路由
const stationRouter = require('./routers/station') // 站点路由
const linkmanRouter = require('./routers/linkman') // 乘车人路由

const commonRouter = require('./routers/common') // 其他公共业务的路由 



// 前台用户流程
app.use('/api/v1/user', userRouter )
app.use('/api/v1/order', orderRouter)
app.use('/api/v1/flight', flightRouter)
app.use('/api/v1/station', stationRouter)
app.use('/api/v1/linkman', linkmanRouter)
app.use('/api/v1/common', commonRouter )


app.listen(3000,()=>{
    console.log('srv is running at port 3000')
})