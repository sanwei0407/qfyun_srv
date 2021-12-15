const express = require('express');
const  router = express.Router();

const  Station = require('../model/station')


// 添加 站点
router.post('/add' ,async (req,res)=>{

    let {
            stationName,
            cityName,  
            stationAdd, 
            stationGps, 
       
        }  = req.body;
    
    if(!stationName)  return res.send({success:false,info:'请填写站点名称'})
    if(!cityName)  return res.send({success:false,info:'请填写站点隶属于的城市'}) 
    if(!stationAdd)  return res.send({success:false,info:'请填写站点的地址'}) 
    if(!stationGps) return res.send({success:false,info:'请设置站点gps信息'})

     try {
        await Station.create({
            stationName,
            cityName,  
            stationAdd, 
            stationGps, 
        })
        res.send({success:true,info:'添加成功'})
     } catch(e) {
        res.send({success:false,info:'添加失败'})
     }

})
// 获取全部的 站点信息
router.post('/getAll', async (req,res)=>{

        let { page,limit,stationName,cityName } = req.body;

         page = page || 1; // 当前第几页
         limit = limit || 20; // 单页返回的条数限制

          // 初始化 查询条件      
          let where = {  }
 
          if(stationName)  where.stationName = stationName; // 指定起点城市
          if(cityName) where.cityName = cityName  // // 指定到达城市   
      
          const skip =  (page - 1 ) * limit; // 查询的起点（偏移量）
          try {
            let stations = await Station.find(where,{},{skip,limit}) // 分页查询
            let count = await Station.count(where) // 获取符合条件的总数
            res.send({
              success:true,
              info:'查询成功',
              data:stations,
              count}
            );

          }catch(e){
              console.log(e)
            res.send({success:false,info:'获取失败'})
          }

})

// 获取单个站点信息
router.post('/getOne', async (req,res)=>{

    const { stationId  } = req.body;

    if(!stationId) return res.send({success:false,info:'请传入一个正确的stationId'})

    try{
        const station = await Station.findById(stationId)
        res.send({ success:true,info:'获取成功',data:station })
    }catch(e){

        res.send({success:false,info:'获取失败'})
    }
})

// 修改站点信息

router.post('/edit' ,async (req,res)=>{

  let {
          stationName,
          cityName,  
          stationAdd, 
          stationGps, 
          stationId
      }  = req.body;

  if(!stationId) return res.send({success:false,info:'请传入一个正确的stationId'})

  
  // 初始化 即将要变更数据
   let updateData = {}

   if(stationName)  updateData.stationName = stationName;
   if(cityName)  updateData.cityName = cityName;
   if(stationAdd)  updateData.stationAdd = stationAdd;
   if(stationGps)  updateData.stationGps = stationGps;

   try {
      await Station.findByIdAndUpdate(stationId,updateData)
      res.send({success:true,info:'修改成功'})
   } catch(e) {
      res.send({success:false,info:'修改失败'})
   }

})

// 删除站点的操作
router.post('/del', async (req,res)=>{
  const { id } = req.body;
  
  try{
      await Station.findByIdAndDelete(id);
      res.send({success:true,info:'删除成功'})
  }catch(e){ 
      res.send({success:false,info:'删除失败'})
  }
})


// for admin 
// 获取全部的 站点信息
router.post('/admin/getAll', async (req,res)=>{

  let { page,limit,stationName,cityName } = req.body;

   page = page || 1; // 当前第几页
   limit = limit || 20; // 单页返回的条数限制

    // 初始化 查询条件      
    let where = {  }

    if(stationName)  where.stationName = stationName; // 指定起点城市
    if(cityName) where.cityName = cityName  // // 指定到达城市   

    const skip =  (page - 1 ) * limit; // 查询的起点（偏移量）
    try {
      let stations = await Station.find(where,{},{skip,limit}) // 分页查询
      let count = await Station.count(where) // 获取符合条件的总数
      res.send({
        success:true,
        info:'查询成功',
        data:stations,
        count}
      );

    }catch(e){
        console.log(e)
      res.send({success:false,info:'获取失败'})
    }

})

module.exports = router;