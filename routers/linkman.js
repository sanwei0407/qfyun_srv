const express = require('express');
const  router = express.Router();
const LinkMan = require("../model/linkman")

// 添加乘车人
router.post('/add', async (req,res)=>{
    const {  realName,idNum,phone} = req.body;
    if(!realName) return res.send( {success:false,info:'请填写真实姓名'});
    if(!idNum) return res.send( {success:false,info:'请填写身份证号码'});
    if( !/^1[23456789]\d{9}$/.test(phone)  )  return res.send( {success:false,info:'请填写一个正确的手机号码'});
    
   // 暂时我先写死uid = 1      todo 之后补全使用token的方式来获取uid
    const uid = 1 
    // todo 我们需要对用户的 真实姓名和身份证号码进行检验  

    // 添加入库
    try{
        const one = await LinkMan.findOne({ phone }) // 找不到的话返回 null 
        if(one) return res.send({ success:false,info:'当前手机号码已经被占用' })

        await LinkMan.create({
            realName,
            idNum,
            phone,
            uid
        })
        res.send({success:true,info:'添加成功'})

    } catch(e) {
        console.log('e',e)
        res.send( {success:false,info:'未知错误 请于网站管理员联系'});
    }

})

// 修改乘车人信息 只允许修改 手机号码
router.post('/edit',async (req,res)=>{

    const { phone,LinkManId  } = req.body;
    if(!LinkManId) return res.send( {success:false,info:'请填写必要参数'});
    if( !/^1[23456789]\d{9}$/.test(phone)  )  return res.send( {success:false,info:'请填写一个正确的手机号码'});

    // 要修改的数据
    let updateData= { phone }
    // 执行修改
    try{
        await LinkMan.findByIdAndUpdate( LinkManId ,updateData)
        res.send({success:true,info:'修改成功'})
    } catch(e) {
        res.send( {success:false,info:'未知错误 请于网站管理员联系'});
    }

})

// 获取全部的乘车人信息
router.post('/getAll', async(req,res)=>{
   
     // 暂时我先写死uid = 1      todo 之后补全使用token的方式来获取uid
     const uid = 1 

     try{

        const linkmans = await LinkMan.find({
            uid
        })
        res.send({success:true,info:'查询成功',data:linkmans})
     }catch(e){
        res.send( {success:false,info:'未知错误 请于网站管理员联系'});
     }

})

module.exports = router;