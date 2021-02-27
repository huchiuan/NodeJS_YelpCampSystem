const express =require('express');
const router = express.Router();
const passport=require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');


router.get('/register',(req,res)=>{
    res.render('users/register') //導向EJS
})
router.post('/register',catchAsync(async(req,res)=>{
    //res.send(req.body);//{"username":"ss","email":"tusna08124@gmail.com","password":"ww"}
    try{
        const{ email,username,password}=req.body;
        const user =new User ({email,username});
        const registerdUser = await User.register(user,password);  //.register是passport的fun 可以把不用salt的放前面 要加salt的放後面
        //也會用passport 判斷MONGODB 裡面的資料的狀況
        console.log(registerdUser);
        req.flash('success','註冊成功');
        res.redirect('/campgrounds');
    } catch(e){
        req.flash('error',e.message);
        res.redirect('register');
    }
    
   
}))
router.get('/login',(req,res)=>{
   res.render('users/login');
})
router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{ //passport.authenticate是passport提供的middleware 可以身分驗證
   req.flash('success','歡迎回來');
   res.redirect('/campgrounds');
})


module.exports =router;
