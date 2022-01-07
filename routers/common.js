const express = require('express');
const  router = express.Router();
const smsClient = require('../utils/alisms')  // 引用配置号的aliyun短信sdk
const redis = require('../utils/redis') // 引入redis
const axios =require('axios') // 发起请求使用的类库  npm i axios 
const User = require("../model/user")
const Flight = require("../model/flight")

//https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index
// 从上面的链接进入就可以申请一个测试使用的 微信公众号 appid
// 同学你们一定要更换为你们自己的 appid 和 screct不然会得不到结果
const appid = 'wx9dd023ad774bc285'
const appsrc = 'fa0fa3827628269b1ab0fad00ebf4306'

const tokenscrect = '123456' // 一般而言这个密匙是只有开发人员知道的

const utils = require('utility');  // 通用工具类 npm i utility  用它来生成随机的字符

// 公众号登录
router.get('/wx',async (req,res)=>{
    // 用户授权通过之后 微信浏览器中会跳转的链接  
    const redirurl = encodeURIComponent('http://127.0.0.1:3000/api/v1/common/wxlogin')
    
    const wxurl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirurl}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
 
    res.redirect(wxurl) // 重定向
})

// 处理用户跳转 之后的回来的业务
router.get('/wxlogin',async (req,res)=>{
            // 获得一个code 
            const { code} = req.query;
            // 通过code  来获取  access_token 

         

           let _res = await axios.get(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${appsrc}&code=${code}&grant_type=authorization_code`)


           // 通过code 拉取的信息当中 access_token是为了得到下面要使用的的访问口令
           // openid 是一个用户对于我们账号在微信体系内的唯一辨识id
           const { access_token,openid } =_res.data;
           
           let info = await axios.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`)

           console.log(info.data)
            // 解构出 昵称和头像
           const {nickname,headimgurl } = info.data;

           // 根据openid 判断用户是否已经存在 如果存在就更新用户信息 如果不存在就注册一个新的用户

           let u = await User.findOne({
            wxOpenId:openid
           })

           if(u){
               // 因为微信的用户经常更换头像和昵称 为了更好的用户体验我们一般都会主动的去更新用户信息
               u.update({
                    wxNickName:nickname,
                    wxHeadPhoto:headimgurl
                })
           } else {
               // 如果没有该用户就需要新注册一个用户
               u =  await User.create({
                    wxOpenId:openid,
                    wxNickName:nickname,
                    wxHeadPhoto:headimgurl,
                    wxInfo: info.data
               })
           }

           // 想办法在得到这些信息之后 让客户访问到 我们的客户端并且带有一定的用户信息的参数
           // 使用 token 方式传递  ， 内容不会直接暴露 而且方便以后去核实用户请求的合法性

           // jwt.sign({加密的内容},密匙)
           let token = req.jwt.sign({ wxOpenId:openid,uid:u._id},tokenscrect);

           // 调到我们的客户端的首页 
           res.redirect("http://127.0.0.1:3001?token="+token);
})


// 短信的发送
router.post('/sendSms',async (req,res)=>{
  
    const { phone }= req.body;
    if(!/^1[2-9]\d{9}$/.test(phone)) return res.send({sucess:false,info:'请填写手机号码'})
    
    try{

        // 先判断是否已经有验证码发出 避免用户频繁 发送短信
        const _code = await redis.get('code_'+phone);
        if(_code)  return   res.send({ success:true,code: _code, info:'已经发送请耐心等待' })

        // 生成随机的4位数
        
        const randomstr =  utils.randomString(4, '1234567890')

        // 发送短信
        let _res = await smsClient.sendSMS({
            PhoneNumbers: phone,           // 手机号码
            SignName: '三微智能',          // 短信签名
            TemplateCode: 'SMS_193786026', // 短信模板 决定了短信内容
            TemplateParam: '{"code":"'+ randomstr + '"}' //  {"code": 要发送的验证码 }
        },{method:'POST'})
    
        let {Code}=_res

        if (Code === 'OK') {

            //处理返回参数 redis当中保存当前的短信和用户关联
            // redis.set(key,val,'EX',过期时间单位是秒)
            redis.set('code_'+phone,randomstr,'EX',300)
            res.send({ success:true,code: randomstr  })
        }
    }catch(e){

        console.log(e)
        res.send('no ok')
    }
  

})


// 首页热门线路
router.post('/hotline', async (req,res)=>{
        
       let _res = await Flight.find({});

        let _temarr = [];
        
        for(let item of _res){
            let _sc = item.startCity;
            let _ac = item.arriveCity;
            const one = _temarr.find(r=> r.startCity ==_sc && r.arriveCity == _ac);
            if(one) continue;
            _temarr.push({
                startCity:_sc,
                arriveCity:_ac
            })
        }

        res.send({
            sucess:true,
            data:_temarr
        })

        
})

router.post('/mpCode2Info',async (req,res)=>{
    const {JSCODE } = req.body;
    if(!JSCODE) return res.send({success:false,info:'请传入正确的code'});
    const APPID = 'wxc3cfc0e36563db73';
    const SECRET ='84fa407915ff79473ebfdf4b0a0cbe84';
    let _res = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${JSCODE}&grant_type=authorization_code`)

    res.send({success:true,data:_res.data});    

})

module.exports = router;