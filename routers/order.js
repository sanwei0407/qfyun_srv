const express = require('express');
const  router = express.Router();

const  Order = require('../model/order')
const Flight = require('../model/flight')
const redis = require('../utils/redis') // 引入redis
// 添加预订单

router.post('/preOrder', async (req,res)=>{



        // uid 不能通过 客户端发送过来 *** 
        // uid 都应该从token当中获取
        const { phone,startCity,arriveCity,startStationId,
        arriveStationId,orderDate,linkMan ,flightNum,code } = req.body;

        // 数据过滤
        if(!/^1[2-9]\d{9}$/.test(phone)) return res.send({success:false,info:'手机号码有误'})
        if(!startCity)  return res.send({success:false,info:'请选择起点城市'})
        if(!arriveCity)  return res.send({success:false,info:'请选择到达城市'})
        if(!startStationId)  return res.send({success:false,info:'请选择上车站点'})
        if(!arriveStationId)  return res.send({success:false,info:'请选择下车站点'})
        if(!orderDate) return res.send({success:false,info:'请选择出发时间'})
        if(linkMan.length === 0) return res.send({success:false,info:'请添加至少一个乘车人'})


        // 检验验证码是否正确

        const _code  = await redis.get('code_'+phone)
        if(code!=_code ) return res.send({success:false,info:'短信验证码不正确'})
        
        // 暂时我先写死uid = 1      todo 之后补全使用token的方式来获取uid
        const { uid } = req.decode

        // 先查询 航班信息 得到航班信息然后才能计算总价
        const flight = await Flight.findOne({flightNum})
        // linkMan.length 乘车人数量
        const amount =  flight.ticketPrice * linkMan.length;  

        // const ip = req.headers['x-forwarder-for'];
        const ip = req.ip // todo

        
        try {
            // 执行入库操作
            const order = await Order.create({
                phone,
                startCity,
                arriveCity,
                startStationId,
                arriveStationId,
                orderDate,
                linkMan ,
                flightNum ,
                uid,
                amount,
                ip,
                payAt:null,
                checkDate: null,
                orderState: 1
            })
            res.send({success:true,info:'添加成功', data: order._id})
        }catch(e){
            console.log(e)
            res.send({success:false,info:'添加失败'})

        }

     




})

// 用户查询自己的全部订单

router.post('/getAll', async(req,res)=>{

         let { sdate,edate,page,limit  } = req.body;
         page = page || 1; // 当前第几页
         limit = limit || 20; // 单页返回的条数限制

         let  uid ;
          // 暂时我先写死uid = 1      todo 之后补全使用token的方式来获取uid 
          if(req.decode) uid  = req.decode
     
         

          let where = {  }
          if(uid)  where.uid = uid;
          if(sdate && !edate )  where.createdAt = { $gt: sdate }
          if(!sdate && edate )  where.createdAt = { $lt: edate }
          if(sdate && edate )  where.createdAt = { $and: [ 
                                                            { $gt:sdate},
                                                             {$lt:edate } 
                                                    ] 
                                                  }
          const skip =  (page - 1 ) * limit; // 查询的起点（偏移量）
          try {


            // mongoose的聚合查询  
            let orders = await Order.aggregate([
                {
                  $lookup: // 关联的表
                    {
                      from: "flights", // 外部去关联那个表
                      localField: "flightNum", // 用orderb表当中哪个字段去关联
                      foreignField: "flightNum", // 对应的外键字段
                      as: "flightinfo" //查询出来的结果 别名
                    },
                  
               },
               {
                $match: where // 条件
               },
               {
                   $unwind: '$flightinfo' // 打散查询出来的数组起一个别名 
                },
               {
                $project:{ // 指定查询的字段
                    orderDate:1,  
                    phone: 1,      // 当前订单的联系电话
                    startCity: 1,  // 起点城市
                    arriveCity: 1, // 到达城市
                    startStationId: 1, // 起点站点id
                    arriveStationId: 1, // 到达站点id
                      // 1 已下单未支付 2 已支付待确认 3 已确认 待核销 4 用户已乘车 5 用户未乘车单已过期 6 用户退票申请中 7用户退票成功 8 用户退票失败 9 取消
                    orderState: 1, 
                    payAt: 1, // 用户支付时间
                   
                    orderDate: 1, // 订单的乘车时间
                    checkDate: 1, // 乘车时的验票时间
                    linkMan: 1 , // 当前订单的乘车人
                    amount: 1, // 订单总金额 （以分为单位）
                    // flightinfo:1
                    flightinfo:'$flightinfo' // 在查询出来的数据当中 只把读取数组的第一个并赋值给flightinfo
                }
              
                
              },
              {$limit:limit },//查询五条
              { $skip :skip }
            ])

            // let orders = await Order.find(where,{},{skip,limit}) // 分页查询
            let count = await Order.count(where) // 获取符合条件的总数
            res.send({success:true,info:'查询成功',data:orders,count});
          }catch(e){
              console.log(e)
            res.send({success:false,info:'获取失败'})
          }


})

// 查询单个订单的信息

router.post('/getOne', async(req,res)=>{
    const { orderId } = req.body;
    if(!orderId) return res.send({success:false,info:'请传入orderid'})
    
    try{
        const order = await Order.findById(orderId);
        res.send({ success:true,info:'获取成功',data:order })

    }catch(e){

        res.send({success:false,info:'获取失败'})
    }
})

// 修改订单状态

router.post('/changeOrder', async(req,res)=>{
    const {orderId,state } = req.body;
    if(!orderId) return res.send({success:false,info:'请传入orderid'})
    if(!state) return res.send({success:false,info:'请传入status'})

    try{
        const order = await Order.findById(orderId);
        const { orderState } = order;
        // 不允许修改 当前的状态等于现在状态
        if(state == orderState)  return res.send({success:false,info:'不能修改为当前状态'})

        await Order.findOneAndUpdate({_id:orderId},{ orderState:state })
        res.send({ success:true,info:'修改成功' })

    }catch(e){

        res.send({success:false,info:'修改失败'})
    }
    
})

// 核销订单接口
router.post('/checkOrder', async(req,res)=>{
    const {orderId,pwd } = req.body;
    if(!orderId) return res.send({success:false,info:'请传入orderid'})
    if(!pwd) return res.send({success:false,info:'请传入pwd'})

    const _pwd = 'abcd' // 这里是模拟了一个 存在数据库当中的管理员密码

    if(pwd!=_pwd) return res.send({success:false,info:'密码不正确'})

    try{
        await Order.findByIdAndUpdate(orderId,{ checkDate: new Date(),orderState:4 })

         res.send({ success:true,info:'核销成功' })
    }catch(e){
        console.log(e)
        res.send({success:false,info:'核销失败'})
    }


})


module.exports = router;