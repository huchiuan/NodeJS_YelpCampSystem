const express =require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError');
const Campground=require('../models/campground');
const {campgroundSchema} = require('../schema.js'); //驗證表單用
const{isLoggedIn} = require('../middleware');
const validateCampground=(req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body)//joi的FUN
    if(error){
       const msg=error.details.map(el=> el.message).join(',')//el = each element 每個元素會回傳el.message 再加上,號
       throw new ExpressError(msg,400);
    }else{
       next();
    }
 }
 

router.get('/',catchAsync(async(req,res)=>{
    const campgrounds = await Campground.find({});  //Model.find() 是mongoose裡面的fun 可以去mongodb拿資料 (此頁的yelp-camp，)
    //而yelp-camp有東西是因為在SEEDS裡面建立完成。
    res.render('campgrounds/index',{campgrounds})
 }))
 
 
 router.get('/new',isLoggedIn,(req,res)=>{
     
     res.render('campgrounds/new')
  })
 //下一行到底要不要NEXT?
 router.post('/',isLoggedIn,validateCampground ,catchAsync(async(req,res,next)=>{ // new頁面的function   next是要讓這個rout可以跳到下面的middleeware
   // 用我寫的catchAsync model 包起來 可以再產生錯誤的時候跳到model 呼叫裡面要做的事情
 
    //if(!req.body.campground)throw new ExpressError('非法的資料',400);
    //當此行發生 會觸發catchAsync 丟到 這行router.use((err,req,res,next)=>{
    //但用這航太不方便 要驗證module內的所有的變數
    //所以使用joi套件做驗證
 
    
     console.log(req.body.campground);//{ title: '333333', location: '33322' }
     const campground = new Campground(req.body.campground);
     campground.author=req.user._id;//將建立者的ID存到author
     await campground.save();//moogose的語法
     req.flash('success','成功新增一個campground');
     res.redirect(`/campgrounds/${campground._id}`)//._id 是在DB裡產生的 為了要拿取所以要加_ 代表拿自己的
  
 }))
 
 
 router.get('/:id',catchAsync(async(req,res)=>{
     const campground = await Campground.findById(req.params.id).populate('reviews').populate('author'); 
     //pupulate 可以透過req.params.id把資料繫結再一起
     console.log(campground);
     res.render('campgrounds/show',{campground});
  }))
 
 
  router.get('/:id/edit',isLoggedIn,catchAsync(async(req,res)=>{
     const campground = await Campground.findById(req.params.id);
     res.render('campgrounds/edit',{campground});
  }))
 
  router.put('/:id',isLoggedIn,validateCampground,catchAsync(async(req,res)=>{
     const campground = await Campground.findByIdAndUpdate(req.params.id,{...req.body.campground});
     //const aString = "foo"
     //const chars = [ ...aString ] // [ "f", "o", "o" ]
     console.log(req.body.campground);
     req.flash('success','成功更新物件');
     res.redirect(`/campgrounds/${campground._id}`)
  }))
 
  router.delete('/:id',isLoggedIn,catchAsync(async(req,res)=>{
     const {id} =req.params;
     await Campground.findByIdAndDelete(id);
     req.flash('success','成功刪除一個campground');
     res.redirect('/campgrounds');
  }))

  module.exports = router ;