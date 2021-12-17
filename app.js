const express = require('express');
const app = express();
const tokenscrect = '123456'

// 跨域 cors
const cors = require('cors')
app.use(cors()); // 解除cors跨域限制

const  jwt = require('jsonwebtoken'); // token的操作  npm i jsonwebtoken

// mongodb 连接
const mongoose = require('./db')  // 把刚才配置的mongoose链接导入

const bodyParser = require('body-parser')
// 针对表单格式传递的post body的参数 application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// 针对的是已json形式 body 传参的  application/json
var jsonParser = bodyParser.json()
app.use(jsonParser)
app.use(urlencodedParser)

// token 中间件  通过中间件的方式 让后面的路由都可以在req当中获取jwt对象来操作token
app.use((req,res,next)=>{
        req.jwt  = jwt;
        next()
})


const checkapi = [
        '/api/v1/order/preOrder',
        // '/api/v1/order/getAll',
        '/api/v1/linkman/add',
        '/api/v1/linkman/getAll'
]

  // 如果请求的地址在检测检测范围以内 就需要对token进行检验
app.use((req,res,next)=>{

    const { url } = req;
  
    console.log('url',url)
    if(checkapi.find(item=> url.startsWith(item) )){
        // 如果是在需要检测的api 就从请求头当中 获取 token
        const token = req.headers['authorization'];
        try{
            // jwt.verify(token,加密的时候使用的密匙) 检验并解密 token
            const decode = jwt.verify(token,tokenscrect)
            // 把解密之后的内容 挂在req对象上 方便后面的路由直接读取
            req.decode = decode
            console.log('decode',decode)
            next()
        } catch {
            res.statusCode = 403
        }
      
    } else {
        next()
    }

})



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