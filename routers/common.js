const express = require('express');
const  router = express.Router();

const smsClient = require('../utils/alisms')

const redis = require('../utils/redis') // 引入redis
const axios =require('axios')
const User = require("../model/user")
const appid = 'wx9dd023ad774bc285'
const appsrc = 'fa0fa3827628269b1ab0fad00ebf4306'
const tokenscrect = '123456'
const utils = require('utility');

// 公众号登录
router.get('/wx',async (req,res)=>{
    // 用户授权通过之后 微信浏览器中会跳转的链接  
    const redirurl = encodeURIComponent('http://127.0.0.1:3000/api/v1/common/wxlogin')
    

    const wxurl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirurl}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
 
    res.redirect(wxurl) // 重定向
})


router.get('/wxlogin',async (req,res)=>{
            // 获得一个code 
            const { code} = req.query;
            // 通过code  来获取  access_token 

           let _res = await axios.get(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${appsrc}&code=${code}&grant_type=authorization_code`)


           const { access_token,openid } =_res.data;
           
           let info = await axios.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`)

            // 解构出 昵称和头像
           const {nickname,headimgurl } = info.data;
           // 根据openid 判断用户是否已经存在 如果存在就更新用户信息 如果不存在就注册一个新的用户

           let u = await User.findOne({
            wxOpenId:openid
           })

           if(u){
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

           let token = req.jwt.sign({ wxOpenId:openid,uid:u._id},tokenscrect);

           res.redirect("http://127.0.0.1:3001?token="+token);
})





// 短信的发送
router.post('/sendSms',async (req,res)=>{
  
    const { phone }= req.body;
    if(!/^1[2-9]\d{9}$/.test(phone)) return res.send({sucess:false,info:'请填写手机号码'})
    
    try{

        // 先判断是否已经有验证码发出
        const _code = await redis.get('code_'+phone);
        if(_code)  return   res.send({ success:true,code: _code, info:'已经发送请耐心等待' })

        // 生成随机的4位数
        
        const randomstr =  utils.randomString(4, '1234567890')

        let _res = await smsClient.sendSMS({
            PhoneNumbers: phone,           // 手机号码
            SignName: '三微智能',          // 短信签名
            TemplateCode: 'SMS_193786026', // 短信模板
            TemplateParam: '{"code":"'+ randomstr + '"}' //  {"code": 要发送的验证码 }
        },{method:'POST'})
    
        let {Code}=_res
        if (Code === 'OK') {
            //处理返回参数 redis当中保存当前的短信和用户关联
            // redis.set(key,val,'EX',过期时间单位是秒)
            redis.set('code_'+phone,randomstr,'EX',3000)
            res.send({ success:true,code: randomstr , })
        }
    }catch(e){

        console.log(e)
        res.send('no ok')
    }
  

})


module.exports = router;