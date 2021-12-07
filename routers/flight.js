const express = require('express');
const  router = express.Router();

const  Flight = require('../model/flight')


// 添加线路
router.post('/add' ,async (req,res)=>{

    let {
         flightNum,
         startCity,  
         arriveCity, 
         ticketPrice, 
         maxNum ,
         preDay ,
         startStations,
         arriveStations
        }  = req.body;
    
    if(!startCity)  return res.send({success:false,info:'请选择起点城市'})
    if(!arriveCity)  return res.send({success:false,info:'请选择到达城市'}) 
    if(!ticketPrice)  return res.send({success:false,info:'请填写票价'}) 
    if(!startStations) return res.send({success:false,info:'请设置可上车的站点'})
    if(!arriveStations) return res.send({success:false,info:'请设置到达可下车的站点'})

    
    
     if(!flightNum) {
          _d = new Date();
         // 如果没有指定的 航线编号就自动生成一个
         flightNum = 'qf'+   _d.getFullYear() + ( _d.getMonth() +1 ) + Date.now();

     }    
     maxNum =  maxNum || 30;
     preDay = preDay || 15;

     try {
        await Flight.create({
            flightNum,
            startCity,  
            arriveCity, 
            ticketPrice, 
            maxNum ,
            preDay ,
            startStations,
            arriveStations
        })
        res.send({success:true,info:'添加成功'})


     } catch(e) {
        res.send({success:false,info:'添加失败'})
     }

        

})

// 查询所有的航班信息
router.post('/getAll', async (req,res)=>{

        let { sdate,edate,page,limit,startCity,arriveCity ,startStationId,arriveStationId } = req.body;
        
        if(!startCity)  return res.send({success:false,info:'请选择起点城市'})
        if(!arriveCity)  return res.send({success:false,info:'请选择到达城市'})
       
         page = page || 1; // 当前第几页
         limit = limit || 20; // 单页返回的条数限制

          // 初始化 查询条件      
          let where = {  }
          // 设置了起始时间
          if(sdate && !edate )  where.createdAt = { $gt: sdate }
          // 设置了终点时间
          if(!sdate && edate )  where.createdAt = { $lt: edate }
          // 有起止时间
          if(sdate && edate )  where.createdAt = { $and: [ 
                                                            { $gt:sdate},
                                                             {$lt:edate } 
                                                    ] 
                                                  }
          if(startCity)  where.startCity = startCity; // 指定起点城市
          if(arriveCity) where.arriveCity = arriveCity  // // 指定到达城市   
          // 指定起点站点
          if(startStationId) where.startStations = { $in:startStationId } 
          // 指定到达站点
          if(arriveStationId) where.arriveStations = { $in: arriveStationId }
          
          const skip =  (page - 1 ) * limit; // 查询的起点（偏移量）
          try {
            let fights = await Flight.find(where,{},{skip,limit}) // 分页查询
            let count = await Flight.count(where) // 获取符合条件的总数
            res.send({success:true,info:'查询成功',data:fights,count});
          }catch(e){
              console.log(e)
            res.send({success:false,info:'获取失败'})
          }

})

// 查询单个航班详情
router.post('/getOne', async (req,res)=>{

    const { flightNum  } = req.body;

    if(!flightNum) return res.send({success:false,info:'请传入一个正确的flighNum'})

    try{
        const flight = await Flight.findOne({flightNum})


      res.send({ success:true,info:'获取成功',data:flight })

    }catch(e){

        res.send({success:false,info:'获取失败'})
    }
})


module.exports = router;