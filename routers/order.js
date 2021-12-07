const express = require('express');
const  router = express.Router();

const  Order = require('../model/order')
const Flight = require('../model/flight')

// 添加预订单

router.post('/preOrder', async (req,res)=>{



        // uid 不能通过 客户端发送过来 *** 
        // uid 都应该从token当中获取
        const { phone,startCity,arriveCity,startStationId,
        arriveStationId,orderDate,linkMan ,flightNum } = req.body;

        // 数据过滤
        if(!/^1[2-9]\d{9}$/.test(phone)) return res.send({success:false,info:'手机号码有误'})
        if(!startCity)  return res.send({success:false,info:'请选择起点城市'})
        if(!arriveCity)  return res.send({success:false,info:'请选择到达城市'})
        if(!startStationId)  return res.send({success:false,info:'请选择上车站点'})
        if(!arriveStationId)  return res.send({success:false,info:'请选择下车站点'})
        if(!orderDate) return res.send({success:false,info:'请选择出发时间'})
        if(linkMan.length === 0) return res.send({success:false,info:'请添加至少一个乘车人'})

      
        // 暂时我先写死uid = 1      todo 之后补全使用token的方式来获取uid
        const uid = 1 

        // 先查询 航班信息 得到航班信息然后才能计算总价
        const flight = await Flight.findOne({flightNum})
        // linkMan.length 乘车人数量
        const amount =  flight.ticketPrice * linkMan.length;  

        // const ip = req.headers['x-forwarder-for'];
        const ip ='预设的ip地址' // todo

        
        try {
            // 执行入库操作
            await Order.create({
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
            res.send({success:true,info:'添加成功'})
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

          // 暂时我先写死uid = 1      todo 之后补全使用token的方式来获取uid 
          const uid = 1 

          let where = { uid }
          if(sdate && !edate )  where.createdAt = { $gt: sdate }
          if(!sdate && edate )  where.createdAt = { $lt: edate }
          if(sdate && edate )  where.createdAt = { $and: [ 
                                                            { $gt:sdate},
                                                             {$lt:edate } 
                                                    ] 
                                                  }
          const skip =  (page - 1 ) * limit; // 查询的起点（偏移量）
          try {

            let orders = await Order.find(where,{},{skip,limit}) // 分页查询
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



module.exports = router;